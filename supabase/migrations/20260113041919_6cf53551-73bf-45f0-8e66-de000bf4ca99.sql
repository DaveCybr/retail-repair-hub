-- PHASE 1: Enhanced POS & Service Management System

-- 1. Customer Categories Enum
CREATE TYPE public.customer_category AS ENUM ('retail', 'project', 'institution');

-- 2. Assignment Status Enum  
CREATE TYPE public.assignment_status AS ENUM ('pending_approval', 'approved', 'rejected', 'reassigned', 'in_progress', 'completed');

-- 3. Check-in Type Enum
CREATE TYPE public.checkin_type AS ENUM ('start_work', 'end_work', 'office_return');

-- 4. Update customers table with category
ALTER TABLE public.customers 
ADD COLUMN category customer_category NOT NULL DEFAULT 'retail',
ADD COLUMN member_number TEXT UNIQUE,
ADD COLUMN notes TEXT;

-- 5. Technician Skills table
CREATE TABLE public.technician_skills (
  id SERIAL PRIMARY KEY,
  employee_id INTEGER REFERENCES public.employees(id) ON DELETE CASCADE NOT NULL,
  skill_name TEXT NOT NULL,
  proficiency_level INTEGER DEFAULT 1 CHECK (proficiency_level BETWEEN 1 AND 5),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(employee_id, skill_name)
);

ALTER TABLE public.technician_skills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view technician_skills"
ON public.technician_skills FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Managers can manage technician_skills"
ON public.technician_skills FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'));

-- 6. Technician Workload tracking
ALTER TABLE public.employees
ADD COLUMN current_workload INTEGER DEFAULT 0,
ADD COLUMN max_workload INTEGER DEFAULT 5,
ADD COLUMN is_available BOOLEAN DEFAULT true;

-- 7. Service Assignments table (for approval workflow)
CREATE TABLE public.service_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_item_id UUID REFERENCES public.service_items(id) ON DELETE CASCADE NOT NULL,
  technician_id INTEGER REFERENCES public.employees(id) NOT NULL,
  assigned_by UUID REFERENCES auth.users(id),
  approved_by UUID,
  status assignment_status NOT NULL DEFAULT 'pending_approval',
  assignment_reason TEXT,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.service_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view assignments"
ON public.service_assignments FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Authenticated users can manage assignments"
ON public.service_assignments FOR ALL TO authenticated
USING (true);

-- 8. Digital Check-in/out Logs
CREATE TABLE public.checkin_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id INTEGER REFERENCES public.employees(id) ON DELETE CASCADE NOT NULL,
  service_item_id UUID REFERENCES public.service_items(id),
  checkin_type checkin_type NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  location_name TEXT,
  qr_code_data TEXT,
  photo_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.checkin_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view checkin_logs"
ON public.checkin_logs FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert checkin_logs"
ON public.checkin_logs FOR INSERT TO authenticated
WITH CHECK (true);

-- 9. Service Photos (proof of work)
CREATE TABLE public.service_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_item_id UUID REFERENCES public.service_items(id) ON DELETE CASCADE NOT NULL,
  photo_url TEXT NOT NULL,
  photo_type TEXT NOT NULL CHECK (photo_type IN ('before', 'during', 'after', 'proof')),
  caption TEXT,
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.service_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view service_photos"
ON public.service_photos FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Authenticated users can manage service_photos"
ON public.service_photos FOR ALL TO authenticated
USING (true);

-- 10. Sub-transactions for detailed invoicing (rooms/locations for institutions)
CREATE TABLE public.transaction_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID REFERENCES public.transactions(id) ON DELETE CASCADE NOT NULL,
  location_name TEXT NOT NULL,
  description TEXT,
  subtotal DECIMAL NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.transaction_details ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view transaction_details"
ON public.transaction_details FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Authenticated users can manage transaction_details"
ON public.transaction_details FOR ALL TO authenticated
USING (true);

-- 11. Link sale_items to transaction_details for room-specific items
ALTER TABLE public.sale_items
ADD COLUMN transaction_detail_id UUID REFERENCES public.transaction_details(id);

-- 12. Warranty tracking
CREATE TABLE public.warranties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE NOT NULL,
  service_item_id UUID REFERENCES public.service_items(id),
  product_id INTEGER REFERENCES public.products(id),
  device_name TEXT NOT NULL,
  serial_number TEXT,
  warranty_start DATE NOT NULL,
  warranty_end DATE NOT NULL,
  warranty_type TEXT NOT NULL DEFAULT 'standard',
  terms TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.warranties ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view warranties"
ON public.warranties FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Authenticated users can manage warranties"
ON public.warranties FOR ALL TO authenticated
USING (true);

-- 13. SLA Configuration
CREATE TABLE public.sla_configs (
  id SERIAL PRIMARY KEY,
  category TEXT NOT NULL UNIQUE,
  target_hours INTEGER NOT NULL,
  priority_level INTEGER DEFAULT 1,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.sla_configs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view sla_configs"
ON public.sla_configs FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Managers can manage sla_configs"
ON public.sla_configs FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'));

-- 14. Add SLA tracking to service_items
ALTER TABLE public.service_items
ADD COLUMN sla_category TEXT,
ADD COLUMN sla_deadline TIMESTAMPTZ,
ADD COLUMN completed_at TIMESTAMPTZ,
ADD COLUMN is_sla_breached BOOLEAN DEFAULT false;

-- 15. Queue locking for technicians
ALTER TABLE public.employees
ADD COLUMN is_queue_locked BOOLEAN DEFAULT false,
ADD COLUMN queue_lock_reason TEXT;

-- 16. Add QR code field to service_items for device tracking
ALTER TABLE public.service_items
ADD COLUMN qr_code TEXT UNIQUE,
ADD COLUMN device_serial_number TEXT;

-- 17. Update transactions for project/institution support
ALTER TABLE public.transactions
ADD COLUMN project_name TEXT,
ADD COLUMN is_tempo BOOLEAN DEFAULT false,
ADD COLUMN tempo_due_date DATE;

-- 18. Audit Trail table
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id TEXT,
  old_data JSONB,
  new_data JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can view audit_logs"
ON public.audit_logs FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "System can insert audit_logs"
ON public.audit_logs FOR INSERT TO authenticated
WITH CHECK (true);

-- 19. Insert default SLA configurations
INSERT INTO public.sla_configs (category, target_hours, priority_level, description) VALUES
('Ringan', 4, 1, 'Perbaikan ringan seperti pembersihan, pengecekan'),
('Sedang', 24, 2, 'Perbaikan standar, penggantian komponen kecil'),
('Berat', 72, 3, 'Perbaikan kompleks, butuh sparepart khusus'),
('Darurat', 2, 4, 'Kerusakan kritis yang butuh penanganan segera');

-- 20. Triggers for updated_at
CREATE TRIGGER update_service_assignments_updated_at
BEFORE UPDATE ON public.service_assignments
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_transaction_details_updated_at
BEFORE UPDATE ON public.transaction_details
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_warranties_updated_at
BEFORE UPDATE ON public.warranties
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_sla_configs_updated_at
BEFORE UPDATE ON public.sla_configs
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();