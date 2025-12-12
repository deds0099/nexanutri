import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Heart, Apple, User, MessageCircle } from "lucide-react";
import logoNexa from "@/assets/logo-nexa.png";

const benefits = [
  {
    icon: Apple,
    title: "Alimentos Favoritos",
    description: "Uma dieta elaborada especialmente com base nos alimentos que você mais gosta.",
  },
  {
    icon: Heart,
    title: "Sua Dieta, do seu jeito",
    description: "Plano alimentar totalmente personalizado com base nas suas preferências e objetivo.",
  },
  {
    icon: MessageCircle,
    title: "Consulta com a nutricionista",
    description: "Acesso a nutricionistas qualificados para orientação personalizada quando você precisar.",
  },
];

const BenefitsSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Sua saúde começa com suas escolhas.
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Criamos um plano que respeita seus gostos, seu ritmo e oferece suporte com o nutricionista no caminho.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Benefits Cards */}
          <div className="space-y-6">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, x: -30 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                className="flex gap-4 p-6 bg-card rounded-2xl shadow-soft hover:shadow-card transition-shadow border border-border"
              >
                <div className="flex-shrink-0 w-12 h-12 bg-secondary rounded-xl flex items-center justify-center">
                  <span className="text-2xl text-primary">💚</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    {benefit.title}
                  </h3>
                  <p className="text-muted-foreground">{benefit.description}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Mascot */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.8 }}
            className="flex justify-center"
          >
            <div className="relative">
              <motion.img
                src={logoNexa}
                alt="NexaNutri Mascote"
                className="w-72 h-72 md:w-96 md:h-96 object-contain"
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              />
              {/* Heart decoration */}
              <motion.div
                animate={{ scale: [1, 1.2, 1], opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute top-10 right-0 text-4xl"
              >
                💚
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;
