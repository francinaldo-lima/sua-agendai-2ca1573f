-- Add stripe_price_id column to plans table
ALTER TABLE public.plans ADD COLUMN stripe_price_id TEXT;

-- Update plans with Stripe price IDs
UPDATE public.plans SET stripe_price_id = 'price_1SovMVLRdpjGwEu2ZAXkVRbP' WHERE name = 'Básico';
UPDATE public.plans SET stripe_price_id = 'price_1SovMuLRdpjGwEu2FPBtK2YB' WHERE name = 'Profissional';
UPDATE public.plans SET stripe_price_id = 'price_1SovN5LRdpjGwEu2r9ekzEVD' WHERE name = 'Empresarial';

-- Add stripe_customer_id and stripe_subscription_id to profiles
ALTER TABLE public.profiles ADD COLUMN stripe_customer_id TEXT;
ALTER TABLE public.profiles ADD COLUMN stripe_subscription_id TEXT;