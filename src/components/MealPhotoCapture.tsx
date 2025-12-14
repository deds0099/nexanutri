import { useState, useRef } from 'react';
import { Camera, Upload, X, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { MealAnalysis } from '@/types/mealPhoto';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface MealPhotoCaptureProps {
    onPhotoCapture: (file: File) => Promise<void>;
    analysis?: MealAnalysis | null;
    isLoading?: boolean;
}

export const MealPhotoCapture = ({
    onPhotoCapture,
    analysis,
    isLoading = false,
}: MealPhotoCaptureProps) => {
    const [preview, setPreview] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const cameraInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            toast({
                title: 'Arquivo inválido',
                description: 'Por favor, selecione uma imagem.',
                variant: 'destructive',
            });
            return;
        }

        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            toast({
                title: 'Arquivo muito grande',
                description: 'O tamanho máximo é 10MB.',
                variant: 'destructive',
            });
            return;
        }

        setSelectedFile(file);

        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = async () => {
        if (!selectedFile) return;

        try {
            await onPhotoCapture(selectedFile);
        } catch (error) {
            console.error('Error submitting photo:', error);
            toast({
                title: 'Erro ao enviar foto',
                description: 'Tente novamente.',
                variant: 'destructive',
            });
        }
    };

    const handleClear = () => {
        setPreview(null);
        setSelectedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        if (cameraInputRef.current) cameraInputRef.current.value = '';
    };

    return (
        <div className="space-y-6">
            {!preview ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Camera Capture */}
                    <Card className="p-8 border-2 border-dashed hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer group">
                        <input
                            ref={cameraInputRef}
                            type="file"
                            accept="image/*"
                            capture="environment"
                            className="hidden"
                            onChange={handleFileSelect}
                        />
                        <div
                            className="flex flex-col items-center justify-center gap-4 text-center"
                            onClick={() => cameraInputRef.current?.click()}
                        >
                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Camera className="w-10 h-10 text-primary" />
                            </div>
                            <div>
                                <h3 className="font-bold text-xl mb-1">Tirar Foto</h3>
                                <p className="text-sm text-muted-foreground">
                                    Use a câmera do dispositivo
                                </p>
                            </div>
                        </div>
                    </Card>

                    {/* File Upload */}
                    <Card className="p-8 border-2 border-dashed hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer group">
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleFileSelect}
                        />
                        <div
                            className="flex flex-col items-center justify-center gap-4 text-center"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Upload className="w-10 h-10 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <h3 className="font-bold text-xl mb-1">Upload de Foto</h3>
                                <p className="text-sm text-muted-foreground">
                                    Selecione da galeria
                                </p>
                            </div>
                        </div>
                    </Card>
                </div>
            ) : (
                <Card className="p-6 border-2">
                    <div className="relative">
                        <img
                            src={preview}
                            alt="Preview"
                            className="w-full h-auto rounded-lg max-h-96 object-cover shadow-lg"
                        />
                        {!isLoading && !analysis && (
                            <Button
                                variant="destructive"
                                size="icon"
                                className="absolute top-3 right-3 shadow-lg"
                                onClick={handleClear}
                            >
                                <X className="w-5 h-5" />
                            </Button>
                        )}
                    </div>

                    {isLoading && (
                        <div className="mt-6 flex flex-col items-center justify-center gap-3">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                            <div className="text-center">
                                <p className="font-semibold">Analisando sua refeição...</p>
                                <p className="text-sm text-muted-foreground">Isto pode levar alguns segundos</p>
                            </div>
                        </div>
                    )}

                    {analysis && (
                        <div className="mt-6 space-y-6">
                            {/* Header com descrição */}
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center flex-shrink-0">
                                    <Sparkles className="w-5 h-5 text-white" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-xl text-green-600 dark:text-green-400 mb-1">
                                        Análise Concluída!
                                    </h3>
                                    <p className="text-muted-foreground">{analysis.descricao}</p>
                                </div>
                            </div>

                            {/* Calorias principais em destaque */}
                            <Card className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/30 dark:to-red-950/30 border-orange-200 dark:border-orange-800 p-6">
                                <div className="text-center">
                                    <p className="text-sm font-medium text-orange-900 dark:text-orange-200 mb-2">
                                        Calorias Totais
                                    </p>
                                    <p className="text-5xl font-bold text-orange-600 dark:text-orange-400">
                                        {analysis.calorias_totais_kcal}
                                    </p>
                                    <p className="text-xs text-orange-800 dark:text-orange-300 mt-1">kcal</p>
                                </div>
                            </Card>

                            {/* Macronutrientes */}
                            <div>
                                <h4 className="font-semibold mb-3 text-sm uppercase text-muted-foreground tracking-wide">
                                    Macronutrientes
                                </h4>
                                <div className="grid grid-cols-3 gap-3">
                                    <Card className="p-4 bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-950/20 dark:to-rose-950/20 border-red-200 dark:border-red-900">
                                        <p className="text-xs font-medium text-red-700 dark:text-red-300 mb-1">
                                            Proteínas
                                        </p>
                                        <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                                            {analysis.macro_nutrientes.proteinas_g}g
                                        </p>
                                    </Card>
                                    <Card className="p-4 bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20 border-amber-200 dark:border-amber-900">
                                        <p className="text-xs font-medium text-amber-700 dark:text-amber-300 mb-1">
                                            Carboidratos
                                        </p>
                                        <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                                            {analysis.macro_nutrientes.carboidratos_g}g
                                        </p>
                                    </Card>
                                    <Card className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 border-blue-200 dark:border-blue-900">
                                        <p className="text-xs font-medium text-blue-700 dark:text-blue-300 mb-1">
                                            Gorduras
                                        </p>
                                        <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                            {analysis.macro_nutrientes.gorduras_totais_g}g
                                        </p>
                                    </Card>
                                </div>
                            </div>

                            {/* Detalhes Nutricionais */}
                            <div>
                                <h4 className="font-semibold mb-3 text-sm uppercase text-muted-foreground tracking-wide">
                                    Detalhes Nutricionais
                                </h4>
                                <Card className="p-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-muted-foreground">Fibras</span>
                                            <Badge variant="secondary">{analysis.detalhes.fibras_g}g</Badge>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-muted-foreground">Açúcares</span>
                                            <Badge variant="secondary">{analysis.detalhes.acucares_g}g</Badge>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-muted-foreground">Sódio</span>
                                            <Badge variant="secondary">{analysis.detalhes.sodio_mg}mg</Badge>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-muted-foreground">Gord. Saturadas</span>
                                            <Badge variant="secondary">{analysis.detalhes.gorduras_saturadas_g}g</Badge>
                                        </div>
                                    </div>
                                </Card>
                            </div>

                            {/* Ingredientes */}
                            {analysis.ingredientes && analysis.ingredientes.length > 0 && (
                                <div>
                                    <h4 className="font-semibold mb-3 text-sm uppercase text-muted-foreground tracking-wide">
                                        Ingredientes Identificados
                                    </h4>
                                    <div className="space-y-2">
                                        {analysis.ingredientes.map((ingrediente, index) => (
                                            <Card key={index} className="p-3 hover:bg-muted/50 transition-colors">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex-1">
                                                        <p className="font-medium">{ingrediente.name}</p>
                                                        <p className="text-xs text-muted-foreground">{ingrediente.quantity}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-semibold text-sm">{ingrediente.calories} kcal</p>
                                                        <p className="text-xs text-muted-foreground">
                                                            P: {ingrediente.protein}g | C: {ingrediente.carbs}g | G: {ingrediente.fat}g
                                                        </p>
                                                    </div>
                                                </div>
                                            </Card>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Aviso de Precisão */}
                            {analysis.aviso_precisao && (
                                <Card className="p-4 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
                                    <div className="flex gap-3">
                                        <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="font-medium text-sm text-blue-900 dark:text-blue-100 mb-1">
                                                Aviso de Precisão
                                            </p>
                                            <p className="text-xs text-blue-700 dark:text-blue-300">
                                                {analysis.aviso_precisao}
                                            </p>
                                        </div>
                                    </div>
                                </Card>
                            )}

                            <Separator />

                            <Button onClick={handleClear} variant="outline" className="w-full" size="lg">
                                Analisar Outra Refeição
                            </Button>
                        </div>
                    )}

                    {!isLoading && !analysis && (
                        <div className="mt-6 flex gap-3">
                            <Button onClick={handleSubmit} className="flex-1" size="lg">
                                <Sparkles className="w-4 h-4 mr-2" />
                                Analisar Refeição
                            </Button>
                            <Button onClick={handleClear} variant="outline" size="lg">
                                Cancelar
                            </Button>
                        </div>
                    )}
                </Card>
            )}
        </div>
    );
};
