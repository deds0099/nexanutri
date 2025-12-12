import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";

const stats = [
  { value: "5M+", label: "Usuários cadastrados" },
  { value: "95%", label: "Satisfação" },
  { value: "8/5", label: "Nutricionistas Qualificados" },
];

const StatsSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center text-lg text-muted-foreground mb-12 max-w-2xl mx-auto"
        >
          A NexaNutri coleta suas medidas e alimentos preferidos. Com essas informações, cria uma{" "}
          <span className="text-primary font-semibold">dieta personalizada</span> para você.
        </motion.p>

        <div className="bg-gradient-stats rounded-3xl p-8 md:p-12 shadow-card">
          <div className="grid md:grid-cols-3 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={isInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center relative"
              >
                {/* Decorative dot */}
                <div className="absolute -top-2 right-1/4 w-3 h-3 bg-primary rounded-full opacity-60" />
                
                <p className="text-4xl md:text-5xl font-bold text-primary mb-2">
                  {stat.value}
                </p>
                <p className="text-muted-foreground font-medium">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
