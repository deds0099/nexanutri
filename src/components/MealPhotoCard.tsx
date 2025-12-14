import { MealPhoto } from '@/types/mealPhoto';
import { Card } from '@/components/ui/card';
import { Trash2, Clock, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface MealPhotoCardProps {
    mealPhoto: MealPhoto;
    onDelete?: (id: string) => void;
}

export const MealPhotoCard = ({ mealPhoto, onDelete }: MealPhotoCardProps) => {
    const { thumbnailUrl, imageUrl, capturedAt, analysis, status } = mealPhoto;

    const getMealTypeLabel = (type?: string) => {
        const labels: Record<string, string> = {
            breakfast: 'Café da Manhã',
            lunch: 'Almoço',
            dinner: 'Jantar',
            snack: 'Lanche',
        };
        return type ? labels[type] || 'Refeição' : 'Refeição';
    };

    return (
        <Card className="overflow-hidden hover:shadow-lg transition-all border-2">
            <div className="flex gap-4 p-4">
                {/* Thumbnail */}
                <div className="flex-shrink-0">
                    <div className="relative">
                        <img
                            src={thumbnailUrl || imageUrl}
                            alt="Refeição"
                            className="w-28 h-28 object-cover rounded-lg shadow-md"
                        />
                        {status === 'completed' && (
                            <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                                <Sparkles className="w-3 h-3 text-white" />
                            </div>
                        )}
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-3">
                        <div>
                            <h3 className="font-bold text-lg">
                                {getMealTypeLabel(mealPhoto.mealType)}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                                <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">
                                    {format(capturedAt, "HH:mm", { locale: ptBR })}
                                </span>
                            </div>
                        </div>

                        {onDelete && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                onClick={() => onDelete(mealPhoto.id)}
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        )}
                    </div>

                    {status === 'analyzing' && (
                        <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
                            <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
                            <span>Analisando...</span>
                        </div>
                    )}

                    {status === 'error' && (
                        <div className="text-sm text-destructive font-medium">
                            {mealPhoto.errorMessage || 'Erro na análise'}
                        </div>
                    )}

                    {status === 'completed' && analysis && (
                        <div className="space-y-3">
                            {/* Descrição */}
                            <p className="text-sm text-muted-foreground line-clamp-2">
                                {analysis.descricao}
                            </p>

                            {/* Calorias em destaque */}
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-orange-100 to-red-100 dark:from-orange-950/30 dark:to-red-950/30 rounded-full border border-orange-200 dark:border-orange-800">
                                <span className="text-xs font-medium text-orange-900 dark:text-orange-200">
                                    🔥 Calorias:
                                </span>
                                <span className="text-lg font-bold text-orange-600 dark:text-orange-400">
                                    {analysis.calorias_totais_kcal}
                                </span>
                                <span className="text-xs text-orange-800 dark:text-orange-300">kcal</span>
                            </div>

                            {/* Macros */}
                            <div className="flex flex-wrap gap-2">
                                <Badge variant="secondary" className="bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-300">
                                    P: {analysis.macro_nutrientes.proteinas_g}g
                                </Badge>
                                <Badge variant="secondary" className="bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300">
                                    C: {analysis.macro_nutrientes.carboidratos_g}g
                                </Badge>
                                <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-300">
                                    G: {analysis.macro_nutrientes.gorduras_totais_g}g
                                </Badge>
                            </div>

                            {/* Ingredientes resumidos */}
                            {analysis.ingredientes && analysis.ingredientes.length > 0 && (
                                <div className="text-xs text-muted-foreground">
                                    <span className="font-medium">Ingredientes: </span>
                                    {analysis.ingredientes.slice(0, 3).map(ing => ing.name).join(', ')}
                                    {analysis.ingredientes.length > 3 && ` +${analysis.ingredientes.length - 3}`}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </Card>
    );
};
