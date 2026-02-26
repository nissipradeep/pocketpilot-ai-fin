import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { StoreProvider, useStore } from "@/lib/store";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Splash from "./pages/Splash";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import Analytics from "./pages/Analytics";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import { Loader2 } from "lucide-react";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { state } = useStore();
  if (!state.isAuthenticated) return <Navigate to="/signin" replace />;
  if (!state.user?.onboardingComplete) return <Navigate to="/onboarding" replace />;
  return <>{children}</>;
}

function AuthRoute({ children }: { children: React.ReactNode }) {
  const { state } = useStore();
  if (state.isAuthenticated && state.user?.onboardingComplete) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

const AppRoutes = () => {
  const { syncData } = useStore();
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    // Attempt to restore session on mount
    const initAuth = async () => {
      await syncData();
      setInitializing(false);
    };
    initAuth();

    // Listen for auth changes globally
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) syncData();
    });

    return () => subscription.unsubscribe();
  }, [syncData]);

  if (initializing) {
    return (
      <div className="min-h-screen bg-[#0A0A0B] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Splash />} />
      <Route path="/signin" element={<AuthRoute><SignIn /></AuthRoute>} />
      <Route path="/signup" element={<AuthRoute><SignUp /></AuthRoute>} />
      <Route path="/onboarding" element={<Onboarding />} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/transactions" element={<ProtectedRoute><Transactions /></ProtectedRoute>} />
      <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <StoreProvider>
          <AppRoutes />
        </StoreProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
