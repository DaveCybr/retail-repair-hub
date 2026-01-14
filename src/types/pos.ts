// POS System Types

import { Customer, Product, Employee } from './database';

export type TransactionType = 'retail' | 'project';

export interface CartItem {
  id: string;
  product_id: number;
  product_name: string;
  sell_price: number;
  cost_price: number;
  quantity: number;
  subtotal: number;
  location_id?: string; // For project/institution invoices
}

export interface ServiceItemInput {
  id: string;
  device_name: string;
  device_serial?: string;
  description: string;
  diagnosis?: string;
  technician_id?: number;
  technician_name?: string;
  labor_cost: number;
  parts: CartItem[];
  location_id?: string; // For project/institution invoices
  sla_category?: string;
}

export interface LocationDetail {
  id: string;
  name: string;
  description?: string;
  items: CartItem[];
  services: ServiceItemInput[];
  subtotal: number;
}

export interface TransactionDraft {
  customer_id?: string;
  customer?: Customer | null;
  transaction_type: TransactionType;
  is_tempo: boolean;
  tempo_due_date?: string;
  project_name?: string;
  locations: LocationDetail[];
  notes: string;
  payment_method: 'cash' | 'qris' | 'transfer' | 'tempo';
  paid_amount: number;
}

export interface PaymentSummary {
  products_total: number;
  services_total: number;
  grand_total: number;
  paid_amount: number;
  remaining: number;
  status: 'unpaid' | 'partial' | 'paid';
}

// Helper functions
export function calculateLocationSubtotal(location: LocationDetail): number {
  const itemsTotal = location.items.reduce((sum, item) => sum + item.subtotal, 0);
  const servicesTotal = location.services.reduce((sum, service) => {
    const partsTotal = service.parts.reduce((pSum, part) => pSum + part.subtotal, 0);
    return sum + service.labor_cost + partsTotal;
  }, 0);
  return itemsTotal + servicesTotal;
}

export function calculatePaymentSummary(draft: TransactionDraft): PaymentSummary {
  let products_total = 0;
  let services_total = 0;

  draft.locations.forEach(location => {
    products_total += location.items.reduce((sum, item) => sum + item.subtotal, 0);
    services_total += location.services.reduce((sum, service) => {
      const partsTotal = service.parts.reduce((pSum, part) => pSum + part.subtotal, 0);
      return sum + service.labor_cost + partsTotal;
    }, 0);
  });

  const grand_total = products_total + services_total;
  const remaining = grand_total - draft.paid_amount;
  
  let status: 'unpaid' | 'partial' | 'paid' = 'unpaid';
  if (draft.paid_amount >= grand_total && grand_total > 0) {
    status = 'paid';
  } else if (draft.paid_amount > 0) {
    status = 'partial';
  }

  return {
    products_total,
    services_total,
    grand_total,
    paid_amount: draft.paid_amount,
    remaining,
    status
  };
}

export function createEmptyLocation(name: string = 'Default'): LocationDetail {
  return {
    id: crypto.randomUUID(),
    name,
    items: [],
    services: [],
    subtotal: 0
  };
}

export function createEmptyDraft(): TransactionDraft {
  return {
    transaction_type: 'retail',
    is_tempo: false,
    locations: [createEmptyLocation()],
    notes: '',
    payment_method: 'cash',
    paid_amount: 0
  };
}
