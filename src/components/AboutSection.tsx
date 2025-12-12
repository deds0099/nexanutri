import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Heart, Sparkles, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const features = [
  { icon: UserCheck, label: "Suporte Humanizado" },
  { icon: Sparkles, label: "Personalização Total" },
  { icon: Heart, label: "Adaptação Contínua" },
];

const AboutSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const navigate = useNavigate();

  return (
    <section ref={ref} id="how-it-works" className="py-20 bg-primary relative overflow-hidden">
      {/* Decorative sparkles */}
      <motion.div
        animate={{ y: [0, -10, 0], opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 3, repeat: Infinity }}
        className="absolute top-20 left-1/4 text-primary-foreground/30"
      >
        <Sparkles size={24} />
      </motion.div>
      <motion.div
        animate={{ y: [0, 10, 0], opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 4, repeat: Infinity }}
        className="absolute bottom-20 right-1/4 text-primary-foreground/30"
      >
        <Sparkles size={32} />
      </motion.div>

      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center text-primary-foreground max-w-3xl mx-auto"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Nutri que entende você
          </h2>

          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {features.map((feature) => (
              <div
                key={feature.label}
                className="flex items-center gap-2 bg-primary-foreground/10 px-4 py-2 rounded-full"
              >
                <feature.icon className="w-4 h-4" />
                <span className="text-sm font-medium">{feature.label}</span>
              </div>
            ))}
          </div>

          <p className="text-primary-foreground/80 text-lg mb-10 leading-relaxed">
            Nosso sistema desenvolvido por nutricionistas analisa seus hábitos, preferências e 
            objetivos para criar um plano nutricional único e adaptável ao seu dia a dia.
          </p>

          <Button
            size="lg"
            onClick={() => navigate("/assinatura")}
            className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 font-semibold px-8 rounded-full"
          >
            Assine agora
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default AboutSection;
