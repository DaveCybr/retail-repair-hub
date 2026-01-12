// Database types for the POS system

export type PaymentStatus = 'unpaid' | 'partial' | 'paid';
export type ServiceStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';
export type CashFlowType = 'income' | 'expense';
export type EmployeeStatus = 'active' | 'inactive' | 'working';
export type AppRole = 'admin' | 'cashier' | 'technician' | 'manager';

export interface Customer {
  id: string;
  name: string;
  phone: string | null;
  address: string | null;
  email: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProductCategory {
  id: number;
  name: string;
  description: string | null;
  created_at: string;
}

export interface Product {
  id: number;
  name: string;
  category_id: number | null;
  category?: ProductCategory;
  unit: string;
  cost_price: number;
  sell_price: number;
  stock: number;
  min_stock: number;
  serial_number: string | null;
  photo_url: string | null;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Employee {
  id: number;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  status: EmployeeStatus;
  user_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  customer_id: string | null;
  customer?: Customer;
  date: string;
  total_amount: number;
  paid_amount: number;
  payment_status: PaymentStatus;
  notes: string | null;
  location: string | null;
  reference: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  sale_items?: SaleItem[];
}

export interface SaleItem {
  id: number;
  transaction_id: string;
  product_id: number | null;
  product_name: string;
  cost_price: number;
  sell_price: number;
  quantity: number;
  subtotal: number;
  created_at: string;
}

export interface ServiceOrder {
  id: string;
  transaction_id: string | null;
  customer_id: string | null;
  customer?: Customer;
  date: string;
  status: ServiceStatus;
  description: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  service_items?: ServiceItem[];
}

export interface ServiceItem {
  id: string;
  service_order_id: string;
  device_name: string;
  technician_id: number | null;
  technician?: Employee;
  description: string | null;
  diagnosis: string | null;
  labor_cost: number;
  status: ServiceStatus;
  created_at: string;
  updated_at: string;
  service_parts?: ServicePart[];
}

export interface ServicePart {
  id: number;
  service_item_id: string;
  product_id: number | null;
  product_name: string;
  quantity: number;
  price: number;
  subtotal: number;
  created_at: string;
}

export interface Payment {
  id: number;
  reference_type: string;
  reference_id: string;
  customer_name: string | null;
  amount: number;
  date: string;
  method: string;
  notes: string | null;
  created_by: string | null;
  created_at: string;
}

export interface CashFlow {
  id: number;
  type: CashFlowType;
  category: string;
  amount: number;
  date: string;
  description: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

// Cart item for new transactions
export interface CartItem {
  product: Product;
  quantity: number;
  subtotal: number;
}

// Dashboard metrics
export interface DashboardMetrics {
  todayRevenue: number;
  yesterdayRevenue: number;
  totalOutstanding: number;
  pendingServices: number;
  lowStockCount: number;
  todayTransactions: number;
}
