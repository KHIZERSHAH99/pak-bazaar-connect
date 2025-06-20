
-- Clean up existing pending role requests
DELETE FROM role_requests WHERE status = 'pending';

-- Add columns to profiles table to support role switching
ALTER TABLE profiles 
ADD COLUMN can_switch_roles BOOLEAN DEFAULT true,
ADD COLUMN last_role_switch TIMESTAMP WITH TIME ZONE,
ADD COLUMN role_switch_count INTEGER DEFAULT 0;

-- Create role_switch_history table for audit tracking
CREATE TABLE role_switch_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  from_role TEXT NOT NULL,
  to_role TEXT NOT NULL,
  switched_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  requires_approval BOOLEAN DEFAULT false,
  approved_by UUID,
  approved_at TIMESTAMP WITH TIME ZONE,
  notes TEXT
);

-- Enable RLS on role_switch_history
ALTER TABLE role_switch_history ENABLE ROW LEVEL SECURITY;

-- Create policy for users to view their own role switch history
CREATE POLICY "Users can view their own role switch history"
  ON role_switch_history FOR SELECT
  USING (user_id = auth.uid());

-- Create policy for admins to view all role switch history
CREATE POLICY "Admins can view all role switch history"
  ON role_switch_history FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Create function for direct role switching between seller and wholesaler
CREATE OR REPLACE FUNCTION switch_business_role(target_role TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_user_id UUID;
  current_role TEXT;
  result JSONB;
BEGIN
  -- Get current user
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
  END IF;
  
  -- Get current role
  SELECT role INTO current_role FROM profiles WHERE id = current_user_id;
  
  -- Validate target role
  IF target_role NOT IN ('seller', 'wholesaler') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid target role');
  END IF;
  
  -- Check if user can switch roles
  IF current_role NOT IN ('seller', 'wholesaler') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Role switching not available for your account type');
  END IF;
  
  -- Check if trying to switch to same role
  IF current_role = target_role THEN
    RETURN jsonb_build_object('success', false, 'error', 'Already in target role');
  END IF;
  
  -- Perform the role switch
  UPDATE profiles 
  SET 
    role = target_role,
    last_role_switch = now(),
    role_switch_count = COALESCE(role_switch_count, 0) + 1
  WHERE id = current_user_id;
  
  -- Record the switch in history
  INSERT INTO role_switch_history (user_id, from_role, to_role, requires_approval, notes)
  VALUES (current_user_id, current_role, target_role, false, 'Direct business role switch');
  
  RETURN jsonb_build_object('success', true, 'message', 'Role switched successfully');
END;
$$;
