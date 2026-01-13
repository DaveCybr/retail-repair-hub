import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Transaction, SaleItem, TransactionDetail, PaymentStatus } from '@/types/database';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

interface CreateTransactionInput {
  customer_id: string | null;
  total_amount: number;
  paid_amount: number;
  payment_status: PaymentStatus;
  notes?: string;
  location?: string;
  project_name?: string;
  is_tempo?: boolean;
  tempo_due_date?: string;
  sale_items: Omit<SaleItem, 'id' | 'transaction_id' | 'created_at'>[];
  transaction_details?: {
    location_name: string;
    description?: string;
    sale_items: Omit<SaleItem, 'id' | 'transaction_id' | 'transaction_detail_id' | 'created_at'>[];
  }[];
}

export function useTransactions() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTransactions = async (filters?: {
    startDate?: string;
    endDate?: string;
    status?: PaymentStatus;
    customerId?: string;
  }) => {
    try {
      setLoading(true);
      let query = supabase
        .from('transactions')
        .select(`
          *,
          customer:customers(*),
          sale_items(*)
        `)
        .order('created_at', { ascending: false });

      if (filters?.startDate) {
        query = query.gte('date', filters.startDate);
      }
      if (filters?.endDate) {
        query = query.lte('date', filters.endDate);
      }
      if (filters?.status) {
        query = query.eq('payment_status', filters.status);
      }
      if (filters?.customerId) {
        query = query.eq('customer_id', filters.customerId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setTransactions(data as Transaction[]);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast.error('Gagal memuat data transaksi');
    } finally {
      setLoading(false);
    }
  };

  const createTransaction = async (input: CreateTransactionInput) => {
    try {
      // Create main transaction
      const { data: transaction, error: txError } = await supabase
        .from('transactions')
        .insert({
          customer_id: input.customer_id,
          total_amount: input.total_amount,
          paid_amount: input.paid_amount,
          payment_status: input.payment_status,
          notes: input.notes || null,
          location: input.location || null,
          project_name: input.project_name || null,
          is_tempo: input.is_tempo || false,
          tempo_due_date: input.tempo_due_date || null,
          created_by: user?.id || null,
        })
        .select()
        .single();

      if (txError) throw txError;

      // Handle detailed transactions (for institutions with rooms)
      if (input.transaction_details && input.transaction_details.length > 0) {
        for (const detail of input.transaction_details) {
          // Create transaction detail
          const { data: txDetail, error: detailError } = await supabase
            .from('transaction_details')
            .insert({
              transaction_id: transaction.id,
              location_name: detail.location_name,
              description: detail.description || null,
              subtotal: detail.sale_items.reduce((sum, item) => sum + item.subtotal, 0),
            })
            .select()
            .single();

          if (detailError) throw detailError;

          // Create sale items for this detail
          if (detail.sale_items.length > 0) {
            const detailSaleItems = detail.sale_items.map(item => ({
              transaction_id: transaction.id,
              transaction_detail_id: txDetail.id,
              product_id: item.product_id,
              product_name: item.product_name,
              cost_price: item.cost_price,
              sell_price: item.sell_price,
              quantity: item.quantity,
              subtotal: item.subtotal,
            }));

            const { error: itemsError } = await supabase
              .from('sale_items')
              .insert(detailSaleItems);

            if (itemsError) throw itemsError;
          }
        }
      } else if (input.sale_items.length > 0) {
        // Create regular sale items (no detail breakdown)
        const saleItems = input.sale_items.map(item => ({
          transaction_id: transaction.id,
          product_id: item.product_id,
          product_name: item.product_name,
          cost_price: item.cost_price,
          sell_price: item.sell_price,
          quantity: item.quantity,
          subtotal: item.subtotal,
        }));

        const { error: itemsError } = await supabase
          .from('sale_items')
          .insert(saleItems);

        if (itemsError) throw itemsError;
      }

      // Update product stock
      for (const item of input.sale_items) {
        if (item.product_id) {
          // Get current stock and update
          const { data: product } = await supabase
            .from('products')
            .select('stock')
            .eq('id', item.product_id)
            .single();
          
          if (product) {
            await supabase
              .from('products')
              .update({ stock: product.stock - item.quantity })
              .eq('id', item.product_id);
          }
        }
      }

      toast.success('Transaksi berhasil disimpan');
      await fetchTransactions();
      return transaction as Transaction;
    } catch (error) {
      console.error('Error creating transaction:', error);
      toast.error('Gagal menyimpan transaksi');
      throw error;
    }
  };

  const addPayment = async (transactionId: string, amount: number, method: string, notes?: string) => {
    try {
      const transaction = transactions.find(t => t.id === transactionId);
      if (!transaction) throw new Error('Transaction not found');

      const newPaidAmount = transaction.paid_amount + amount;
      const newStatus: PaymentStatus = 
        newPaidAmount >= transaction.total_amount ? 'paid' :
        newPaidAmount > 0 ? 'partial' : 'unpaid';

      // Create payment record
      const { error: paymentError } = await supabase
        .from('payments')
        .insert({
          reference_type: 'transaction',
          reference_id: transactionId,
          customer_name: transaction.customer?.name || 'Walk-in',
          amount,
          method,
          notes: notes || null,
          created_by: user?.id || null,
        });

      if (paymentError) throw paymentError;

      // Update transaction
      const { error: updateError } = await supabase
        .from('transactions')
        .update({
          paid_amount: newPaidAmount,
          payment_status: newStatus,
        })
        .eq('id', transactionId);

      if (updateError) throw updateError;

      toast.success('Pembayaran berhasil dicatat');
      await fetchTransactions();
    } catch (error) {
      console.error('Error adding payment:', error);
      toast.error('Gagal mencatat pembayaran');
      throw error;
    }
  };

  const getTodayRevenue = () => {
    const today = new Date().toISOString().split('T')[0];
    return transactions
      .filter(t => t.date === today)
      .reduce((sum, t) => sum + t.paid_amount, 0);
  };

  const getTotalOutstanding = () => {
    return transactions
      .filter(t => t.payment_status !== 'paid')
      .reduce((sum, t) => sum + (t.total_amount - t.paid_amount), 0);
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  return {
    transactions,
    loading,
    fetchTransactions,
    createTransaction,
    addPayment,
    getTodayRevenue,
    getTotalOutstanding,
  };
}
