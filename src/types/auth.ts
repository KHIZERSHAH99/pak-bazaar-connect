export type UserRole = 'admin' | 'wholesaler' | 'seller' | 'pending';

export interface AuthResponse {
  success: boolean;
  user_id?: string;
  email?: string;
  role?: string;
  auth_type?: string;
  identifier?: string;
  error?: string;
}