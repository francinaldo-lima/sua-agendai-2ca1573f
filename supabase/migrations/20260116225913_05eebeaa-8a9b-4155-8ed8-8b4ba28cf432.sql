-- Drop the incorrect foreign key constraint
ALTER TABLE public.appointments DROP CONSTRAINT IF EXISTS appointments_client_id_fkey;

-- Add the correct foreign key constraint referencing the clients table
ALTER TABLE public.appointments 
ADD CONSTRAINT appointments_client_id_fkey 
FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE SET NULL;