-- Create function for atomic purchase number transaction
CREATE OR REPLACE FUNCTION public.purchase_number_transaction(
  p_user_id UUID,
  p_phone_number TEXT,
  p_country_code TEXT,
  p_service_name TEXT,
  p_smspool_number_id TEXT,
  p_cost DECIMAL(10,2),
  p_status TEXT,
  p_expiry_date TIMESTAMP WITH TIME ZONE,
  p_purchase_amount DECIMAL(10,2),
  p_description TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_current_balance DECIMAL(10,2);
  v_new_balance DECIMAL(10,2);
  v_purchased_number_id UUID;
  v_transaction_id UUID;
  v_result JSON;
BEGIN
  -- Start transaction
  BEGIN
    -- Get current wallet balance
    SELECT wallet_balance INTO v_current_balance
    FROM public.profiles
    WHERE id = p_user_id;
    
    IF v_current_balance IS NULL THEN
      RAISE EXCEPTION 'User profile not found';
    END IF;
    
    -- Check if user has sufficient balance
    IF v_current_balance < ABS(p_purchase_amount) THEN
      RAISE EXCEPTION 'Insufficient wallet balance';
    END IF;
    
    -- Calculate new balance
    v_new_balance := v_current_balance + p_purchase_amount;
    
    -- Insert purchased number
    INSERT INTO public.purchased_numbers (
      user_id,
      phone_number,
      country_code,
      service_name,
      smspool_number_id,
      cost,
      status,
      expiry_date
    ) VALUES (
      p_user_id,
      p_phone_number,
      p_country_code,
      p_service_name,
      p_smspool_number_id,
      p_cost,
      p_status,
      p_expiry_date
    ) RETURNING id INTO v_purchased_number_id;
    
    -- Update wallet balance
    UPDATE public.profiles
    SET wallet_balance = v_new_balance
    WHERE id = p_user_id;
    
    -- Insert transaction record
    INSERT INTO public.transactions (
      user_id,
      type,
      amount,
      description,
      status
    ) VALUES (
      p_user_id,
      'purchase',
      p_purchase_amount,
      p_description,
      'completed'
    ) RETURNING id INTO v_transaction_id;
    
    -- Return success result
    v_result := json_build_object(
      'success', true,
      'purchased_number_id', v_purchased_number_id,
      'transaction_id', v_transaction_id,
      'old_balance', v_current_balance,
      'new_balance', v_new_balance
    );
    
    RETURN v_result;
    
  EXCEPTION
    WHEN OTHERS THEN
      -- Rollback is automatic in case of exception
      RAISE EXCEPTION 'Transaction failed: %', SQLERRM;
  END;
END;
$$;

