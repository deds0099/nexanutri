import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import logoNexa from "@/assets/logo-nexa.png";

const getIMCClassification = (imc: number) => {
  if (imc < 18.5) return { label: "Abaixo do peso", color: "text-yellow-500", bg: "bg-yellow-500" };
  if (imc < 24.9) return { label: "Peso normal", color: "text-primary", bg: "bg-primary" };
  if (imc < 29.9) return { label: "Sobrepeso", color: "text-orange-500", bg: "bg-orange-500" };
  if (imc < 34.9) return { label: "Obesidade grau I", color: "text-red-400", bg: "bg-red-400" };
  if (imc < 39.9) return { label: "Obesidade grau II", color: "text-red-500", bg: "bg-red-500" };
  return { label: "Obesidade grau III", color: "text-red-600", bg: "bg-red-600" };
};

const IMC = () => {
  const navigate = useNavigate();
  const [peso, setPeso] = useState("");
  const [altura, setAltura] = useState("");
  const [resultado, setResultado] = useState<number | null>(null);

  const calcularIMC = () => {
    const pesoNum = parseFloat(peso);
    const alturaNum = parseFloat(altura) / 100;
    
    if (pesoNum > 0 && alturaNum > 0) {
      const imc = pesoNum / (alturaNum * alturaNum);
      setResultado(imc);
    }
  };

  const classification = resultado ? getIMCClassification(resultado) : null;

  return (
    <div className="min-h-screen bg-gradient-hero py-8 px-4">
      <div className="container mx-auto max-w-md">
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
          className="bg-card rounded-3xl shadow-card p-8 border border-border"
        >
          <div className="text-center mb-8">
            <img src={logoNexa} alt="NexaNutri" className="w-16 h-16 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-foreground">Calculadora de IMC</h1>
            <p className="text-muted-foreground mt-2">
              Descubra seu Índice de Massa Corporal
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="peso">Peso (kg)</Label>
              <Input
                id="peso"
                type="number"
                placeholder="Ex: 70"
                value={peso}
                onChange={(e) => setPeso(e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="altura">Altura (cm)</Label>
              <Input
                id="altura"
                type="number"
                placeholder="Ex: 175"
                value={altura}
                onChange={(e) => setAltura(e.target.value)}
                className="mt-1"
              />
            </div>

            <Button
              onClick={calcularIMC}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 py-6 rounded-xl font-semibold"
            >
              <Calculator size={18} className="mr-2" />
              Calcular IMC
            </Button>
          </div>

          {resultado && classification && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-8 p-6 bg-secondary rounded-2xl text-center"
            >
              <p className="text-sm text-muted-foreground mb-2">Seu IMC é</p>
              <p className={`text-5xl font-bold ${classification.color}`}>
                {resultado.toFixed(1)}
              </p>
              <div className={`mt-4 inline-block px-4 py-2 rounded-full ${classification.bg} text-primary-foreground font-medium`}>
                {classification.label}
              </div>

              <div className="mt-6 pt-6 border-t border-border">
                <p className="text-sm text-muted-foreground mb-4">Tabela de referência:</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-left text-muted-foreground">Abaixo do peso</div>
                  <div className="text-right text-foreground">&lt; 18.5</div>
                  <div className="text-left text-muted-foreground">Peso normal</div>
                  <div className="text-right text-foreground">18.5 - 24.9</div>
                  <div className="text-left text-muted-foreground">Sobrepeso</div>
                  <div className="text-right text-foreground">25 - 29.9</div>
                  <div className="text-left text-muted-foreground">Obesidade</div>
                  <div className="text-right text-foreground">&gt; 30</div>
                </div>
              </div>

              <Button
                onClick={() => navigate("/dieta")}
                className="w-full mt-6 bg-primary text-primary-foreground hover:bg-primary/90 py-6 rounded-xl"
              >
                Criar minha dieta personalizada
              </Button>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default IMC;
