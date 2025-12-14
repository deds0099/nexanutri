import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Assinatura from "./pages/Assinatura";
import Dieta from "./pages/Dieta";
import MinhaDieta from "./pages/MinhaDieta";
import IMC from "./pages/IMC";
import Scanner from "./pages/Scanner";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/assinatura" element={<Assinatura />} />
            <Route path="/dieta" element={
              <ProtectedRoute>
                <Dieta />
              </ProtectedRoute>
            } />
            <Route path="/minha-dieta" element={
              <ProtectedRoute>
                <MinhaDieta />
              </ProtectedRoute>
            } />
            <Route path="/imc" element={
              <ProtectedRoute>
                <IMC />
              </ProtectedRoute>
            } />
            <Route path="/scanner" element={
              <ProtectedRoute>
                <Scanner />
              </ProtectedRoute>
            } />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;

