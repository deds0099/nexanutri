import { useState } from "react";
import { motion } from "framer-motion";
import { Menu, X, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import logoNexa from "@/assets/logo-nexa.png";
import { useAuth } from "@/contexts/AuthContext";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { user, userData, signOut, loading, hasActiveSubscription } = useAuth();

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  const handleDashboard = () => {
    if (hasActiveSubscription()) {
      navigate("/minha-dieta");
    } else {
      navigate("/assinatura");
    }
  };

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border"
    >
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <a href="/" className="flex items-center gap-2">
          <img src={logoNexa} alt="NexaNutri Logo" className="h-10 w-10 object-contain" />
          <span className="text-xl font-bold text-foreground">NexaNutri</span>
        </a>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          <a href="#features" className="text-muted-foreground hover:text-primary transition-colors">
            Funcionalidades
          </a>
          <a href="#how-it-works" className="text-muted-foreground hover:text-primary transition-colors">
            Como Funciona
          </a>
          <a href="#faq" className="text-muted-foreground hover:text-primary transition-colors">
            FAQ
          </a>
        </nav>

        <div className="hidden md:flex items-center gap-3">
          {loading ? (
            <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
          ) : user ? (
            <>
              <div className="flex items-center gap-2 text-muted-foreground">
                <User size={18} />
                <span className="text-sm">{userData?.name || user.email?.split('@')[0]}</span>
              </div>
              {hasActiveSubscription() && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/scanner")}
                >
                  Scanner
                </Button>
              )}
              {hasActiveSubscription() && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/receitas")}
                >
                  Receitas Fit
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handleDashboard}
              >
                {hasActiveSubscription() ? "Dashboard" : "Assinar"}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-muted-foreground hover:text-destructive"
              >
                <LogOut size={18} />
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                className="text-muted-foreground hover:text-primary"
                onClick={() => navigate("/auth")}
              >
                Login
              </Button>
              <Button
                className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-soft"
                onClick={() => navigate("/assinatura")}
              >
                Assinar agora
              </Button>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden p-2 text-foreground"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="md:hidden bg-background border-b border-border"
        >
          <nav className="container mx-auto px-4 py-4 flex flex-col gap-4">
            <a href="#features" className="text-muted-foreground hover:text-primary transition-colors">
              Funcionalidades
            </a>
            <a href="#how-it-works" className="text-muted-foreground hover:text-primary transition-colors">
              Como Funciona
            </a>
            <a href="#faq" className="text-muted-foreground hover:text-primary transition-colors">
              FAQ
            </a>
            <div className="flex flex-col gap-2 pt-4 border-t border-border">
              {user ? (
                <>
                  <div className="flex items-center gap-2 text-muted-foreground py-2">
                    <User size={18} />
                    <span className="text-sm">{userData?.name || user.email?.split('@')[0]}</span>
                  </div>
                  {hasActiveSubscription() && (
                    <Button
                      variant="ghost"
                      className="w-full"
                      onClick={() => navigate("/scanner")}
                    >
                      Scanner de Refeições
                    </Button>
                  )}
                  {hasActiveSubscription() && (
                    <Button
                      variant="ghost"
                      className="w-full"
                      onClick={() => navigate("/receitas")}
                    >
                      Receitas Fit
                    </Button>
                  )}
                  <Button
                    className="w-full"
                    onClick={handleDashboard}
                  >
                    {hasActiveSubscription() ? "Dashboard" : "Assinar Plano"}
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleLogout}
                  >
                    <LogOut size={18} className="mr-2" />
                    Sair
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    className="w-full justify-center"
                    onClick={() => navigate("/auth")}
                  >
                    Login
                  </Button>
                  <Button
                    className="w-full bg-primary text-primary-foreground"
                    onClick={() => navigate("/assinatura")}
                  >
                    Assinar agora
                  </Button>
                </>
              )}
            </div>
          </nav>
        </motion.div>
      )}
    </motion.header>
  );
};

export default Header;

