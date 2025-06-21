
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContextEnhanced";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ThemeProvider } from "next-themes";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import AuthErrorBoundary from "@/components/auth/AuthErrorBoundary";

// Import pages
import Index from "@/pages/Index";
import FixedLogin from "@/pages/FixedLogin";
import FixedSignup from "@/pages/FixedSignup";
import FixedDashboard from "@/pages/FixedDashboard";
import FixedProfile from "@/pages/FixedProfile";
import ProtectedRouteEnhanced from "@/components/ProtectedRouteEnhanced";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider 
        attribute="class" 
        defaultTheme="light" 
        enableSystem
        disableTransitionOnChange={false}
        storageKey="pak-bazaar-theme"
      >
        <LanguageProvider>
          <TooltipProvider>
            <ErrorBoundary>
              <AuthErrorBoundary>
                <div className="min-h-screen bg-background text-foreground transition-colors duration-200 font-poppins">
                  <Toaster />
                  <Sonner />
                  <BrowserRouter>
                    <AuthProvider>
                      <Routes>
                        <Route path="/" element={<Index />} />
                        <Route path="/login" element={<FixedLogin />} />
                        <Route path="/signup" element={<FixedSignup />} />
                        <Route 
                          path="/dashboard" 
                          element={
                            <ProtectedRouteEnhanced>
                              <FixedDashboard />
                            </ProtectedRouteEnhanced>
                          } 
                        />
                        <Route 
                          path="/profile" 
                          element={
                            <ProtectedRouteEnhanced>
                              <FixedProfile />
                            </ProtectedRouteEnhanced>
                          } 
                        />
                      </Routes>
                    </AuthProvider>
                  </BrowserRouter>
                </div>
              </AuthErrorBoundary>
            </ErrorBoundary>
          </TooltipProvider>
        </LanguageProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
