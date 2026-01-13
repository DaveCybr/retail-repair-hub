import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Employee, TechnicianSkill } from '@/types/database';
import { toast } from 'sonner';

export function useEmployees() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [technicians, setTechnicians] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .order('name');

      if (error) throw error;
      
      const employeesData = data as Employee[];
      setEmployees(employeesData);
      
      // Filter technicians (those with technician role or active status)
      setTechnicians(employeesData.filter(e => e.status === 'active'));
    } catch (error) {
      console.error('Error fetching employees:', error);
      toast.error('Gagal memuat data karyawan');
    } finally {
      setLoading(false);
    }
  };

  const getAvailableTechnicians = () => {
    return technicians.filter(t => 
      t.is_available && 
      !t.is_queue_locked && 
      t.current_workload < t.max_workload
    );
  };

  const getRecommendedTechnician = (skillRequired?: string) => {
    const available = getAvailableTechnicians();
    if (available.length === 0) return null;

    // Sort by workload (ascending) to balance workload
    return available.sort((a, b) => a.current_workload - b.current_workload)[0];
  };

  const updateWorkload = async (id: number, increment: boolean) => {
    try {
      const employee = employees.find(e => e.id === id);
      if (!employee) throw new Error('Employee not found');

      const newWorkload = increment 
        ? employee.current_workload + 1 
        : Math.max(0, employee.current_workload - 1);

      const { error } = await supabase
        .from('employees')
        .update({ current_workload: newWorkload })
        .eq('id', id);

      if (error) throw error;
      await fetchEmployees();
    } catch (error) {
      console.error('Error updating workload:', error);
      throw error;
    }
  };

  const lockQueue = async (id: number, reason: string) => {
    try {
      const { error } = await supabase
        .from('employees')
        .update({ 
          is_queue_locked: true, 
          queue_lock_reason: reason 
        })
        .eq('id', id);

      if (error) throw error;
      toast.warning('Teknisi dikunci dari penerimaan tugas baru');
      await fetchEmployees();
    } catch (error) {
      console.error('Error locking queue:', error);
      throw error;
    }
  };

  const unlockQueue = async (id: number) => {
    try {
      const { error } = await supabase
        .from('employees')
        .update({ 
          is_queue_locked: false, 
          queue_lock_reason: null 
        })
        .eq('id', id);

      if (error) throw error;
      toast.success('Teknisi dapat menerima tugas baru');
      await fetchEmployees();
    } catch (error) {
      console.error('Error unlocking queue:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  return {
    employees,
    technicians,
    loading,
    fetchEmployees,
    getAvailableTechnicians,
    getRecommendedTechnician,
    updateWorkload,
    lockQueue,
    unlockQueue,
  };
}
