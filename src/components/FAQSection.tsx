import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "Como funciona a NexaNutri?",
    answer: "A NexaNutri utiliza inteligência artificial para criar planos alimentares personalizados. Após responder um questionário sobre seus hábitos, preferências e objetivos, nosso sistema gera uma dieta única para você, com receitas deliciosas e lista de compras.",
  },
  {
    question: "Formas de pagamento",
    answer: "Aceitamos cartões de crédito (Visa, Mastercard, Elo), débito, PIX e boleto bancário. Parcelamos em até 12x sem juros no cartão de crédito.",
  },
  {
    question: "A NexaNutri é realmente confiável?",
    answer: "Sim! Somos uma empresa registrada com mais de 5 milhões de usuários satisfeitos. Trabalhamos com nutricionistas certificados e seguimos todas as regulamentações de saúde e alimentação.",
  },
  {
    question: "Precisa de ajuda? Onde conseguir suporte?",
    answer: "Oferecemos suporte humanizado via WhatsApp, chat no aplicativo e e-mail. Nossa equipe está disponível de segunda a sexta, das 8h às 20h.",
  },
  {
    question: "Qual é o valor da NexaNutri?",
    answer: "Oferecemos planos acessíveis a partir de R$9,90/mês. Confira nossos planos e escolha o que melhor se adapta às suas necessidades.",
  },
  {
    question: "A NexaNutri tem nutricionistas?",
    answer: "Sim! Contamos com uma equipe de nutricionistas qualificados que supervisionam todos os planos alimentares e estão disponíveis para consultas online.",
  },
];

const FAQSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} id="faq" className="py-20 bg-background">
      <div className="container mx-auto px-4 max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Perguntas Frequentes
          </h2>
          <p className="text-lg text-muted-foreground">
            Tudo o que você precisa saber sobre a NexaNutri.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-card border border-border rounded-xl px-6 shadow-soft data-[state=open]:shadow-card transition-shadow"
              >
                <AccordionTrigger className="text-left text-foreground font-semibold hover:text-primary py-5">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-5">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
};

export default FAQSection;
