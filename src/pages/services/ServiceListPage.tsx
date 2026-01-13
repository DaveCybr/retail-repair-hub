import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useServiceOrders } from '@/hooks/useServiceOrders';
import { ServiceStatus } from '@/types/database';
import { formatCurrency, formatDateTime, formatRelativeTime } from '@/lib/format';
import { 
  Plus, 
  Search, 
  Wrench,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  User,
  Smartphone,
  ChevronRight,
  Timer
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

const statusConfig: Record<ServiceStatus, { label: string; color: string; icon: React.ElementType }> = {
  pending: { label: 'Pending', color: 'bg-amber-100 text-amber-800 border-amber-200', icon: Clock },
  in_progress: { label: 'Dikerjakan', color: 'bg-blue-100 text-blue-800 border-blue-200', icon: Wrench },
  completed: { label: 'Selesai', color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle2 },
  cancelled: { label: 'Dibatalkan', color: 'bg-red-100 text-red-800 border-red-200', icon: XCircle },
};

function ServiceStatusBadge({ status }: { status: ServiceStatus }) {
  const config = statusConfig[status];
  const Icon = config.icon;
  return (
    <Badge variant="outline" className={cn('gap-1', config.color)}>
      <Icon className="w-3 h-3" />
      {config.label}
    </Badge>
  );
}

export default function ServiceListPage() {
  const navigate = useNavigate();
  const { serviceOrders, loading, getPendingServices } = useServiceOrders();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredOrders = serviceOrders.filter(order => {
    const matchesSearch = 
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.service_items?.some(item => 
        item.device_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const pendingCount = serviceOrders.filter(o => o.status === 'pending').length;
  const inProgressCount = serviceOrders.filter(o => o.status === 'in_progress').length;
  const completedCount = serviceOrders.filter(o => o.status === 'completed').length;

  const getSlaStatus = (item: { sla_deadline?: string | null; is_sla_breached?: boolean }) => {
    if (item.is_sla_breached) {
      return { status: 'breached', label: 'SLA Terlewati', color: 'text-destructive' };
    }
    if (!item.sla_deadline) return null;
    
    const deadline = new Date(item.sla_deadline);
    const now = new Date();
    const hoursLeft = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    if (hoursLeft < 0) {
      return { status: 'breached', label: 'SLA Terlewati', color: 'text-destructive' };
    }
    if (hoursLeft < 2) {
      return { status: 'warning', label: `${Math.round(hoursLeft * 60)} menit lagi`, color: 'text-warning' };
    }
    return { status: 'ok', label: `${Math.round(hoursLeft)} jam lagi`, color: 'text-muted-foreground' };
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <PageHeader
          title="Service Order"
          description="Kelola penerimaan dan pengerjaan service"
          actions={
            <Button onClick={() => navigate('/services/new')}>
              <Plus className="w-4 h-4 mr-2" />
              Service Baru
            </Button>
          }
        />

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="card-metric">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Service</p>
                <p className="text-2xl font-bold">{serviceOrders.length}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Wrench className="w-5 h-5 text-primary" />
              </div>
            </div>
          </div>
          <div className="card-metric border-amber-200 bg-amber-50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-amber-600">{pendingCount}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
            </div>
          </div>
          <div className="card-metric border-blue-200 bg-blue-50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Dikerjakan</p>
                <p className="text-2xl font-bold text-blue-600">{inProgressCount}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Wrench className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="card-metric border-green-200 bg-green-50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Selesai</p>
                <p className="text-2xl font-bold text-green-600">{completedCount}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Cari ID, pelanggan, atau device..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Semua Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              {Object.entries(statusConfig).map(([value, config]) => (
                <SelectItem key={value} value={value}>{config.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Service Orders List */}
        <div className="space-y-4">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))
          ) : filteredOrders.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center text-muted-foreground">
                <Wrench className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Tidak ada service order</p>
              </CardContent>
            </Card>
          ) : (
            filteredOrders.map((order) => (
              <Card key={order.id} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">#{order.id.slice(0, 8).toUpperCase()}</h3>
                        <ServiceStatusBadge status={order.status} />
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          {order.customer?.name || 'Walk-in'}
                        </span>
                        <span>{formatDateTime(order.created_at)}</span>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </div>

                  {/* Service Items */}
                  <div className="space-y-3">
                    {order.service_items?.map((item) => {
                      const slaStatus = getSlaStatus(item);
                      return (
                        <div 
                          key={item.id} 
                          className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-background flex items-center justify-center">
                              <Smartphone className="w-5 h-5 text-muted-foreground" />
                            </div>
                            <div>
                              <p className="font-medium">{item.device_name}</p>
                              {item.technician && (
                                <p className="text-sm text-muted-foreground">
                                  Teknisi: {item.technician.name}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            {slaStatus && (
                              <div className={cn("flex items-center gap-1 text-sm", slaStatus.color)}>
                                <Timer className="w-4 h-4" />
                                {slaStatus.label}
                              </div>
                            )}
                            <ServiceStatusBadge status={item.status} />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {order.description && (
                    <p className="mt-4 text-sm text-muted-foreground">
                      {order.description}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </MainLayout>
  );
}
