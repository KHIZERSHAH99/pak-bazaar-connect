
// This updates only the signUp function within the file

export const signUp = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  
  if (error) {
    console.error('Auth signup error:', error);
    throw error;
  }

  // The profile creation is now handled by the database trigger
  // so we don't need to explicitly create it here

  console.log('Signup successful, user data:', data);
  return data;
};
