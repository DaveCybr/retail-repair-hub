import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Customer, CustomerCategory } from '@/types/database';
import { toast } from 'sonner';

export function useCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('name');

      if (error) throw error;
      setCustomers(data as Customer[]);
    } catch (error) {
      console.error('Error fetching customers:', error);
      toast.error('Gagal memuat data pelanggan');
    } finally {
      setLoading(false);
    }
  };

  const createCustomer = async (customer: Omit<Customer, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .insert({
          name: customer.name,
          phone: customer.phone,
          address: customer.address,
          email: customer.email,
          category: customer.category,
          member_number: customer.member_number,
          notes: customer.notes,
        })
        .select()
        .single();

      if (error) throw error;
      toast.success('Pelanggan berhasil ditambahkan');
      await fetchCustomers();
      return data as Customer;
    } catch (error) {
      console.error('Error creating customer:', error);
      toast.error('Gagal menambahkan pelanggan');
      throw error;
    }
  };

  const updateCustomer = async (id: string, updates: Partial<Customer>) => {
    try {
      const { error } = await supabase
        .from('customers')
        .update({
          name: updates.name,
          phone: updates.phone,
          address: updates.address,
          email: updates.email,
          category: updates.category,
          member_number: updates.member_number,
          notes: updates.notes,
        })
        .eq('id', id);

      if (error) throw error;
      toast.success('Pelanggan berhasil diperbarui');
      await fetchCustomers();
    } catch (error) {
      console.error('Error updating customer:', error);
      toast.error('Gagal memperbarui pelanggan');
      throw error;
    }
  };

  const deleteCustomer = async (id: string) => {
    try {
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Pelanggan berhasil dihapus');
      await fetchCustomers();
    } catch (error) {
      console.error('Error deleting customer:', error);
      toast.error('Gagal menghapus pelanggan');
      throw error;
    }
  };

  const searchCustomers = async (query: string) => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .or(`name.ilike.%${query}%,phone.ilike.%${query}%,member_number.ilike.%${query}%`)
        .order('name')
        .limit(10);

      if (error) throw error;
      return data as Customer[];
    } catch (error) {
      console.error('Error searching customers:', error);
      return [];
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  return {
    customers,
    loading,
    fetchCustomers,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    searchCustomers,
  };
}
