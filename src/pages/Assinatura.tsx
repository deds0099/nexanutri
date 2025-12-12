import { motion } from "framer-motion";
import { Check, ArrowLeft, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import logoNexa from "@/assets/logo-nexa.png";

const plans = [
  {
    id: "mensal",
    name: "Mensal",
    price: "9,99",
    period: "/mês",
    totalPrice: "9,99",
    duration: 1, // meses
    features: [
      "Dieta personalizada",
      "Calculadora IMC",
      "Receitas exclusivas",
      "Suporte via chat",
    ],
    popular: false,
  },
  {
    id: "semestral",
    name: "Semestral",
    price: "13,33",
    period: "/mês",
    originalPrice: "59,94",
    totalPrice: "79,99",
    duration: 6, // meses
    features: [
      "Tudo do plano mensal",
      "Atualizações semanais",
      "Lista de compras",
      "Suporte prioritário",
    ],
    popular: true,
  },
  {
    id: "anual",
    name: "Anual",
    price: "5,00",
    period: "/mês",
    originalPrice: "119,88",
    totalPrice: "59,99",
    duration: 12, // meses
    features: [
      "Tudo do plano semestral",
      "Consulta com nutricionista",
      "Acesso vitalício às receitas",
      "Bônus exclusivos",
    ],
    popular: false,
  },
];

const Assinatura = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-hero py-8 px-4">
      <div className="container mx-auto max-w-6xl">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft size={20} />
          Voltar
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <img src={logoNexa} alt="NexaNutri" className="w-20 h-20 mx-auto mb-4" />
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Escolha seu plano
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Comece sua transformação hoje mesmo. Cancele quando quiser.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`relative bg-card rounded-3xl p-8 border ${plan.popular
                  ? "border-primary shadow-glow scale-105"
                  : "border-border shadow-card"
                }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                  <Star size={14} fill="currentColor" />
                  Mais Popular
                </div>
              )}

              <h3 className="text-xl font-bold text-foreground mb-2">{plan.name}</h3>

              <div className="mb-6">
                <span className="text-4xl font-bold text-primary">R${plan.price}</span>
                <span className="text-muted-foreground">{plan.period}</span>
                {plan.totalPrice && (
                  <p className="text-sm text-muted-foreground mt-1">
                    <span className="line-through">R${plan.originalPrice}</span>{" "}
                    <span className="text-primary font-semibold">R${plan.totalPrice} total</span>
                  </p>
                )}
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-foreground">
                    <div className="w-5 h-5 bg-secondary rounded-full flex items-center justify-center flex-shrink-0">
                      <Check size={12} className="text-primary" />
                    </div>
                    {feature}
                  </li>
                ))}
              </ul>

              <Button
                onClick={() => navigate("/auth")}
                className={`w-full py-6 rounded-xl font-semibold ${plan.popular
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  }`}
              >
                Assinar agora
              </Button>
            </motion.div>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-muted-foreground mt-8 text-sm"
        >
          Pagamento seguro • Cancele quando quiser • Satisfação garantida
        </motion.p>
      </div>
    </div>
  );
};

export default Assinatura;
