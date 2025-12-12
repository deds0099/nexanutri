import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { useNavigate } from "react-router-dom";

const features = [
  { title: "Dieta personalizada", emoji: "🍳", route: "/dieta" },
  { title: "Cálculos IMC", emoji: "⚖️", route: "/imc" },
  { title: "Aplicativo", emoji: "📱", route: "/assinatura" },
];

const FeaturesSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const navigate = useNavigate();

  return (
    <section ref={ref} id="features" className="py-20 bg-muted">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Funcionalidades Incríveis
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Tudo o que você precisa para alcançar seus objetivos de saúde e bem-estar.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              onClick={() => navigate(feature.route)}
              className="relative bg-card rounded-2xl p-8 text-center shadow-soft hover:shadow-card hover:-translate-y-1 transition-all border border-border group cursor-pointer"
            >
              <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">
                {feature.emoji}
              </div>
              
              <h3 className="font-semibold text-foreground text-lg">
                {feature.title}
              </h3>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
