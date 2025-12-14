import { motion } from "framer-motion";
import { Search, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { recipes } from "@/data/recipes";
import { RecipeGrid } from "@/components/RecipeGrid";

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
                <RecipeGrid recipes={filteredRecipes} />
            </div>
        </div>
    );
};

export default Receitas;
