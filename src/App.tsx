
import { useEffect, lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ThemeProvider } from "next-themes";
import AppErrorBoundary from "@/components/ui/AppErrorBoundary";
import AuthErrorBoundary from "@/components/auth/AuthErrorBoundary";
import GlobalErrorBoundary from "@/components/common/GlobalErrorHandler";
import AppRoutes from "@/routes/AppRoutes";
import { applyCSP } from "@/lib/security/content-security-policy";

// Lazy load performance monitor - only needed in development
const PerformanceMonitor = lazy(() => import("@/components/ui/performance-monitor"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1,
      gcTime: 5 * 60 * 1000,
    },
  },
});

const App = () => {
  useEffect(() => {
    // Apply Content Security Policy
    applyCSP();
  }, []);

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
            <GlobalErrorBoundary>
              <AppErrorBoundary>
                <AuthErrorBoundary>
                  <div className="min-h-screen bg-background text-foreground transition-colors duration-200 font-poppins">
                    <Toaster />
                    <Sonner />
                    <BrowserRouter>
                      <AuthProvider>
                        <AppRoutes />
                        {import.meta.env.DEV && (
                          <Suspense fallback={null}>
                            <PerformanceMonitor />
                          </Suspense>
                        )}
                      </AuthProvider>
                    </BrowserRouter>
                  </div>
                </AuthErrorBoundary>
              </AppErrorBoundary>
            </GlobalErrorBoundary>
          </TooltipProvider>
        </LanguageProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
