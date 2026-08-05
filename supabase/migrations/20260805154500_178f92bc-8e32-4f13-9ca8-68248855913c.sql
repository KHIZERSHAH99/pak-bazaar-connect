-- 1) Allow message recipients to mark messages as read
DROP POLICY IF EXISTS "Recipients can mark messages read" ON public.messages;
CREATE POLICY "Recipients can mark messages read"
ON public.messages
FOR UPDATE
TO authenticated
USING (
  sender_id <> auth.uid()
  AND conversation_id IN (
    SELECT c.id FROM public.conversations c
    WHERE c.buyer_id = auth.uid() OR c.seller_id = auth.uid()
  )
)
WITH CHECK (
  sender_id <> auth.uid()
  AND conversation_id IN (
    SELECT c.id FROM public.conversations c
    WHERE c.buyer_id = auth.uid() OR c.seller_id = auth.uid()
  )
);

-- 2) Buyer-side hiding of finished orders
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS buyer_hidden_at TIMESTAMP WITH TIME ZONE;