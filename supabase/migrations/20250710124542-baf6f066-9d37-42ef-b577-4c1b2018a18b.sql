
-- Fix the missing foreign key relationship between orders and profiles
-- This will resolve the "Could not find a relationship between 'orders' and 'profiles'" error

-- Add the missing foreign key constraint
ALTER TABLE orders 
ADD CONSTRAINT orders_buyer_id_fkey 
FOREIGN KEY (buyer_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- Also ensure the delivery_confirmed_by foreign key exists properly
DO $$ 
BEGIN
    -- Check if the constraint exists, if not add it
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'orders_delivery_confirmed_by_fkey' 
        AND table_name = 'orders'
    ) THEN
        ALTER TABLE orders 
        ADD CONSTRAINT orders_delivery_confirmed_by_fkey 
        FOREIGN KEY (delivery_confirmed_by) REFERENCES profiles(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Add helpful comments
COMMENT ON CONSTRAINT orders_buyer_id_fkey ON orders IS 'Links orders to buyer profiles';
COMMENT ON CONSTRAINT orders_delivery_confirmed_by_fkey ON orders IS 'Links orders to user who confirmed delivery';
