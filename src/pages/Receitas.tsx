import { motion } from "framer-motion";
import { Clock, Flame, ChefHat, Search, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface Recipe {
    id: number;
    title: string;
    image: string;
    time: string;
    calories: number;
    tags: string[];
    description: string;
}

const recipes: Recipe[] = [
    {
        id: 1,
        title: "Omelete de Claras com Espinafre",
        image: "https://images.unsplash.com/photo-1510693206972-df098062cb71?w=800&auto=format&fit=crop&q=60",
        time: "15 min",
        calories: 220,
        tags: ["High Protein", "Low Carb", "Café da Manhã"],
        description: "Uma opção leve e proteica para começar o dia com energia."
    },
    {
        id: 2,
        title: "Salada de Frango Grelhado",
        image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=60",
        time: "20 min",
        calories: 350,
        tags: ["Almoço", "Low Fat", "Sem Glúten"],
        description: "Mix de folhas verdes com peito de frango grelhado e molho cítrico."
    },
    {
        id: 3,
        title: "Smoothie de Frutas Vermelhas",
        image: "https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?w=800&auto=format&fit=crop&q=60",
        time: "5 min",
        calories: 180,
        tags: ["Lanche", "Vegano", "Detox"],
        description: "Refrescante e rico em antioxidantes, perfeito para o pré-treino."
    },
    {
        id: 4,
        title: "Salmão Assado com Aspargos",
        image: "https://images.unsplash.com/photo-1467003909585-2f8a7270028d?w=800&auto=format&fit=crop&q=60",
        time: "30 min",
        calories: 450,
        tags: ["Jantar", "Omega 3", "Keto"],
        description: "Filé de salmão fresco assado com ervas finas e aspargos crocantes."
    },
    {
        id: 5,
        title: "Panqueca de Banana Funcional",
        image: "https://images.unsplash.com/photo-1506084868230-bb9d95c24759?w=800&auto=format&fit=crop&q=60",
        time: "15 min",
        calories: 280,
        tags: ["Café da Manhã", "Sem Açúcar", "Fibras"],
        description: "Massa fofinha feita com banana, aveia e canela."
    },
    {
        id: 6,
        title: "Wrap de Atum com Abacate",
        image: "https://images.unsplash.com/photo-1520072959219-c595dc870360?w=800&auto=format&fit=crop&q=60",
        time: "10 min",
        calories: 320,
        tags: ["Lanche", "Rápido", "Integral"],
        description: "Sanduíche natural no pão folha integral com pasta de atum."
    }
];

const Receitas = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState("");

    const filteredRecipes = recipes.filter(recipe =>
        recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        recipe.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="min-h-screen bg-background pb-20 md:pb-8">
            <div className="bg-primary/5 py-12 px-4 shadow-inner">
                <div className="container mx-auto max-w-6xl">
                    <Button
                        variant="ghost"
                        onClick={() => navigate("/")}
                        className="mb-6 hover:bg-transparent hover:text-primary pl-0"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Voltar
                    </Button>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center max-w-2xl mx-auto"
                    >
                        <h1 className="text-4xl font-bold text-foreground mb-4 font-heading">
                            Receitas Fit & Saudáveis
                        </h1>
                        <p className="text-muted-foreground text-lg mb-8">
                            Explore nossa coleção exclusiva de receitas deliciosas e nutritivas, pensadas para o seu objetivo.
                        </p>

                        <div className="relative max-w-md mx-auto">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-5 w-5" />
                            <Input
                                placeholder="Buscar receitas (ex: frango, low carb)..."
                                className="pl-10 h-12 rounded-full border-primary/20 focus:border-primary bg-background shadow-sm"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </motion.div>
                </div>
            </div>

            <div className="container mx-auto max-w-6xl px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredRecipes.map((recipe, index) => (
                        <motion.div
                            key={recipe.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.1 }}
                            className="group bg-card rounded-2xl overflow-hidden border border-border/50 shadow-sm hover:shadow-glow hover:border-primary/30 transition-all duration-300"
                        >
                            <div className="relative h-48 overflow-hidden">
                                <img
                                    src={recipe.image}
                                    alt={recipe.title}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                                <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                                    <Clock size={12} />
                                    {recipe.time}
                                </div>
                            </div>

                            <div className="p-6">
                                <div className="flex flex-wrap gap-2 mb-3">
                                    {recipe.tags.map(tag => (
                                        <Badge key={tag} variant="secondary" className="text-xs font-normal">
                                            {tag}
                                        </Badge>
                                    ))}
                                </div>

                                <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                                    {recipe.title}
                                </h3>

                                <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                                    {recipe.description}
                                </p>

                                <div className="flex items-center justify-between pt-4 border-t border-border/50">
                                    <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
                                        <Flame size={16} className="text-orange-500" />
                                        <span>{recipe.calories} kcal</span>
                                    </div>
                                    <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80 hover:bg-primary/10">
                                        Ver Receita
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {filteredRecipes.length === 0 && (
                    <div className="text-center py-20 text-muted-foreground">
                        <ChefHat size={48} className="mx-auto mb-4 opacity-20" />
                        <p className="text-lg">Nenhuma receita encontrada para sua busca.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Receitas;
