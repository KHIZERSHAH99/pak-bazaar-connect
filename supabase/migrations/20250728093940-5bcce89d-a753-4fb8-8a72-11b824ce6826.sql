-- Add INSERT policy for commission_records to allow triggers to create records
CREATE POLICY "System can insert commission records" 
ON public.commission_records 
FOR INSERT 
WITH CHECK (true);

-- Also allow wholesalers to insert their own commission records  
CREATE POLICY "Wholesalers can insert their commission records" 
ON public.commission_records 
FOR INSERT 
WITH CHECK (wholesaler_id = auth.uid());