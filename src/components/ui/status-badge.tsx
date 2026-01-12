import { cn } from '@/lib/utils';
import { PaymentStatus, ServiceStatus } from '@/types/database';

interface StatusBadgeProps {
  status: PaymentStatus | ServiceStatus | string;
  className?: string;
}

const statusStyles: Record<string, string> = {
  // Payment statuses
  paid: 'badge-success',
  partial: 'badge-warning',
  unpaid: 'badge-error',
  // Service statuses
  pending: 'badge-pending',
  in_progress: 'badge-info',
  completed: 'badge-success',
  cancelled: 'badge-error',
};

const statusLabels: Record<string, string> = {
  paid: 'Paid',
  partial: 'Partial',
  unpaid: 'Unpaid',
  pending: 'Pending',
  in_progress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span className={cn(
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
      statusStyles[status] || 'bg-muted text-muted-foreground border-border',
      className
    )}>
      {statusLabels[status] || status}
    </span>
  );
}
