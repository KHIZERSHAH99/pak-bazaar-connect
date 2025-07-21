-- Create favorites table for products
CREATE TABLE public.favorites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  product_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create unique constraint to prevent duplicate favorites
ALTER TABLE public.favorites ADD CONSTRAINT unique_user_product_favorite UNIQUE (user_id, product_id);

-- Enable Row Level Security
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

-- Create policies for favorites
CREATE POLICY "Users can view their own favorites" 
ON public.favorites 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own favorites" 
ON public.favorites 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorites" 
ON public.favorites 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create shop_favorites table
CREATE TABLE public.shop_favorites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  shop_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create unique constraint to prevent duplicate shop favorites
ALTER TABLE public.shop_favorites ADD CONSTRAINT unique_user_shop_favorite UNIQUE (user_id, shop_id);

-- Enable Row Level Security for shop favorites
ALTER TABLE public.shop_favorites ENABLE ROW LEVEL SECURITY;

-- Create policies for shop favorites
CREATE POLICY "Users can view their own shop favorites" 
ON public.shop_favorites 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own shop favorites" 
ON public.shop_favorites 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own shop favorites" 
ON public.shop_favorites 
FOR DELETE 
USING (auth.uid() = user_id);