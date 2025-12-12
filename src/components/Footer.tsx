import logoNexa from "@/assets/logo-nexa.png";

const Footer = () => {
  return (
    <footer className="bg-foreground text-primary-foreground py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-3">
            <img src={logoNexa} alt="NexaNutri Logo" className="h-12 w-12 object-contain" />
            <div>
              <p className="font-bold text-xl">NexaNutri</p>
              <p className="text-primary-foreground/60 text-sm">Sua dieta, do seu jeito!</p>
            </div>
          </div>

          <nav className="flex flex-wrap justify-center gap-6 text-sm">
            <a href="#" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors">
              Termos de Uso
            </a>
            <a href="#" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors">
              Política de Privacidade
            </a>
            <a href="#" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors">
              Contato
            </a>
          </nav>
        </div>

        <div className="border-t border-primary-foreground/10 mt-8 pt-8 text-center">
          <p className="text-primary-foreground/50 text-sm">
            © 2024 NexaNutri. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
