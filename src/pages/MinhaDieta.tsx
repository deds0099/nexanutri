import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Calendar, Utensils, Download, Calculator, User, FileText, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import logoNexa from "@/assets/logo-nexa.png";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { doc, updateDoc, deleteField } from "firebase/firestore";
import { db } from "@/lib/firebase";



const getIMCClassification = (imc: number) => {
  if (imc < 18.5) return { label: "Abaixo do peso", color: "text-yellow-500", bg: "bg-yellow-500" };
  if (imc < 24.9) return { label: "Peso normal", color: "text-primary", bg: "bg-primary" };
  if (imc < 29.9) return { label: "Sobrepeso", color: "text-orange-500", bg: "bg-orange-500" };
  if (imc < 34.9) return { label: "Obesidade grau I", color: "text-red-400", bg: "bg-red-400" };
  if (imc < 39.9) return { label: "Obesidade grau II", color: "text-red-500", bg: "bg-red-500" };
  return { label: "Obesidade grau III", color: "text-red-600", bg: "bg-red-600" };
};

const MinhaDieta = () => {
  const navigate = useNavigate();
  const { user, userData, signOut } = useAuth();
  const dietRef = useRef<HTMLDivElement>(null);

  // IMC State
  const [peso, setPeso] = useState("");
  const [altura, setAltura] = useState("");
  const [imcResultado, setImcResultado] = useState<number | null>(null);

  // Diet Data
  const diet = userData?.diet;
  const refeicoes = diet?.meals || [];
  const totalCalorias = diet?.calories || 0;
  const hasDiet = refeicoes.length > 0;

  const { refreshUserData } = useAuth();

  useEffect(() => {
    refreshUserData();
  }, []);

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  const handleDeleteDiet = async () => {
    if (!user) return;
    try {
      if (confirm("Tem certeza que deseja excluir seu plano alimentar atual?")) {
        await updateDoc(doc(db, "users", user.uid), {
          diet: deleteField()
        });
        await refreshUserData();
        toast.success("Dieta excluída com sucesso!");
      }
    } catch (error) {
      console.error("Erro ao excluir dieta:", error);
      toast.error("Erro ao excluir dieta");
    }
  };

  const handleRegenerateDiet = () => {
    if (confirm("Isso irá substituir sua dieta atual por uma nova. Deseja continuar?")) {
      navigate("/dieta");
    }
  };

  const handleDownloadPDF = async () => {
    if (!dietRef.current) return;

    try {
      toast.info("Gerando PDF...");

      const canvas = await html2canvas(dietRef.current, {
        scale: 2,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Dieta_NexaNutri_${userData?.name || "Usuario"}.pdf`);

      toast.success("PDF baixado com sucesso!");
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      toast.error("Erro ao gerar PDF");
    }
  };

  const calcularIMC = () => {
    const pesoNum = parseFloat(peso);
    const alturaNum = parseFloat(altura) / 100;

    if (pesoNum > 0 && alturaNum > 0) {
      const imc = pesoNum / (alturaNum * alturaNum);
      setImcResultado(imc);
    }
  };

  const imcClassification = imcResultado ? getIMCClassification(imcResultado) : null;

  return (
    <div className="min-h-screen bg-background pb-12">
      {/* Header do Dashboard */}
      <header className="bg-card border-b border-border sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Debug UI removed */}

            <img src={logoNexa} alt="NexaNutri" className="w-10 h-10" />
            <div>
              <h1 className="text-lg font-bold text-foreground">
                Olá, {userData?.name || user?.email?.split('@')[0]}!
              </h1>
              <p className="text-xs text-muted-foreground">Membro Premium</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={handleLogout} title="Sair">
              <LogOut size={20} className="text-muted-foreground" />
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Tabs defaultValue="dieta" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8 h-auto p-1 bg-secondary/50 rounded-xl">
            <TabsTrigger
              value="dieta"
              className="py-3 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg transition-all"
            >
              <FileText className="mr-2 w-4 h-4" />
              Meu Plano
            </TabsTrigger>
            <TabsTrigger
              value="imc"
              className="py-3 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg transition-all"
            >
              <Calculator className="mr-2 w-4 h-4" />
              Calculadora IMC
            </TabsTrigger>
          </TabsList>

          {/* ABA DIETA */}
          <TabsContent value="dieta">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="flex flex-col sm:flex-row justify-between gap-4">
                {hasDiet && (
                  <div className="flex gap-2">
                    <Button
                      onClick={handleRegenerateDiet}
                      variant="outline"
                      className="text-muted-foreground hover:text-foreground"
                    >
                      Gerar Novo Plano
                    </Button>
                    <Button
                      onClick={handleDeleteDiet}
                      variant="destructive"
                      className="bg-red-500/10 text-red-500 hover:bg-red-500/20 border-0"
                    >
                      Excluir
                    </Button>
                  </div>
                )}

                {hasDiet && (
                  <Button
                    onClick={handleDownloadPDF}
                    variant="outline"
                    className="gap-2 border-primary text-primary hover:bg-primary/10 w-full sm:w-auto ml-auto"
                  >
                    <Download size={18} />
                    Baixar PDF
                  </Button>
                )}
              </div>

              {/* Área imprimível */}
              <div ref={dietRef} className="bg-card rounded-2xl p-6 md:p-8 shadow-card border border-border">
                <div className="flex flex-col md:flex-row items-center justify-between mb-8 pb-6 border-b border-border gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-secondary rounded-2xl flex items-center justify-center">
                      <Calendar className="text-primary" size={32} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-foreground">Sua Dieta Diária</h2>
                      <p className="text-muted-foreground">Meta: <span className="capitalize">{diet?.objective || "Personalizado"}</span></p>
                    </div>
                  </div>
                  <div className="text-center md:text-right bg-secondary/50 p-4 rounded-xl">
                    <p className="text-3xl font-bold text-primary">{totalCalorias}</p>
                    <p className="text-sm text-muted-foreground font-medium">kcal diárias</p>
                  </div>
                </div>

                {diet?.macros && (
                  <div className="grid grid-cols-3 gap-4 mb-8">
                    <div className="bg-blue-500/10 p-4 rounded-xl text-center border border-blue-500/20">
                      <p className="text-2xl font-bold text-blue-600">{diet.macros.protein.g}g</p>
                      <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide">Proteínas ({diet.macros.protein.pct}%)</p>
                    </div>
                    <div className="bg-green-500/10 p-4 rounded-xl text-center border border-green-500/20">
                      <p className="text-2xl font-bold text-green-600">{diet.macros.carbs.g}g</p>
                      <p className="text-xs font-semibold text-green-600 uppercase tracking-wide">Carboidratos ({diet.macros.carbs.pct}%)</p>
                    </div>
                    <div className="bg-orange-500/10 p-4 rounded-xl text-center border border-orange-500/20">
                      <p className="text-2xl font-bold text-orange-600">{diet.macros.fats.g}g</p>
                      <p className="text-xs font-semibold text-orange-600 uppercase tracking-wide">Gorduras ({diet.macros.fats.pct}%)</p>
                    </div>
                  </div>
                )}

                {diet?.warnings && diet.warnings.length > 0 && (
                  <div className="mb-8 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
                    <h4 className="font-bold text-yellow-600 mb-2 flex items-center gap-2">⚠️ Atenção</h4>
                    <ul className="list-disc list-inside text-sm text-yellow-700">
                      {diet.warnings.map((w: string, i: number) => (
                        <li key={i}>{w}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="space-y-6">
                  {!hasDiet ? (
                    <div className="text-center py-10">
                      <p className="text-muted-foreground mb-4">Você ainda não gerou seu plano alimentar.</p>
                      <Button onClick={() => navigate("/dieta")} className="bg-primary text-white">
                        Gerar Minha Dieta Agora
                      </Button>
                    </div>
                  ) : (
                    refeicoes.map((refeicao, index) => (
                      <div key={index} className="flex flex-col md:flex-row gap-4 p-4 rounded-xl hover:bg-secondary/20 transition-colors border border-transparent hover:border-border">
                        <div className="flex-shrink-0 flex md:flex-col items-center gap-3 md:w-24">
                          <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center">
                            <Utensils className="text-primary" size={18} />
                          </div>
                          <span className="text-sm font-bold text-muted-foreground">{refeicao.time}</span>
                        </div>

                        <div className="flex-grow">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-bold text-lg text-foreground">{refeicao.name}</h3>
                            <span className="text-xs font-medium px-2 py-1 bg-primary/10 text-primary rounded-full">
                              {refeicao.calories} kcal
                            </span>
                          </div>
                          <ul className="grid md:grid-cols-2 gap-2">
                            {refeicao.items.map((item, i) => (
                              <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                                <span className="w-1.5 h-1.5 bg-primary rounded-full flex-shrink-0" />
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="mt-8 pt-6 border-t border-border flex items-center justify-center gap-2 text-muted-foreground text-sm">
                  <img src={logoNexa} alt="NexaNutri" className="w-6 h-6 grayscale opacity-50" />
                  <span>Gerado via NexaNutri Premium</span>
                </div>
              </div>
            </motion.div>
          </TabsContent>

          {/* ABA IMC */}
          <TabsContent value="imc">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-xl mx-auto"
            >
              <div className="bg-card rounded-3xl shadow-card p-8 border border-border">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-foreground">Calculadora de IMC</h2>
                  <p className="text-muted-foreground mt-2">
                    Acompanhe sua evolução corporal
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
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
                </div>

                <Button
                  onClick={calcularIMC}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 py-6 rounded-xl font-semibold mb-6"
                >
                  <Calculator size={18} className="mr-2" />
                  Calcular Agora
                </Button>

                {imcResultado && imcClassification && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-6 bg-secondary/50 rounded-2xl text-center"
                  >
                    <p className="text-sm text-muted-foreground mb-2">Seu IMC é</p>
                    <p className={`text-5xl font-bold ${imcClassification.color}`}>
                      {imcResultado.toFixed(1)}
                    </p>
                    <div className={`mt-4 inline-block px-4 py-2 rounded-full ${imcClassification.bg} text-white font-medium`}>
                      {imcClassification.label}
                    </div>
                  </motion.div>
                )}

                <div className="mt-8 border-t border-border pt-6">
                  <h4 className="text-sm font-semibold mb-4 text-center">Tabela de Referência</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="text-left text-muted-foreground">Abaixo do peso</div>
                    <div className="text-right text-foreground">&lt; 18.5</div>
                    <div className="bg-secondary/30 p-1 rounded col-span-2"></div>
                    <div className="text-left text-muted-foreground">Peso normal</div>
                    <div className="text-right text-foreground">18.5 - 24.9</div>
                    <div className="bg-secondary/30 p-1 rounded col-span-2"></div>
                    <div className="text-left text-muted-foreground">Sobrepeso</div>
                    <div className="text-right text-foreground">25 - 29.9</div>
                    <div className="bg-secondary/30 p-1 rounded col-span-2"></div>
                    <div className="text-left text-muted-foreground">Obesidade</div>
                    <div className="text-right text-foreground">&gt; 30</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </div >
  );
};

export default MinhaDieta;
