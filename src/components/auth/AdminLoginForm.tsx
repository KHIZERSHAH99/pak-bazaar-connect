import React, { useState } from 'react';
import { signIn } from '@/lib/auth';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Crown, Eye, EyeOff } from 'lucide-react';

interface AdminLoginFormProps {
  onBackToRegular: () => void;
}

const AdminLoginForm: React.FC<AdminLoginFormProps> = ({ onBackToRegular }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { checkAuthStatus } = useAuth();
  const navigate = useNavigate();

  const adminEmails = ['admin@test.com', 'admin@pakbazaarconnect.com'];

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!adminEmails.includes(email.toLowerCase())) {
      toast({
        title: 'Access Denied',
        description: 'This email is not authorized for admin access.',
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);
    
    try {
      await signIn(email, password);
      await checkAuthStatus();
      
      toast({
        title: 'Admin Access Granted',
        description: 'Welcome back, Administrator!'
      });
      
      navigate('/dashboard');
    } catch (error: any) {
      toast({
        title: 'Admin Login Failed',
        description: error.message || 'Invalid admin credentials',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 dark:from-yellow-800 dark:to-orange-700 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
          <Crown className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-foreground font-poppins">Admin Access</h2>
        <p className="text-muted-foreground font-poppins">Secure administrator login</p>
      </div>
      <form onSubmit={handleAdminLogin} className="space-y-4">
        <div>
          <label htmlFor="admin-email" className="block text-sm font-medium text-foreground mb-2 font-poppins">
            Admin Email
          </label>
          <Input
            id="admin-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@pakbazaarconnect.com"
            className="w-full font-poppins bg-background"
            disabled={isLoading}
            required
          />
        </div>

        <div>
          <label htmlFor="admin-password" className="block text-sm font-medium text-foreground mb-2 font-poppins">
            Admin Password
          </label>
          <div className="relative">
            <Input
              id="admin-password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              className="w-full pr-10 font-poppins bg-background"
              disabled={isLoading}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-3"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Eye className="h-4 w-4 text-muted-foreground" />
              )}
            </button>
          </div>
        </div>

        <Button
          type="submit"
          className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 dark:from-yellow-900 dark:to-orange-900 text-white font-poppins"
          disabled={isLoading}
        >
          {isLoading ? 'Authenticating...' : 'Access Admin Panel'}
        </Button>
      </form>

      <div className="text-center">
        <button
          onClick={onBackToRegular}
          className="text-sm text-pakistani_green-600 dark:text-pakistani_green-400 hover:text-pakistani_green-700 dark:hover:text-pakistani_green-300 font-poppins"
        >
          ← Back to Regular Login
        </button>
      </div>
      <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
        <p className="text-xs text-yellow-800 dark:text-yellow-200 font-poppins text-center">
          <strong>Admin privileges:</strong> Full platform access, user management, and system administration
        </p>
      </div>
    </div>
  );
};

export default AdminLoginForm;
