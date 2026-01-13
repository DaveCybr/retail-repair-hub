import { Badge } from '@/components/ui/badge';
import { CustomerCategory, customerCategoryLabels } from '@/types/database';
import { Building, User, Briefcase } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CustomerCategoryBadgeProps {
  category: CustomerCategory;
  className?: string;
}

const categoryIcons = {
  retail: User,
  project: Briefcase,
  institution: Building,
};

const categoryStyles = {
  retail: 'bg-muted text-muted-foreground',
  project: 'bg-info/10 text-info border-info/30',
  institution: 'bg-primary/10 text-primary border-primary/30',
};

export function CustomerCategoryBadge({ category, className }: CustomerCategoryBadgeProps) {
  const Icon = categoryIcons[category];
  
  return (
    <Badge 
      variant="outline" 
      className={cn(categoryStyles[category], 'gap-1', className)}
    >
      <Icon className="w-3 h-3" />
      {customerCategoryLabels[category]}
    </Badge>
  );
}
