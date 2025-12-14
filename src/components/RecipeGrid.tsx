import { motion } from "framer-motion";
import { Clock, Flame, ChefHat } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Recipe } from "@/data/recipes";

interface RecipeGridProps {
    recipes: Recipe[];
}

export const RecipeGrid = ({ recipes }: RecipeGridProps) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {recipes.map((recipe, index) => (
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
                            {recipe.tags.map((tag) => (
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

                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-primary hover:text-primary/80 hover:bg-primary/10"
                                    >
                                        Ver Receita
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col p-0 gap-0 rounded-2xl">
                                    <div className="relative h-48 sm:h-64">
                                        <img
                                            src={recipe.image}
                                            alt={recipe.title}
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                        <div className="absolute bottom-4 left-4 text-white">
                                            <h2 className="text-2xl font-bold">{recipe.title}</h2>
                                            <div className="flex gap-4 mt-1 text-sm font-medium">
                                                <span className="flex items-center gap-1"><Clock size={14} /> {recipe.time}</span>
                                                <span className="flex items-center gap-1"><Flame size={14} /> {recipe.calories} kcal</span>
                                            </div>
                                        </div>
                                    </div>

                                    <ScrollArea className="flex-1 p-6 min-h-0 w-full">
                                        <div className="space-y-6">
                                            <div>
                                                <p className="text-muted-foreground mb-4">{recipe.description}</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {recipe.tags.map(tag => (
                                                        <Badge key={tag} className="text-xs">{tag}</Badge>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="grid md:grid-cols-2 gap-8">
                                                <div>
                                                    <h3 className="flex items-center gap-2 font-bold text-lg mb-3 text-primary">
                                                        <ChefHat size={20} />
                                                        Ingredientes
                                                    </h3>
                                                    <ul className="space-y-2 text-sm text-foreground">
                                                        {recipe.ingredients.map((ing, i) => (
                                                            <li key={i} className="flex items-start gap-2">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                                                                {ing}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                                <div>
                                                    <h3 className="flex items-center gap-2 font-bold text-lg mb-3 text-primary">
                                                        <Clock size={20} />
                                                        Modo de Preparo
                                                    </h3>
                                                    <ol className="space-y-3 text-sm text-foreground">
                                                        {recipe.instructions.map((inst, i) => (
                                                            <li key={i} className="flex gap-3">
                                                                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-secondary text-primary text-xs font-bold shrink-0">
                                                                    {i + 1}
                                                                </span>
                                                                {inst}
                                                            </li>
                                                        ))}
                                                    </ol>
                                                </div>
                                            </div>
                                        </div>
                                    </ScrollArea>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>
                </motion.div>
            ))}

            {recipes.length === 0 && (
                <div className="col-span-full text-center py-20 text-muted-foreground">
                    <ChefHat size={48} className="mx-auto mb-4 opacity-20" />
                    <p className="text-lg">Nenhuma receita encontrada para sua busca.</p>
                </div>
            )}
        </div>
    );
};
