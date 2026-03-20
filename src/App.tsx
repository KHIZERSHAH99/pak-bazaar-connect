
import { lazy, Suspense, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { startRoutePrefetch } from "@/lib/route-prefetch";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ThemeProvider } from "next-themes";
import AppErrorBoundary from "@/components/ui/AppErrorBoundary";
import AppRoutes from "@/routes/AppRoutes";


const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
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
    startRoutePrefetch();
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
            <AppErrorBoundary>
              <div className="min-h-screen bg-background text-foreground transition-colors duration-200 font-poppins">
                <Toaster />
                <Sonner />
                <BrowserRouter>
                  <AuthProvider>
                    <AppRoutes />
                  </AuthProvider>
                </BrowserRouter>
              </div>
            </AppErrorBoundary>
          </TooltipProvider>
        </LanguageProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
