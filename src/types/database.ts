// Database types for the POS system

export type PaymentStatus = 'unpaid' | 'partial' | 'paid';
export type ServiceStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';
export type CashFlowType = 'income' | 'expense';
export type EmployeeStatus = 'active' | 'inactive' | 'working';
export type AppRole = 'admin' | 'cashier' | 'technician' | 'manager';
export type CustomerCategory = 'retail' | 'project' | 'institution';
export type AssignmentStatus = 'pending_approval' | 'approved' | 'rejected' | 'reassigned' | 'in_progress' | 'completed';
export type CheckinType = 'start_work' | 'end_work' | 'office_return';

export interface Customer {
  id: string;
  name: string;
  phone: string | null;
  address: string | null;
  email: string | null;
  category: CustomerCategory;
  member_number: string | null;
  notes: string | null;
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

export interface TechnicianSkill {
  id: number;
  employee_id: number;
  skill_name: string;
  proficiency_level: number;
  created_at: string;
}

export interface Employee {
  id: number;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  status: EmployeeStatus;
  user_id: string | null;
  current_workload: number;
  max_workload: number;
  is_available: boolean;
  is_queue_locked: boolean;
  queue_lock_reason: string | null;
  created_at: string;
  updated_at: string;
  skills?: TechnicianSkill[];
}

export interface TransactionDetail {
  id: string;
  transaction_id: string;
  location_name: string;
  description: string | null;
  subtotal: number;
  created_at: string;
  updated_at: string;
  sale_items?: SaleItem[];
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
  project_name: string | null;
  is_tempo: boolean;
  tempo_due_date: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  sale_items?: SaleItem[];
  transaction_details?: TransactionDetail[];
}

export interface SaleItem {
  id: number;
  transaction_id: string;
  transaction_detail_id: string | null;
  product_id: number | null;
  product_name: string;
  cost_price: number;
  sell_price: number;
  quantity: number;
  subtotal: number;
  created_at: string;
}

export interface ServiceAssignment {
  id: string;
  service_item_id: string;
  technician_id: number;
  technician?: Employee;
  assigned_by: string | null;
  approved_by: string | null;
  status: AssignmentStatus;
  assignment_reason: string | null;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
}

export interface ServicePhoto {
  id: string;
  service_item_id: string;
  photo_url: string;
  photo_type: 'before' | 'during' | 'after' | 'proof';
  caption: string | null;
  uploaded_by: string | null;
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
  device_serial_number: string | null;
  qr_code: string | null;
  technician_id: number | null;
  technician?: Employee;
  description: string | null;
  diagnosis: string | null;
  labor_cost: number;
  status: ServiceStatus;
  sla_category: string | null;
  sla_deadline: string | null;
  completed_at: string | null;
  is_sla_breached: boolean;
  created_at: string;
  updated_at: string;
  service_parts?: ServicePart[];
  service_photos?: ServicePhoto[];
  assignments?: ServiceAssignment[];
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

export interface CheckinLog {
  id: string;
  employee_id: number;
  employee?: Employee;
  service_item_id: string | null;
  checkin_type: CheckinType;
  latitude: number | null;
  longitude: number | null;
  location_name: string | null;
  qr_code_data: string | null;
  photo_url: string | null;
  notes: string | null;
  created_at: string;
}

export interface Warranty {
  id: string;
  customer_id: string;
  customer?: Customer;
  service_item_id: string | null;
  product_id: number | null;
  device_name: string;
  serial_number: string | null;
  warranty_start: string;
  warranty_end: string;
  warranty_type: string;
  terms: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SLAConfig {
  id: number;
  category: string;
  target_hours: number;
  priority_level: number;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuditLog {
  id: string;
  user_id: string | null;
  action: string;
  table_name: string;
  record_id: string | null;
  old_data: Record<string, unknown> | null;
  new_data: Record<string, unknown> | null;
  ip_address: string | null;
  created_at: string;
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

// Customer category labels
export const customerCategoryLabels: Record<CustomerCategory, string> = {
  retail: 'Retail',
  project: 'Proyek',
  institution: 'Instansi',
};

// Assignment status labels
export const assignmentStatusLabels: Record<AssignmentStatus, string> = {
  pending_approval: 'Menunggu Approval',
  approved: 'Disetujui',
  rejected: 'Ditolak',
  reassigned: 'Dialihkan',
  in_progress: 'Dikerjakan',
  completed: 'Selesai',
};

// SLA category labels
export const slaCategoryLabels: Record<string, string> = {
  'Ringan': 'Ringan (4 jam)',
  'Sedang': 'Sedang (24 jam)',
  'Berat': 'Berat (72 jam)',
  'Darurat': 'Darurat (2 jam)',
};
