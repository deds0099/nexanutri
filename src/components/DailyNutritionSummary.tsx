import { DailyNutritionSummary } from '@/types/mealPhoto';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Flame, Drumstick, Wheat, Droplet } from 'lucide-react';

interface DailyNutritionSummaryProps {
    summary: DailyNutritionSummary;
    targetCalories?: number;
    targetMacros?: {
        protein: number;
        carbs: number;
        fats: number;
    };
}

export const DailyNutritionSummaryComponent = ({
    summary,
    targetCalories = 2000,
    targetMacros = { protein: 150, carbs: 200, fats: 65 },
}: DailyNutritionSummaryProps) => {
    const caloriesProgress = (summary.totalCalories / targetCalories) * 100;
    const proteinProgress = (summary.totalMacros.protein / targetMacros.protein) * 100;
    const carbsProgress = (summary.totalMacros.carbs / targetMacros.carbs) * 100;
    const fatsProgress = (summary.totalMacros.fats / targetMacros.fats) * 100;

    return (
        <Card className="p-6">
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h2 className="text-2xl font-bold mb-1">Resumo Nutricional</h2>
                    <p className="text-sm text-muted-foreground">
                        {summary.mealsCount} {summary.mealsCount === 1 ? 'refeição' : 'refeições'} registradas hoje
                    </p>
                </div>

                {/* Calorias */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Flame className="w-5 h-5 text-orange-500" />
                            <span className="font-semibold">Calorias</span>
                        </div>
                        <div className="text-right">
                            <span className="text-2xl font-bold text-primary">
                                {summary.totalCalories}
                            </span>
                            <span className="text-muted-foreground"> / {targetCalories}</span>
                        </div>
                    </div>
                    <Progress value={Math.min(caloriesProgress, 100)} className="h-2" />
                    <p className="text-xs text-muted-foreground text-right">
                        {(targetCalories - summary.totalCalories).toFixed(0)} kcal restantes
                    </p>
                </div>

                {/* Macronutrientes */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Proteína */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Drumstick className="w-4 h-4 text-red-500" />
                            <span className="text-sm font-medium">Proteína</span>
                        </div>
                        <div className="text-lg font-bold">
                            {summary.totalMacros.protein}g
                            <span className="text-xs text-muted-foreground font-normal">
                                {' '}/ {targetMacros.protein}g
                            </span>
                        </div>
                        <Progress value={Math.min(proteinProgress, 100)} className="h-1.5" />
                    </div>

                    {/* Carboidratos */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Wheat className="w-4 h-4 text-yellow-500" />
                            <span className="text-sm font-medium">Carboidratos</span>
                        </div>
                        <div className="text-lg font-bold">
                            {summary.totalMacros.carbs}g
                            <span className="text-xs text-muted-foreground font-normal">
                                {' '}/ {targetMacros.carbs}g
                            </span>
                        </div>
                        <Progress value={Math.min(carbsProgress, 100)} className="h-1.5" />
                    </div>

                    {/* Gorduras */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Droplet className="w-4 h-4 text-blue-500" />
                            <span className="text-sm font-medium">Gorduras</span>
                        </div>
                        <div className="text-lg font-bold">
                            {summary.totalMacros.fats}g
                            <span className="text-xs text-muted-foreground font-normal">
                                {' '}/ {targetMacros.fats}g
                            </span>
                        </div>
                        <Progress value={Math.min(fatsProgress, 100)} className="h-1.5" />
                    </div>
                </div>

                {/* Status Message */}
                {caloriesProgress >= 100 && (
                    <div className="p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
                        <p className="text-sm text-green-900 dark:text-green-100 font-medium">
                            ✓ Meta de calorias atingida!
                        </p>
                    </div>
                )}

                {caloriesProgress < 100 && caloriesProgress >= 80 && (
                    <div className="p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
                        <p className="text-sm text-blue-900 dark:text-blue-100 font-medium">
                            Quase lá! Faltam {(targetCalories - summary.totalCalories).toFixed(0)} calorias.
                        </p>
                    </div>
                )}
            </div>
        </Card>
    );
};
