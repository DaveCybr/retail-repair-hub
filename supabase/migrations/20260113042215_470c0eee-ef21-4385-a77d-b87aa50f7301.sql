-- Fix critical security issues identified by security scan

-- 1. Fix employees table - only allow viewing own record or managers/admins can view all
DROP POLICY IF EXISTS "Authenticated users can view employees" ON public.employees;
DROP POLICY IF EXISTS "Authenticated users can manage employees" ON public.employees;

CREATE POLICY "Employees can view own record or managers view all"
ON public.employees FOR SELECT TO authenticated
USING (
  user_id = auth.uid() 
  OR public.has_role(auth.uid(), 'admin') 
  OR public.has_role(auth.uid(), 'manager')
);

CREATE POLICY "Managers can insert employees"
ON public.employees FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'));

CREATE POLICY "Managers can update employees"
ON public.employees FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'));

CREATE POLICY "Admins can delete employees"
ON public.employees FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 2. Fix transactions table - role-based access
DROP POLICY IF EXISTS "Authenticated users can view transactions" ON public.transactions;
DROP POLICY IF EXISTS "Authenticated users can insert transactions" ON public.transactions;
DROP POLICY IF EXISTS "Authenticated users can update transactions" ON public.transactions;
DROP POLICY IF EXISTS "Authenticated users can delete transactions" ON public.transactions;

CREATE POLICY "Cashiers and managers can view transactions"
ON public.transactions FOR SELECT TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') 
  OR public.has_role(auth.uid(), 'manager') 
  OR public.has_role(auth.uid(), 'cashier')
);

CREATE POLICY "Cashiers and managers can insert transactions"
ON public.transactions FOR INSERT TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'admin') 
  OR public.has_role(auth.uid(), 'manager') 
  OR public.has_role(auth.uid(), 'cashier')
);

CREATE POLICY "Managers can update transactions"
ON public.transactions FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'));

CREATE POLICY "Admins can delete transactions"
ON public.transactions FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 3. Fix audit_logs - remove permissive INSERT, only system can write
DROP POLICY IF EXISTS "System can insert audit_logs" ON public.audit_logs;
-- Note: Audit logs should only be written via database triggers, not direct user inserts
-- We'll create a service role function for this instead

-- 4. Fix checkin_logs - employees can only view own, managers can view all
DROP POLICY IF EXISTS "Authenticated users can view checkin_logs" ON public.checkin_logs;
DROP POLICY IF EXISTS "Authenticated users can insert checkin_logs" ON public.checkin_logs;

-- Create function to check if employee belongs to user
CREATE OR REPLACE FUNCTION public.get_employee_id_for_user(_user_id uuid)
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM public.employees WHERE user_id = _user_id LIMIT 1
$$;

CREATE POLICY "Employees can view own checkins or managers view all"
ON public.checkin_logs FOR SELECT TO authenticated
USING (
  employee_id = public.get_employee_id_for_user(auth.uid())
  OR public.has_role(auth.uid(), 'admin') 
  OR public.has_role(auth.uid(), 'manager')
);

CREATE POLICY "Employees can insert own checkins"
ON public.checkin_logs FOR INSERT TO authenticated
WITH CHECK (
  employee_id = public.get_employee_id_for_user(auth.uid())
  OR public.has_role(auth.uid(), 'admin') 
  OR public.has_role(auth.uid(), 'manager')
);

-- 5. Fix remaining overly permissive policies

-- Fix customers table
DROP POLICY IF EXISTS "Authenticated users can view customers" ON public.customers;
DROP POLICY IF EXISTS "Authenticated users can insert customers" ON public.customers;
DROP POLICY IF EXISTS "Authenticated users can update customers" ON public.customers;
DROP POLICY IF EXISTS "Authenticated users can delete customers" ON public.customers;

CREATE POLICY "Staff can view customers"
ON public.customers FOR SELECT TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') 
  OR public.has_role(auth.uid(), 'manager') 
  OR public.has_role(auth.uid(), 'cashier')
  OR public.has_role(auth.uid(), 'technician')
);

CREATE POLICY "Staff can insert customers"
ON public.customers FOR INSERT TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'admin') 
  OR public.has_role(auth.uid(), 'manager') 
  OR public.has_role(auth.uid(), 'cashier')
  OR public.has_role(auth.uid(), 'technician')
);

CREATE POLICY "Staff can update customers"
ON public.customers FOR UPDATE TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') 
  OR public.has_role(auth.uid(), 'manager') 
  OR public.has_role(auth.uid(), 'cashier')
);

CREATE POLICY "Managers can delete customers"
ON public.customers FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'));

-- Fix products table
DROP POLICY IF EXISTS "Authenticated users can view products" ON public.products;
DROP POLICY IF EXISTS "Authenticated users can insert products" ON public.products;
DROP POLICY IF EXISTS "Authenticated users can update products" ON public.products;
DROP POLICY IF EXISTS "Authenticated users can delete products" ON public.products;

CREATE POLICY "All staff can view products"
ON public.products FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Managers can insert products"
ON public.products FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'));

CREATE POLICY "Managers can update products"
ON public.products FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'));

CREATE POLICY "Admins can delete products"
ON public.products FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Fix sale_items
DROP POLICY IF EXISTS "Authenticated users can view sale_items" ON public.sale_items;
DROP POLICY IF EXISTS "Authenticated users can manage sale_items" ON public.sale_items;

CREATE POLICY "Staff can view sale_items"
ON public.sale_items FOR SELECT TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') 
  OR public.has_role(auth.uid(), 'manager') 
  OR public.has_role(auth.uid(), 'cashier')
);

CREATE POLICY "Cashiers can insert sale_items"
ON public.sale_items FOR INSERT TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'admin') 
  OR public.has_role(auth.uid(), 'manager') 
  OR public.has_role(auth.uid(), 'cashier')
);

CREATE POLICY "Managers can update sale_items"
ON public.sale_items FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'));

CREATE POLICY "Admins can delete sale_items"
ON public.sale_items FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Fix payments
DROP POLICY IF EXISTS "Authenticated users can view payments" ON public.payments;
DROP POLICY IF EXISTS "Authenticated users can manage payments" ON public.payments;

CREATE POLICY "Staff can view payments"
ON public.payments FOR SELECT TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') 
  OR public.has_role(auth.uid(), 'manager') 
  OR public.has_role(auth.uid(), 'cashier')
);

CREATE POLICY "Cashiers can insert payments"
ON public.payments FOR INSERT TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'admin') 
  OR public.has_role(auth.uid(), 'manager') 
  OR public.has_role(auth.uid(), 'cashier')
);

CREATE POLICY "Managers can update payments"
ON public.payments FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'));

CREATE POLICY "Admins can delete payments"
ON public.payments FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Fix cash_flow
DROP POLICY IF EXISTS "Authenticated users can view cash_flow" ON public.cash_flow;
DROP POLICY IF EXISTS "Authenticated users can manage cash_flow" ON public.cash_flow;

CREATE POLICY "Managers can view cash_flow"
ON public.cash_flow FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'));

CREATE POLICY "Managers can insert cash_flow"
ON public.cash_flow FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'));

CREATE POLICY "Managers can update cash_flow"
ON public.cash_flow FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'));

CREATE POLICY "Admins can delete cash_flow"
ON public.cash_flow FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Fix service_orders
DROP POLICY IF EXISTS "Authenticated users can view service_orders" ON public.service_orders;
DROP POLICY IF EXISTS "Authenticated users can manage service_orders" ON public.service_orders;

CREATE POLICY "Staff can view service_orders"
ON public.service_orders FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Staff can insert service_orders"
ON public.service_orders FOR INSERT TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'admin') 
  OR public.has_role(auth.uid(), 'manager') 
  OR public.has_role(auth.uid(), 'cashier')
  OR public.has_role(auth.uid(), 'technician')
);

CREATE POLICY "Staff can update service_orders"
ON public.service_orders FOR UPDATE TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') 
  OR public.has_role(auth.uid(), 'manager') 
  OR public.has_role(auth.uid(), 'technician')
);

CREATE POLICY "Managers can delete service_orders"
ON public.service_orders FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'));

-- Fix service_items
DROP POLICY IF EXISTS "Authenticated users can view service_items" ON public.service_items;
DROP POLICY IF EXISTS "Authenticated users can manage service_items" ON public.service_items;

CREATE POLICY "Staff can view service_items"
ON public.service_items FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Staff can insert service_items"
ON public.service_items FOR INSERT TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'admin') 
  OR public.has_role(auth.uid(), 'manager') 
  OR public.has_role(auth.uid(), 'cashier')
  OR public.has_role(auth.uid(), 'technician')
);

CREATE POLICY "Staff can update service_items"
ON public.service_items FOR UPDATE TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') 
  OR public.has_role(auth.uid(), 'manager') 
  OR public.has_role(auth.uid(), 'technician')
);

CREATE POLICY "Managers can delete service_items"
ON public.service_items FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'));

-- Fix service_parts
DROP POLICY IF EXISTS "Authenticated users can view service_parts" ON public.service_parts;
DROP POLICY IF EXISTS "Authenticated users can manage service_parts" ON public.service_parts;

CREATE POLICY "Staff can view service_parts"
ON public.service_parts FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Staff can insert service_parts"
ON public.service_parts FOR INSERT TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'admin') 
  OR public.has_role(auth.uid(), 'manager') 
  OR public.has_role(auth.uid(), 'technician')
);

CREATE POLICY "Staff can update service_parts"
ON public.service_parts FOR UPDATE TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') 
  OR public.has_role(auth.uid(), 'manager') 
  OR public.has_role(auth.uid(), 'technician')
);

CREATE POLICY "Managers can delete service_parts"
ON public.service_parts FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'));

-- Fix product_categories
DROP POLICY IF EXISTS "Authenticated users can view categories" ON public.product_categories;
DROP POLICY IF EXISTS "Authenticated users can manage categories" ON public.product_categories;

CREATE POLICY "All staff can view categories"
ON public.product_categories FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Managers can insert categories"
ON public.product_categories FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'));

CREATE POLICY "Managers can update categories"
ON public.product_categories FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'));

CREATE POLICY "Admins can delete categories"
ON public.product_categories FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Fix service_photos INSERT policy  
DROP POLICY IF EXISTS "Staff can insert service_photos" ON public.service_photos;
CREATE POLICY "Staff can insert service_photos"
ON public.service_photos FOR INSERT TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'admin') 
  OR public.has_role(auth.uid(), 'manager') 
  OR public.has_role(auth.uid(), 'technician')
);