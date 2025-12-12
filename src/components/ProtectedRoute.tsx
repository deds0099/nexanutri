import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
    children: ReactNode;
    requireSubscription?: boolean;
}

export function ProtectedRoute({ children, requireSubscription = true }: ProtectedRouteProps) {
    const { user, loading, hasActiveSubscription } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    // Se não está logado, redireciona para login
    if (!user) {
        return <Navigate to="/auth" replace />;
    }

    // Se precisa de assinatura e não tem, redireciona para assinatura
    if (requireSubscription && !hasActiveSubscription()) {
        return <Navigate to="/assinatura" replace />;
    }

    return <>{children}</>;
}
