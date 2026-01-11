
-- ============================================
-- AGENDAI - RLS POLICIES AND TRIGGERS
-- ============================================

-- ============================================
-- RLS POLICIES FOR user_roles
-- ============================================
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;

CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles"
ON public.user_roles FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- ============================================
-- RLS POLICIES FOR plans
-- ============================================
DROP POLICY IF EXISTS "Anyone can view active plans" ON public.plans;
DROP POLICY IF EXISTS "Admins can manage plans" ON public.plans;

CREATE POLICY "Anyone can view active plans"
ON public.plans FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage plans"
ON public.plans FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- ============================================
-- RLS POLICIES FOR clients
-- ============================================
DROP POLICY IF EXISTS "Professionals can view their clients" ON public.clients;
DROP POLICY IF EXISTS "Professionals can manage their clients" ON public.clients;
DROP POLICY IF EXISTS "Anyone can create client for booking" ON public.clients;

CREATE POLICY "Professionals can view their clients"
ON public.clients FOR SELECT
TO authenticated
USING (
  professional_id = public.get_user_profile_id(auth.uid())
  OR public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Professionals can manage their clients"
ON public.clients FOR ALL
TO authenticated
USING (
  professional_id = public.get_user_profile_id(auth.uid())
  OR public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Anyone can create client for booking"
ON public.clients FOR INSERT
WITH CHECK (true);

-- ============================================
-- RLS POLICIES FOR subscriptions
-- ============================================
DROP POLICY IF EXISTS "Users can view their own subscription" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can manage their subscription" ON public.subscriptions;

CREATE POLICY "Users can view their own subscription"
ON public.subscriptions FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can manage their subscription"
ON public.subscriptions FOR ALL
TO authenticated
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

-- ============================================
-- RLS POLICIES FOR settings
-- ============================================
DROP POLICY IF EXISTS "Users can view their own settings" ON public.settings;
DROP POLICY IF EXISTS "Users can manage their own settings" ON public.settings;

CREATE POLICY "Users can view their own settings"
ON public.settings FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own settings"
ON public.settings FOR ALL
TO authenticated
USING (auth.uid() = user_id);

-- ============================================
-- UPDATE EXISTING RLS POLICIES FOR appointments
-- ============================================
DROP POLICY IF EXISTS "Authenticated users can create appointments" ON public.appointments;
DROP POLICY IF EXISTS "Clients can view their appointments" ON public.appointments;
DROP POLICY IF EXISTS "Professionals can manage their appointments" ON public.appointments;
DROP POLICY IF EXISTS "Professionals can view their appointments" ON public.appointments;
DROP POLICY IF EXISTS "Anyone can create appointments for booking" ON public.appointments;
DROP POLICY IF EXISTS "Professionals can update their appointments" ON public.appointments;
DROP POLICY IF EXISTS "Professionals can delete their appointments" ON public.appointments;

CREATE POLICY "Anyone can create appointments for booking"
ON public.appointments FOR INSERT
WITH CHECK (true);

CREATE POLICY "Professionals can view their appointments"
ON public.appointments FOR SELECT
TO authenticated
USING (
  professional_id = public.get_user_profile_id(auth.uid())
  OR client_id IN (SELECT id FROM public.clients WHERE user_id = auth.uid())
  OR public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Professionals can manage their appointments"
ON public.appointments FOR ALL
TO authenticated
USING (
  professional_id = public.get_user_profile_id(auth.uid())
  OR public.has_role(auth.uid(), 'admin')
);

-- ============================================
-- TRIGGERS FOR updated_at
-- ============================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

DROP TRIGGER IF EXISTS update_plans_updated_at ON public.plans;
DROP TRIGGER IF EXISTS update_clients_updated_at ON public.clients;
DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON public.subscriptions;
DROP TRIGGER IF EXISTS update_settings_updated_at ON public.settings;

CREATE TRIGGER update_plans_updated_at
BEFORE UPDATE ON public.plans
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_clients_updated_at
BEFORE UPDATE ON public.clients
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at
BEFORE UPDATE ON public.subscriptions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_settings_updated_at
BEFORE UPDATE ON public.settings
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- TRIGGER TO CREATE DEFAULT SUBSCRIPTION ON PROFILE CREATE
-- ============================================
DROP TRIGGER IF EXISTS on_profile_created ON public.profiles;

CREATE OR REPLACE FUNCTION public.create_default_subscription()
RETURNS TRIGGER AS $$
DECLARE
  free_plan_id UUID;
BEGIN
  SELECT id INTO free_plan_id FROM public.plans WHERE name = 'Gratuito' LIMIT 1;
  
  IF free_plan_id IS NOT NULL THEN
    INSERT INTO public.subscriptions (user_id, plan_id, status, start_date)
    VALUES (NEW.user_id, free_plan_id, 'active', CURRENT_DATE)
    ON CONFLICT DO NOTHING;
  END IF;
  
  -- Also create default settings
  INSERT INTO public.settings (user_id)
  VALUES (NEW.user_id)
  ON CONFLICT (user_id) DO NOTHING;
  
  -- Create user role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.user_id, 'professional')
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_profile_created
AFTER INSERT ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.create_default_subscription();

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_clients_professional_id ON public.clients(professional_id);
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON public.clients(user_id);
CREATE INDEX IF NOT EXISTS idx_appointments_client_id ON public.appointments(client_id);
CREATE INDEX IF NOT EXISTS idx_appointments_professional_id ON public.appointments(professional_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON public.appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
