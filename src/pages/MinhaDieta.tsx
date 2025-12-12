import { motion } from "framer-motion";
import { ArrowLeft, Calendar, Utensils } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import logoNexa from "@/assets/logo-nexa.png";

const refeicoes = [
  {
    nome: "Café da manhã",
    horario: "07:00",
    itens: ["2 ovos mexidos", "1 fatia de pão integral", "1 banana", "Café sem açúcar"],
    calorias: 350,
  },
  {
    nome: "Lanche da manhã",
    horario: "10:00",
    itens: ["1 maçã", "10 amêndoas"],
    calorias: 150,
  },
  {
    nome: "Almoço",
    horario: "12:30",
    itens: ["150g de frango grelhado", "4 colheres de arroz integral", "Salada verde à vontade", "1 colher de azeite"],
    calorias: 500,
  },
  {
    nome: "Lanche da tarde",
    horario: "15:30",
    itens: ["Iogurte natural", "1 colher de granola"],
    calorias: 180,
  },
  {
    nome: "Jantar",
    horario: "19:00",
    itens: ["150g de peixe assado", "Legumes refogados", "Batata doce média"],
    calorias: 420,
  },
];

const MinhaDieta = () => {
  const navigate = useNavigate();
  const totalCalorias = refeicoes.reduce((acc, ref) => acc + ref.calorias, 0);

  return (
    <div className="min-h-screen bg-gradient-hero py-8 px-4">
      <div className="container mx-auto max-w-2xl">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft size={20} />
          Início
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="text-center mb-8">
            <img src={logoNexa} alt="NexaNutri" className="w-16 h-16 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-foreground">Sua Dieta Personalizada</h1>
            <p className="text-muted-foreground mt-2">Plano alimentar criado especialmente para você</p>
          </div>

          <div className="bg-card rounded-2xl p-6 shadow-card border border-border mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-secondary rounded-xl flex items-center justify-center">
                  <Calendar className="text-primary" size={24} />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Hoje</p>
                  <p className="text-sm text-muted-foreground">Segunda-feira</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-primary">{totalCalorias}</p>
                <p className="text-sm text-muted-foreground">kcal total</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {refeicoes.map((refeicao, index) => (
              <motion.div
                key={refeicao.nome}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-card rounded-2xl p-6 shadow-soft border border-border"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center">
                      <Utensils className="text-primary" size={18} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{refeicao.nome}</h3>
                      <p className="text-sm text-muted-foreground">{refeicao.horario}</p>
                    </div>
                  </div>
                  <span className="text-sm font-medium text-primary">{refeicao.calorias} kcal</span>
                </div>

                <ul className="space-y-2">
                  {refeicao.itens.map((item) => (
                    <li key={item} className="flex items-center gap-2 text-foreground">
                      <span className="w-1.5 h-1.5 bg-primary rounded-full" />
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>

          <div className="mt-8 flex gap-4">
            <Button
              variant="outline"
              onClick={() => navigate("/imc")}
              className="flex-1 py-6 rounded-xl"
            >
              Calcular IMC
            </Button>
            <Button
              onClick={() => navigate("/assinatura")}
              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 py-6 rounded-xl"
            >
              Assinar Premium
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default MinhaDieta;
