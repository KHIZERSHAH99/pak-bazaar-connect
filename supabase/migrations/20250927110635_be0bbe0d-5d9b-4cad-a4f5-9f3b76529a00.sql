-- Ensure phone-based emails are auto-confirmed on sign up
DROP TRIGGER IF EXISTS auto_confirm_phone_accounts ON auth.users;
CREATE TRIGGER auto_confirm_phone_accounts
  BEFORE INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.auto_confirm_phone_accounts();