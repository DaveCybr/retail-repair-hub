-- Fix overly permissive RLS policies for new tables
-- Replace USING (true) with proper role-based checks

-- 1. Fix service_assignments policies
DROP POLICY IF EXISTS "Authenticated users can manage assignments" ON public.service_assignments;
CREATE POLICY "Managers and admins can manage assignments"
ON public.service_assignments FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'));

CREATE POLICY "Managers and admins can update assignments"
ON public.service_assignments FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'));

CREATE POLICY "Managers and admins can delete assignments"
ON public.service_assignments FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'));

-- 2. Fix service_photos policies
DROP POLICY IF EXISTS "Authenticated users can manage service_photos" ON public.service_photos;
CREATE POLICY "Staff can insert service_photos"
ON public.service_photos FOR INSERT TO authenticated
WITH CHECK (true);

CREATE POLICY "Staff can update service_photos"
ON public.service_photos FOR UPDATE TO authenticated
USING (uploaded_by = auth.uid() OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'));

CREATE POLICY "Managers can delete service_photos"
ON public.service_photos FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'));

-- 3. Fix transaction_details policies
DROP POLICY IF EXISTS "Authenticated users can manage transaction_details" ON public.transaction_details;
CREATE POLICY "Cashiers and managers can insert transaction_details"
ON public.transaction_details FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager') OR public.has_role(auth.uid(), 'cashier'));

CREATE POLICY "Cashiers and managers can update transaction_details"
ON public.transaction_details FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager') OR public.has_role(auth.uid(), 'cashier'));

CREATE POLICY "Managers can delete transaction_details"
ON public.transaction_details FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'));

-- 4. Fix warranties policies
DROP POLICY IF EXISTS "Authenticated users can manage warranties" ON public.warranties;
CREATE POLICY "Staff can insert warranties"
ON public.warranties FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager') OR public.has_role(auth.uid(), 'cashier'));

CREATE POLICY "Managers can update warranties"
ON public.warranties FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'));

CREATE POLICY "Managers can delete warranties"
ON public.warranties FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'));