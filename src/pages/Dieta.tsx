import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import logoNexa from "@/assets/logo-nexa.png";
import { useAuth } from "@/contexts/AuthContext";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

import { calculateDiet, DietInput } from "@/utils/dietCalculator";

const atividades = [
  { id: "sedentario", label: "Sedentário", desc: "Pouco ou nenhum exercício" },
  { id: "leve", label: "Levemente ativo", desc: "Exercício leve 1-3 dias/semana" },
  { id: "moderado", label: "Moderadamente ativo", desc: "Exercício moderado 3-5 dias/semana" },
  { id: "intenso", label: "Muito ativo", desc: "Exercício pesado 6-7 dias/semana" },
];

const objetivos = [
  { id: "emagrecer", label: "Emagrecer", emoji: "🔥" },
  { id: "manter", label: "Manter peso", emoji: "⚖️" },
  { id: "ganhar", label: "Ganhar massa", emoji: "💪" },
];

const restricoes = [
  { id: "nenhuma", label: "Nenhuma" },
  { id: "vegetariano", label: "Vegetariano" },
  { id: "vegano", label: "Vegano" },
  { id: "lactose", label: "Sem lactose" },
  { id: "gluten", label: "Sem glúten" },
];

const generos = [
  { id: "masculino", label: "Masculino", emoji: "👨" },
  { id: "feminino", label: "Feminino", emoji: "👩" },
];

const Dieta = () => {
  const navigate = useNavigate();
  const { user, refreshUserData } = useAuth();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    nome: "",
    idade: "",
    peso: "",
    altura: "",
    sexo: "",
    atividade: "",
    objetivo: "",
    restricao: "",
    refeicoes: "",
  });

  const generateDiet = () => {
    const input: DietInput = {
      sexo: formData.sexo as "masculino" | "feminino",
      idade: parseInt(formData.idade),
      peso: parseFloat(formData.peso),
      altura: parseFloat(formData.altura),
      atividade: formData.atividade as "sedentario" | "leve" | "moderado" | "intenso",
      objetivo: formData.objetivo as "emagrecer" | "manter" | "ganhar",
      refeicoes: formData.refeicoes ? parseInt(formData.refeicoes) : undefined,
      restricao: formData.restricao
    };

    const plan = calculateDiet(input);

    return {
      ...plan,
      generatedAt: new Date()
    };
  };

  const handleNext = async () => {
    if (step === 1 && (!formData.nome || !formData.idade || !formData.sexo)) {
      toast.error("Preencha todos os campos e selecione o sexo");
      return;
    }
    if (step === 2 && (!formData.peso || !formData.altura)) {
      toast.error("Preencha peso e altura");
      return;
    }
    if (step === 3 && !formData.atividade) {
      toast.error("Selecione o nível de atividade");
      return;
    }
    if (step === 4 && !formData.objetivo) {
      toast.error("Selecione um objetivo");
      return;
    }
    if (step < 5) {
      setStep(step + 1);
    } else {
      if (!user) {
        toast.error("Erro: Usuário não autenticado");
        return;
      }

      try {
        toast.info("Calculando sua dieta personalizada...");
        const dietPlan = generateDiet();

        await updateDoc(doc(db, "users", user.uid), {
          diet: dietPlan,
          // Atualizar também dados antropométricos se quiser
          peso: formData.peso,
          altura: formData.altura,
          idade: formData.idade,
          sexo: formData.sexo,
          atividade: formData.atividade,
          objetivo: formData.objetivo
        });

        await refreshUserData();

        toast.success("Dieta gerada com sucesso!");
        setTimeout(() => {
          navigate("/minha-dieta");
        }, 1000);

      } catch (error) {
        console.error("Erro ao salvar dieta:", error);
        toast.error("Erro ao salvar sua dieta");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero py-8 px-4">
      <div className="container mx-auto max-w-lg">
        <button
          onClick={() => step > 1 ? setStep(step - 1) : navigate("/")}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft size={20} />
          {step > 1 ? "Voltar" : "Início"}
        </button>

        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="bg-card rounded-3xl shadow-card p-8 border border-border"
        >
          <div className="text-center mb-8">
            <img src={logoNexa} alt="NexaNutri" className="w-16 h-16 mx-auto mb-4" />
            <div className="flex justify-center gap-2 mb-4">
              {[1, 2, 3, 4, 5].map((s) => (
                <div
                  key={s}
                  className={`w-3 h-3 rounded-full transition-colors ${s <= step ? "bg-primary" : "bg-border"
                    }`}
                />
              ))}
            </div>
            <p className="text-sm text-muted-foreground">Passo {step} de 5</p>
          </div>

          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-foreground text-center mb-6">
                Vamos nos conhecer?
              </h2>
              <div>
                <Label htmlFor="nome">Qual seu nome?</Label>
                <Input
                  id="nome"
                  placeholder="Seu nome"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="idade">Qual sua idade?</Label>
                <Input
                  id="idade"
                  type="number"
                  placeholder="Ex: 25"
                  value={formData.idade}
                  onChange={(e) => setFormData({ ...formData, idade: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="sexo">Sexo biológico</Label>
                <div className="grid grid-cols-2 gap-3 mt-1">
                  {generos.map((g) => (
                    <button
                      key={g.id}
                      onClick={() => setFormData({ ...formData, sexo: g.id })}
                      className={`flex items-center justify-center gap-2 p-3 rounded-xl border transition-all ${formData.sexo === g.id
                        ? "border-primary bg-secondary"
                        : "border-border hover:border-primary/50"
                        }`}
                    >
                      <span className="text-xl">{g.emoji}</span>
                      <span className="font-medium text-foreground">{g.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-foreground text-center mb-6">
                Suas medidas
              </h2>
              <div>
                <Label htmlFor="peso">Peso atual (kg)</Label>
                <Input
                  id="peso"
                  type="number"
                  placeholder="Ex: 70"
                  value={formData.peso}
                  onChange={(e) => setFormData({ ...formData, peso: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="altura">Altura (cm)</Label>
                <Input
                  id="altura"
                  type="number"
                  placeholder="Ex: 175"
                  value={formData.altura}
                  onChange={(e) => setFormData({ ...formData, altura: e.target.value })}
                  className="mt-1"
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-foreground text-center mb-6">
                Nível de atividade física
              </h2>
              <div className="grid gap-3">
                {atividades.map((atv) => (
                  <button
                    key={atv.id}
                    onClick={() => setFormData({ ...formData, atividade: atv.id })}
                    className={`flex flex-col items-start p-4 rounded-xl border transition-all text-left ${formData.atividade === atv.id
                      ? "border-primary bg-secondary"
                      : "border-border hover:border-primary/50"
                      }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <span className="font-medium text-foreground">{atv.label}</span>
                      {formData.atividade === atv.id && (
                        <Check size={20} className="text-primary" />
                      )}
                    </div>
                    <span className="text-sm text-muted-foreground">{atv.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-foreground text-center mb-6">
                Qual seu objetivo?
              </h2>
              <div className="grid gap-3">
                {objetivos.map((obj) => (
                  <button
                    key={obj.id}
                    onClick={() => setFormData({ ...formData, objetivo: obj.id })}
                    className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${formData.objetivo === obj.id
                      ? "border-primary bg-secondary"
                      : "border-border hover:border-primary/50"
                      }`}
                  >
                    <span className="text-2xl">{obj.emoji}</span>
                    <span className="font-medium text-foreground">{obj.label}</span>
                    {formData.objetivo === obj.id && (
                      <Check size={20} className="text-primary ml-auto" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-foreground text-center mb-6">
                Alguma restrição alimentar?
              </h2>
              <div className="grid gap-3">
                {restricoes.map((res) => (
                  <button
                    key={res.id}
                    onClick={() => setFormData({ ...formData, restricao: res.id })}
                    className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${formData.restricao === res.id
                      ? "border-primary bg-secondary"
                      : "border-border hover:border-primary/50"
                      }`}
                  >
                    <span className="font-medium text-foreground">{res.label}</span>
                    {formData.restricao === res.id && (
                      <Check size={20} className="text-primary ml-auto" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          <Button
            onClick={handleNext}
            className="w-full mt-8 bg-primary text-primary-foreground hover:bg-primary/90 py-6 rounded-xl font-semibold group"
          >
            {step === 5 ? "Gerar minha dieta" : "Continuar"}
            <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default Dieta;
