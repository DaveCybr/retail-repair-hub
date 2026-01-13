import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { 
  ServiceOrder, 
  ServiceItem, 
  ServicePart, 
  ServiceStatus,
  ServiceAssignment,
  AssignmentStatus 
} from '@/types/database';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

interface CreateServiceOrderInput {
  customer_id: string | null;
  description?: string;
  service_items: {
    device_name: string;
    device_serial_number?: string;
    description?: string;
    sla_category?: string;
    technician_id?: number;
  }[];
}

export function useServiceOrders() {
  const { user } = useAuth();
  const [serviceOrders, setServiceOrders] = useState<ServiceOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchServiceOrders = async (filters?: {
    status?: ServiceStatus;
    customerId?: string;
    technicianId?: number;
  }) => {
    try {
      setLoading(true);
      let query = supabase
        .from('service_orders')
        .select(`
          *,
          customer:customers(*),
          service_items(
            *,
            technician:employees(*),
            service_parts(*),
            service_photos(*)
          )
        `)
        .order('created_at', { ascending: false });

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.customerId) {
        query = query.eq('customer_id', filters.customerId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setServiceOrders(data as ServiceOrder[]);
    } catch (error) {
      console.error('Error fetching service orders:', error);
      toast.error('Gagal memuat data service order');
    } finally {
      setLoading(false);
    }
  };

  const createServiceOrder = async (input: CreateServiceOrderInput) => {
    try {
      // Create main service order
      const { data: serviceOrder, error: orderError } = await supabase
        .from('service_orders')
        .insert({
          customer_id: input.customer_id,
          description: input.description || null,
          status: 'pending',
          created_by: user?.id || null,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create service items
      for (const item of input.service_items) {
        // Calculate SLA deadline based on category
        let slaDeadline = null;
        if (item.sla_category) {
          const { data: slaConfig } = await supabase
            .from('sla_configs')
            .select('target_hours')
            .eq('category', item.sla_category)
            .single();
          
          if (slaConfig) {
            const deadline = new Date();
            deadline.setHours(deadline.getHours() + slaConfig.target_hours);
            slaDeadline = deadline.toISOString();
          }
        }

        // Generate QR code for device
        const qrCode = `SVC-${serviceOrder.id.slice(0, 8)}-${Date.now()}`;

        const { data: serviceItem, error: itemError } = await supabase
          .from('service_items')
          .insert({
            service_order_id: serviceOrder.id,
            device_name: item.device_name,
            device_serial_number: item.device_serial_number || null,
            description: item.description || null,
            sla_category: item.sla_category || null,
            sla_deadline: slaDeadline,
            technician_id: item.technician_id || null,
            qr_code: qrCode,
            status: 'pending',
          })
          .select()
          .single();

        if (itemError) throw itemError;

        // Create assignment if technician is specified
        if (item.technician_id) {
          const { error: assignmentError } = await supabase
            .from('service_assignments')
            .insert({
              service_item_id: serviceItem.id,
              technician_id: item.technician_id,
              assigned_by: user?.id || null,
              status: 'pending_approval',
              assignment_reason: 'Penugasan awal saat pembuatan service order',
            });

          if (assignmentError) throw assignmentError;
        }
      }

      toast.success('Service order berhasil dibuat');
      await fetchServiceOrders();
      return serviceOrder as ServiceOrder;
    } catch (error) {
      console.error('Error creating service order:', error);
      toast.error('Gagal membuat service order');
      throw error;
    }
  };

  const updateServiceItemStatus = async (
    itemId: string, 
    status: ServiceStatus,
    options?: { diagnosis?: string; completedAt?: string }
  ) => {
    try {
      const updateData: Record<string, unknown> = { status };
      
      if (options?.diagnosis) {
        updateData.diagnosis = options.diagnosis;
      }
      
      if (status === 'completed') {
        updateData.completed_at = options?.completedAt || new Date().toISOString();
        
        // Check if SLA was breached
        const { data: item } = await supabase
          .from('service_items')
          .select('sla_deadline')
          .eq('id', itemId)
          .single();
        
        if (item?.sla_deadline && new Date() > new Date(item.sla_deadline)) {
          updateData.is_sla_breached = true;
        }
      }

      const { error } = await supabase
        .from('service_items')
        .update(updateData)
        .eq('id', itemId);

      if (error) throw error;

      // Update parent service order status
      await updateParentOrderStatus(itemId);

      toast.success('Status berhasil diperbarui');
      await fetchServiceOrders();
    } catch (error) {
      console.error('Error updating service item status:', error);
      toast.error('Gagal memperbarui status');
      throw error;
    }
  };

  const updateParentOrderStatus = async (serviceItemId: string) => {
    try {
      // Get the service order
      const { data: item } = await supabase
        .from('service_items')
        .select('service_order_id')
        .eq('id', serviceItemId)
        .single();

      if (!item) return;

      // Get all items of this order
      const { data: allItems } = await supabase
        .from('service_items')
        .select('status')
        .eq('service_order_id', item.service_order_id);

      if (!allItems) return;

      // Determine order status
      let orderStatus: ServiceStatus = 'pending';
      const statuses = allItems.map(i => i.status);

      if (statuses.every(s => s === 'completed')) {
        orderStatus = 'completed';
      } else if (statuses.every(s => s === 'cancelled')) {
        orderStatus = 'cancelled';
      } else if (statuses.some(s => s === 'in_progress' || s === 'completed')) {
        orderStatus = 'in_progress';
      }

      await supabase
        .from('service_orders')
        .update({ status: orderStatus })
        .eq('id', item.service_order_id);
    } catch (error) {
      console.error('Error updating parent order status:', error);
    }
  };

  const assignTechnician = async (
    serviceItemId: string, 
    technicianId: number, 
    reason?: string
  ) => {
    try {
      const { error } = await supabase
        .from('service_assignments')
        .insert({
          service_item_id: serviceItemId,
          technician_id: technicianId,
          assigned_by: user?.id || null,
          status: 'pending_approval',
          assignment_reason: reason || 'Penugasan manual',
        });

      if (error) throw error;

      toast.success('Penugasan teknisi berhasil diajukan untuk approval');
      await fetchServiceOrders();
    } catch (error) {
      console.error('Error assigning technician:', error);
      toast.error('Gagal menugaskan teknisi');
      throw error;
    }
  };

  const approveAssignment = async (assignmentId: string) => {
    try {
      const { data: assignment } = await supabase
        .from('service_assignments')
        .select('service_item_id, technician_id')
        .eq('id', assignmentId)
        .single();

      if (!assignment) throw new Error('Assignment not found');

      // Update assignment status
      const { error: assignmentError } = await supabase
        .from('service_assignments')
        .update({
          status: 'approved',
          approved_by: user?.id,
        })
        .eq('id', assignmentId);

      if (assignmentError) throw assignmentError;

      // Update service item with technician
      const { error: itemError } = await supabase
        .from('service_items')
        .update({ technician_id: assignment.technician_id })
        .eq('id', assignment.service_item_id);

      if (itemError) throw itemError;

      toast.success('Penugasan teknisi disetujui');
      await fetchServiceOrders();
    } catch (error) {
      console.error('Error approving assignment:', error);
      toast.error('Gagal menyetujui penugasan');
      throw error;
    }
  };

  const rejectAssignment = async (assignmentId: string, reason: string) => {
    try {
      const { error } = await supabase
        .from('service_assignments')
        .update({
          status: 'rejected',
          rejection_reason: reason,
        })
        .eq('id', assignmentId);

      if (error) throw error;

      toast.success('Penugasan teknisi ditolak');
      await fetchServiceOrders();
    } catch (error) {
      console.error('Error rejecting assignment:', error);
      toast.error('Gagal menolak penugasan');
      throw error;
    }
  };

  const addServicePart = async (serviceItemId: string, part: Omit<ServicePart, 'id' | 'service_item_id' | 'created_at'>) => {
    try {
      const { error } = await supabase
        .from('service_parts')
        .insert({
          service_item_id: serviceItemId,
          product_id: part.product_id,
          product_name: part.product_name,
          quantity: part.quantity,
          price: part.price,
          subtotal: part.subtotal,
        });

      if (error) throw error;

      // Update product stock
      if (part.product_id) {
        const { data: product } = await supabase
          .from('products')
          .select('stock')
          .eq('id', part.product_id)
          .single();

        if (product) {
          await supabase
            .from('products')
            .update({ stock: product.stock - part.quantity })
            .eq('id', part.product_id);
        }
      }

      toast.success('Sparepart berhasil ditambahkan');
      await fetchServiceOrders();
    } catch (error) {
      console.error('Error adding service part:', error);
      toast.error('Gagal menambahkan sparepart');
      throw error;
    }
  };

  const getPendingServices = () => {
    return serviceOrders.filter(o => 
      o.status === 'pending' || o.status === 'in_progress'
    ).length;
  };

  useEffect(() => {
    fetchServiceOrders();
  }, []);

  return {
    serviceOrders,
    loading,
    fetchServiceOrders,
    createServiceOrder,
    updateServiceItemStatus,
    assignTechnician,
    approveAssignment,
    rejectAssignment,
    addServicePart,
    getPendingServices,
  };
}
