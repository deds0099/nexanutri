import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import logoNexa from "@/assets/logo-nexa.png";
import { useAuth } from "@/contexts/AuthContext";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { signIn, signUp, user, userData, hasActiveSubscription } = useAuth();

  // Redirecionar se já estiver logado
  useEffect(() => {
    if (user) {
      // Se tiver user mas não tiver userData, aguarda carregar (evita redirect errado)
      if (userData === null) return;

      if (hasActiveSubscription()) {
        navigate("/dieta");
      } else {
        navigate("/assinatura");
      }
    }
  }, [user, userData, navigate, hasActiveSubscription]);

  const getErrorMessage = (errorCode: string): string => {
    const errorMessages: Record<string, string> = {
      "auth/email-already-in-use": "Este email já está em uso",
      "auth/invalid-email": "Email inválido",
      "auth/operation-not-allowed": "Operação não permitida",
      "auth/weak-password": "Senha muito fraca (mínimo 6 caracteres)",
      "auth/user-disabled": "Usuário desativado",
      "auth/user-not-found": "Usuário não encontrado",
      "auth/wrong-password": "Senha incorreta",
      "auth/invalid-credential": "Email ou senha incorretos",
      "auth/too-many-requests": "Muitas tentativas. Tente novamente mais tarde",
    };
    return errorMessages[errorCode] || "Erro ao autenticar. Tente novamente.";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Validação básica
    if (!email || !password) {
      toast.error("Preencha todos os campos");
      setIsLoading(false);
      return;
    }

    if (!isLogin && !name) {
      toast.error("Preencha seu nome");
      setIsLoading(false);
      return;
    }

    try {
      if (isLogin) {
        await signIn(email, password);
        toast.success("Login realizado com sucesso!");
      } else {
        await signUp(email, password, name);
        toast.success("Conta criada com sucesso!");
      }
      // O redirecionamento será feito pelo useEffect
    } catch (error: unknown) {
      const firebaseError = error as { code?: string };
      const errorMessage = getErrorMessage(firebaseError.code || "");
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft size={20} />
          Voltar
        </button>

        <div className="bg-card rounded-3xl shadow-card p-8 border border-border">
          <div className="text-center mb-8">
            <img src={logoNexa} alt="NexaNutri" className="w-20 h-20 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-foreground">
              {isLogin ? "Bem-vindo de volta!" : "Crie sua conta"}
            </h1>
            <p className="text-muted-foreground mt-2">
              {isLogin ? "Entre para acessar sua dieta" : "Comece sua jornada saudável"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <Label htmlFor="name" className="text-foreground">Nome completo</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Seu nome"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1"
                />
              </div>
            )}

            <div>
              <Label htmlFor="email" className="text-foreground">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="password" className="text-foreground">Senha</Label>
              <div className="relative mt-1">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 py-6 rounded-xl font-semibold"
            >
              {isLoading ? "Carregando..." : isLogin ? "Entrar" : "Criar conta"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-muted-foreground">
              {isLogin ? "Não tem conta?" : "Já tem conta?"}{" "}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-primary font-semibold hover:underline"
              >
                {isLogin ? "Criar conta" : "Fazer login"}
              </button>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;

