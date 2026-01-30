import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

// Lazy load pages for performance
const Index = lazy(() => import("./pages/Index"));
const NotFound = lazy(() => import("./pages/NotFound"));
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const LessonsPage = lazy(() => import("./pages/LessonsPage"));
const PracticePage = lazy(() => import("./pages/PracticePage"));
const ConversationPage = lazy(() => import("./pages/ConversationPage"));
const PlacementTestPage = lazy(() => import("./pages/PlacementTestPage"));
const WordBankPage = lazy(() => import("./pages/WordBankPage"));
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
const LoginPage = lazy(() => import("./pages/LoginPage"));

const queryClient = new QueryClient();

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <Loader2 className="w-8 h-8 animate-spin text-primary" />
  </div>
);

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) return <PageLoader />;
  if (!user) return <Navigate to="/login" replace />;

  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Landing Page */}
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<LoginPage />} />

              {/* App Pages (Protected) */}
              <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
              <Route path="/lessons" element={<ProtectedRoute><LessonsPage /></ProtectedRoute>} />
              <Route path="/practice/:lessonId" element={<ProtectedRoute><PracticePage /></ProtectedRoute>} />
              <Route path="/conversation" element={<ProtectedRoute><ConversationPage /></ProtectedRoute>} />
              <Route path="/placement" element={<ProtectedRoute><PlacementTestPage /></ProtectedRoute>} />
              <Route path="/review" element={<ProtectedRoute><WordBankPage /></ProtectedRoute>} />

              {/* Catch-all */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);


export default App;
