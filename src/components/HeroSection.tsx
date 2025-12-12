import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import logoNexa from "@/assets/logo-nexa.png";

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-screen bg-gradient-hero pt-24 overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-40 left-10 w-20 h-20 bg-primary/10 rounded-full blur-2xl" />
      <div className="absolute bottom-40 right-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 py-16 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left - Mascot */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative flex justify-center lg:justify-end order-2 lg:order-1"
          >
            <div className="relative">
              <motion.img
                src={logoNexa}
                alt="NexaNutri Mascote"
                className="w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 object-contain drop-shadow-2xl"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              />
              {/* Glow effect */}
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl -z-10 scale-75" />
            </div>
          </motion.div>

          {/* Right - Content */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center lg:text-left order-1 lg:order-2"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="inline-flex items-center gap-2 bg-secondary px-4 py-2 rounded-full mb-6"
            >
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-secondary-foreground">
                O maior site de dietas do Brasil
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4"
            >
              NexaNutri
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-xl md:text-2xl text-muted-foreground mb-8"
            >
              sua dieta, do seu jeito!
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Button
                size="lg"
                onClick={() => navigate("/auth")}
                className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-glow px-8 py-6 text-lg font-semibold rounded-full group"
              >
                Criar uma conta
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
