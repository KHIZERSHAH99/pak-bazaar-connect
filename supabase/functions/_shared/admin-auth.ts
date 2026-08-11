import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

/**
 * Verifies the caller's JWT and checks that the user has an admin role.
 * Uses the anon key client so the request is validated against RLS/auth.
 * Returns { user } on success or throws an Error describing why access was denied.
 */
export async function requireAdmin(req: Request): Promise<{ userId: string }> {
  const authHeader = req.headers.get('Authorization') ?? '';
  const token = authHeader.replace('Bearer ', '').trim();

  if (!token) {
    throw new Error('Unauthorized: missing authentication token');
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    {
      global: {
        headers: { Authorization: `Bearer ${token}` },
      },
    }
  );

  const { data: userData, error: userError } = await supabase.auth.getUser(token);
  if (userError || !userData?.user) {
    throw new Error('Unauthorized: invalid authentication token');
  }

  const userId = userData.user.id;

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single();

  if (profileError || !profile) {
    throw new Error('Unauthorized: profile not found');
  }

  if (profile.role !== 'admin') {
    throw new Error('Forbidden: admin access required');
  }

  return { userId };
}