import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { MetricCard } from '@/components/ui/metric-card';
import { StatusBadge } from '@/components/ui/status-badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { formatCurrency, formatDateTime, truncateId } from '@/lib/format';
import { DollarSign, ShoppingCart, Wrench, AlertTriangle, Plus, Receipt } from 'lucide-react';
import { Transaction, ServiceOrder } from '@/types/database';

export default function Dashboard() {
  const [todayRevenue, setTodayRevenue] = useState(0);
  const [pendingServices, setPendingServices] = useState(0);
  const [lowStockCount, setLowStockCount] = useState(0);
  const [totalOutstanding, setTotalOutstanding] = useState(0);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [recentServices, setRecentServices] = useState<ServiceOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      const today = new Date().toISOString().split('T')[0];

      const [
        { data: todayTx },
        { data: pending },
        { data: lowStock },
        { data: outstanding },
        { data: recentTx },
        { data: recentSvc }
      ] = await Promise.all([
        supabase.from('transactions').select('total_amount').eq('date', today),
        supabase.from('service_orders').select('id').in('status', ['pending', 'in_progress']),
        supabase.from('products').select('id').lt('stock', 5),
        supabase.from('transactions').select('total_amount, paid_amount').neq('payment_status', 'paid'),
        supabase.from('transactions').select('*, customers(name)').order('created_at', { ascending: false }).limit(5),
        supabase.from('service_orders').select('*, customers(name)').order('created_at', { ascending: false }).limit(5),
      ]);

      setTodayRevenue(todayTx?.reduce((sum, t) => sum + Number(t.total_amount), 0) || 0);
      setPendingServices(pending?.length || 0);
      setLowStockCount(lowStock?.length || 0);
      setTotalOutstanding(outstanding?.reduce((sum, t) => sum + (Number(t.total_amount) - Number(t.paid_amount)), 0) || 0);
      setRecentTransactions((recentTx || []) as Transaction[]);
      setRecentServices((recentSvc || []) as ServiceOrder[]);
      setLoading(false);
    }

    fetchDashboardData();
  }, []);

  return (
    <MainLayout>
      <PageHeader 
        title="Dashboard" 
        description="Overview of your store performance"
        actions={
          <div className="flex gap-2">
            <Button asChild>
              <Link to="/sales/new">
                <Plus className="w-4 h-4 mr-2" />
                New Sale
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/services/new">
                <Wrench className="w-4 h-4 mr-2" />
                New Service
              </Link>
            </Button>
          </div>
        }
      />

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard
          title="Today's Revenue"
          value={formatCurrency(todayRevenue)}
          icon={DollarSign}
          variant="success"
        />
        <MetricCard
          title="Pending Services"
          value={pendingServices}
          subtitle="Need attention"
          icon={Wrench}
          variant={pendingServices > 0 ? 'warning' : 'default'}
        />
        <MetricCard
          title="Low Stock Items"
          value={lowStockCount}
          subtitle="Below minimum"
          icon={AlertTriangle}
          variant={lowStockCount > 0 ? 'warning' : 'default'}
        />
        <MetricCard
          title="Outstanding"
          value={formatCurrency(totalOutstanding)}
          subtitle="Accounts receivable"
          icon={Receipt}
          variant={totalOutstanding > 0 ? 'info' : 'default'}
        />
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <div className="bg-card rounded-xl border p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Recent Transactions</h2>
            <Link to="/sales/transactions" className="text-sm text-accent hover:underline">View all</Link>
          </div>
          {loading ? (
            <div className="animate-pulse space-y-3">
              {[1,2,3].map(i => <div key={i} className="h-12 bg-muted rounded" />)}
            </div>
          ) : recentTransactions.length === 0 ? (
            <p className="text-muted-foreground text-sm py-4">No transactions yet</p>
          ) : (
            <div className="space-y-3">
              {recentTransactions.map(tx => (
                <div key={tx.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div>
                    <p className="font-medium text-sm">#{truncateId(tx.id)}</p>
                    <p className="text-xs text-muted-foreground">{(tx as Transaction & { customers?: { name: string } }).customers?.name || 'Walk-in'}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-sm">{formatCurrency(tx.total_amount)}</p>
                    <StatusBadge status={tx.payment_status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Services */}
        <div className="bg-card rounded-xl border p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Recent Services</h2>
            <Link to="/services/orders" className="text-sm text-accent hover:underline">View all</Link>
          </div>
          {loading ? (
            <div className="animate-pulse space-y-3">
              {[1,2,3].map(i => <div key={i} className="h-12 bg-muted rounded" />)}
            </div>
          ) : recentServices.length === 0 ? (
            <p className="text-muted-foreground text-sm py-4">No services yet</p>
          ) : (
            <div className="space-y-3">
              {recentServices.map(svc => (
                <div key={svc.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div>
                    <p className="font-medium text-sm">#{truncateId(svc.id)}</p>
                    <p className="text-xs text-muted-foreground">{(svc as ServiceOrder & { customers?: { name: string } }).customers?.name || 'Unknown'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground mb-1">{formatDateTime(svc.date)}</p>
                    <StatusBadge status={svc.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
