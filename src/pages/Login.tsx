
// We'll update the handleLogin function to add more error handling and logging

const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  setError(null);
  if (!email || !password) {
    setError('Please enter both email and password');
    return;
  }
  
  try {
    setIsLoading(true);
    console.log('Logging in with:', { email });
    const result = await signIn(email, password);
    console.log('Login result:', result);
    await checkAuthStatus();
    console.log('Auth status checked');
    toast({
      title: 'Success',
      description: 'You have successfully logged in'
    });
    navigate('/dashboard');
  } catch (error: any) {
    console.error('Login error:', error);
    setError(error.message || 'Login failed. Please check your credentials and try again');
    toast({
      title: 'Login failed',
      description: error.message || 'Please check your credentials and try again',
      variant: 'destructive'
    });
  } finally {
    setIsLoading(false);
  }
};
