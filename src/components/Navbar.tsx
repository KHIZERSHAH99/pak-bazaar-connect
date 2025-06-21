import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Package, User, LogOut, Settings, Menu, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getUserProfile, signOut } from '@/lib/auth-fixed';
import { useUrduLanguage } from '@/contexts/UrduLanguageContext';
import LanguageToggle from '@/components/ui/LanguageToggle';

const Navbar = () => {
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t, isUrdu } = useUrduLanguage();

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const profile = await getUserProfile();
      setUserProfile(profile);
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      setUserProfile(null);
      toast({
        title: t('message.success'),
        description: isUrdu ? 'کامیابی سے لاگ آؤٹ ہو گئے' : 'Successfully logged out'
      });
      navigate('/');
    } catch (error) {
      toast({
        title: t('message.error'),
        description: isUrdu ? 'لاگ آؤٹ میں خرابی' : 'Error logging out',
        variant: 'destructive'
      });
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'wholesaler': return 'bg-blue-100 text-blue-800';
      case 'seller': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const navItems = [
    { key: 'dashboard', path: '/dashboard', label: t('nav.dashboard') },
    { key: 'products', path: '/products', label: t('nav.products') },
    { key: 'orders', path: '/orders', label: t('nav.orders') },
  ];

  return (
    <nav className={`bg-white border-b sticky top-0 z-50 ${isUrdu ? 'rtl' : 'ltr'}`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <Package className="h-8 w-8 text-green-600" />
            <span className="text-xl font-bold text-gray-900">PakTrade</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {userProfile && (
              <>
                {navItems.map((item) => (
                  <Link
                    key={item.key}
                    to={item.path}
                    className="text-gray-600 hover:text-green-600 transition-colors"
                  >
                    {item.label}
                  </Link>
                ))}
              </>
            )}
          </div>

          {/* Right Side */}
          <div className="flex items-center space-x-4">
            <LanguageToggle />
            
            {loading ? (
              <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
            ) : userProfile ? (
              <div className="flex items-center space-x-3">
                <Badge className={getRoleColor(userProfile.role)}>
                  {t(`role.${userProfile.role}`)}
                </Badge>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={userProfile.profile_image} alt={userProfile.contact_name} />
                        <AvatarFallback>
                          {(userProfile.contact_name || userProfile.email || 'U').charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <div className="flex items-center justify-start gap-2 p-2">
                      <div className="flex flex-col space-y-1 leading-none">
                        <p className="font-medium">{userProfile.contact_name || userProfile.business_name}</p>
                        <p className="w-[200px] truncate text-sm text-muted-foreground">
                          {userProfile.email}
                        </p>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate('/profile')}>
                      <User className="mr-2 h-4 w-4" />
                      <span>{t('nav.profile')}</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/dashboard')}>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>{t('nav.dashboard')}</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>{t('nav.logout')}</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="outline" onClick={() => navigate('/login')}>
                  {t('nav.login')}
                </Button>
                <Button 
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => navigate('/signup')}
                >
                  {t('nav.signup')}
                </Button>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <div className="flex flex-col space-y-2">
              {userProfile && navItems.map((item) => (
                <Link
                  key={item.key}
                  to={item.path}
                  className="text-gray-600 hover:text-green-600 py-2 px-4 rounded transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              
              {!userProfile && (
                <>
                  <Button 
                    variant="outline" 
                    className="mx-4"
                    onClick={() => {
                      navigate('/login');
                      setMobileMenuOpen(false);
                    }}
                  >
                    {t('nav.login')}
                  </Button>
                  <Button 
                    className="mx-4 bg-green-600 hover:bg-green-700"
                    onClick={() => {
                      navigate('/signup');
                      setMobileMenuOpen(false);
                    }}
                  >
                    {t('nav.signup')}
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
