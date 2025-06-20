
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ThemeProvider } from "next-themes";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import AuthErrorBoundary from "@/components/auth/AuthErrorBoundary";
import AppRoutes from "@/routes/AppRoutes";

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

const App = () => (
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
                    <AppRoutes />
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

export default App;
