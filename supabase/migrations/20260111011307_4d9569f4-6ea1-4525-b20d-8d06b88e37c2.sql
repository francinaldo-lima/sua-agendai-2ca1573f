
-- ============================================
-- AGENDAI - CREATE NEW TABLES
-- ============================================

-- 1. Create role enum if not exists
DO $$ BEGIN
    CREATE TYPE public.app_role AS ENUM ('admin', 'professional', 'client');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Create user_roles table
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- 3. Create plans table
CREATE TABLE IF NOT EXISTS public.plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    max_appointments INTEGER NOT NULL DEFAULT 50,
    max_professionals INTEGER NOT NULL DEFAULT 1,
    price NUMERIC NOT NULL DEFAULT 0,
    features JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 4. Create clients table
CREATE TABLE IF NOT EXISTS public.clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    professional_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 5. Create subscriptions table
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    plan_id UUID REFERENCES public.plans(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'expired', 'trial')),
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    end_date DATE,
    appointments_used INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 6. Create settings table
CREATE TABLE IF NOT EXISTS public.settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    cancellation_policy TEXT,
    min_advance_hours INTEGER NOT NULL DEFAULT 2,
    max_advance_days INTEGER NOT NULL DEFAULT 30,
    public_page_title TEXT,
    public_page_description TEXT,
    public_page_theme TEXT DEFAULT 'default',
    notification_email BOOLEAN NOT NULL DEFAULT true,
    notification_sms BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 7. Add foreign keys to existing tables (with IF NOT EXISTS approach)
DO $$
BEGIN
    -- appointments.client_id -> clients.id
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'appointments_client_id_fkey') THEN
        ALTER TABLE public.appointments 
        ADD CONSTRAINT appointments_client_id_fkey 
        FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE SET NULL;
    END IF;
    
    -- appointments.service_id -> services.id
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'appointments_service_id_fkey') THEN
        ALTER TABLE public.appointments 
        ADD CONSTRAINT appointments_service_id_fkey 
        FOREIGN KEY (service_id) REFERENCES public.services(id) ON DELETE SET NULL;
    END IF;
    
    -- appointments.professional_id -> profiles.id
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'appointments_professional_id_fkey') THEN
        ALTER TABLE public.appointments 
        ADD CONSTRAINT appointments_professional_id_fkey 
        FOREIGN KEY (professional_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
    END IF;
    
    -- services.professional_id -> profiles.id
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'services_professional_id_fkey') THEN
        ALTER TABLE public.services 
        ADD CONSTRAINT services_professional_id_fkey 
        FOREIGN KEY (professional_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
    END IF;
    
    -- working_hours.professional_id -> profiles.id
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'working_hours_professional_id_fkey') THEN
        ALTER TABLE public.working_hours 
        ADD CONSTRAINT working_hours_professional_id_fkey 
        FOREIGN KEY (professional_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
    END IF;
END $$;

-- 8. Enable RLS on new tables
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- 9. Create security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- 10. Create function to get user's profile id
CREATE OR REPLACE FUNCTION public.get_user_profile_id(_user_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM public.profiles WHERE user_id = _user_id LIMIT 1
$$;

-- 11. Create function to check subscription validity
CREATE OR REPLACE FUNCTION public.check_subscription_valid(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.subscriptions s
    JOIN public.plans p ON s.plan_id = p.id
    WHERE s.user_id = _user_id
      AND s.status = 'active'
      AND (s.end_date IS NULL OR s.end_date >= CURRENT_DATE)
      AND s.appointments_used < p.max_appointments
  )
$$;
