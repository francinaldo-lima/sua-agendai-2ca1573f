-- Create business_profile table for enhanced public page
CREATE TABLE public.business_profile (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  professional_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  logo_url TEXT,
  business_name TEXT,
  description TEXT,
  opening_hours JSONB DEFAULT '{}',
  address TEXT,
  google_maps_link TEXT,
  phone TEXT,
  instagram_link TEXT,
  facebook_link TEXT,
  website TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create time_blocks table for blocking time slots
CREATE TABLE public.time_blocks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  professional_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  block_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  reason TEXT,
  is_all_day BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.business_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_blocks ENABLE ROW LEVEL SECURITY;

-- RLS policies for business_profile
CREATE POLICY "Users can view their own business profile" 
ON public.business_profile 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own business profile" 
ON public.business_profile 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own business profile" 
ON public.business_profile 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Public can view business profiles" 
ON public.business_profile 
FOR SELECT 
USING (true);

-- RLS policies for time_blocks
CREATE POLICY "Professionals can view their own time blocks" 
ON public.time_blocks 
FOR SELECT 
USING (professional_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Professionals can insert their own time blocks" 
ON public.time_blocks 
FOR INSERT 
WITH CHECK (professional_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Professionals can update their own time blocks" 
ON public.time_blocks 
FOR UPDATE 
USING (professional_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Professionals can delete their own time blocks" 
ON public.time_blocks 
FOR DELETE 
USING (professional_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Public can view time blocks for availability check" 
ON public.time_blocks 
FOR SELECT 
USING (true);

-- Add trigger for updated_at on business_profile
CREATE TRIGGER update_business_profile_updated_at
BEFORE UPDATE ON public.business_profile
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for performance
CREATE INDEX idx_time_blocks_professional_date ON public.time_blocks(professional_id, block_date);
CREATE INDEX idx_business_profile_professional ON public.business_profile(professional_id);