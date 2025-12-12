import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const CTASection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const navigate = useNavigate();

  return (
    <section ref={ref} className="py-20 bg-gradient-stats">
      <div className="container mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="max-w-2xl mx-auto"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
            Pronto para começar?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Junte-se a milhares de pessoas que já transformaram sua relação com a alimentação 
            e descubra o poder de uma nutrição inteligente.
          </p>
          <Button
            size="lg"
            onClick={() => navigate("/dieta")}
            className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-glow px-10 py-6 text-lg font-semibold rounded-full group"
          >
            Começar agora
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;
