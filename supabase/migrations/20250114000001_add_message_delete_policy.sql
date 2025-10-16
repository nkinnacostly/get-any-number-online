-- Add DELETE policy for received_messages to allow users to delete their own messages
-- Users can only delete messages that belong to their purchased numbers

CREATE POLICY "Users can delete messages for own numbers" ON public.received_messages
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.purchased_numbers 
      WHERE purchased_numbers.id = received_messages.number_id 
      AND purchased_numbers.user_id = auth.uid()
    )
  );

