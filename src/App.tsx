
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContextFixed";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ThemeProvider } from "next-themes";
import AppErrorBoundary from "@/components/ui/AppErrorBoundary";
import AuthErrorBoundary from "@/components/auth/AuthErrorBoundary";
import AppRoutes from "@/routes/AppRoutes";
import PerformanceMonitor from "@/components/ui/performance-monitor";

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
            <AppErrorBoundary>
              <AuthErrorBoundary>
                <div className="min-h-screen bg-background text-foreground transition-colors duration-200 font-poppins">
                  <Toaster />
                  <Sonner />
                  <BrowserRouter>
                    <AuthProvider>
                      <AppRoutes />
                      <PerformanceMonitor />
                    </AuthProvider>
                  </BrowserRouter>
                </div>
              </AuthErrorBoundary>
            </AppErrorBoundary>
          </TooltipProvider>
        </LanguageProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
