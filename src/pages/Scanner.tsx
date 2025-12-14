import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';
import { MealPhotoCapture } from '@/components/MealPhotoCapture';
import { MealPhotoCard } from '@/components/MealPhotoCard';
import { DailyNutritionSummaryComponent } from '@/components/DailyNutritionSummary';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus, Lock, Calendar } from 'lucide-react';
import { MealPhoto, MealAnalysis, DailyNutritionSummary } from '@/types/mealPhoto';
import { uploadMealPhoto } from '@/services/photoUploadService';
import { analyzeMealPhoto } from '@/services/mealAnalysisService';
import { collection, addDoc, query, where, getDocs, deleteDoc, doc, orderBy, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { format } from 'date-fns';

const Scanner = () => {
    const { user, userData, hasActiveSubscription } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [showCapture, setShowCapture] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [currentAnalysis, setCurrentAnalysis] = useState<MealAnalysis | null>(null);
    const [mealPhotos, setMealPhotos] = useState<MealPhoto[]>([]);
    const [dailySummary, setDailySummary] = useState<DailyNutritionSummary | null>(null);
    const [loading, setLoading] = useState(true);

    // Check if user has PRO subscription
    useEffect(() => {
        if (!hasActiveSubscription()) {
            // User doesn't have PRO - show message
            return;
        }
        loadTodaysMeals();
    }, [user]);

    const loadTodaysMeals = async () => {
        if (!user) return;

        try {
            const today = format(new Date(), 'yyyy-MM-dd');
            const mealsRef = collection(db, 'users', user.uid, 'mealPhotos');
            const q = query(
                mealsRef,
                where('date', '==', today),
                orderBy('capturedAt', 'desc')
            );

            const snapshot = await getDocs(q);
            const meals: MealPhoto[] = snapshot.docs.map((doc) => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    capturedAt: data.capturedAt?.toDate() || new Date(),
                } as MealPhoto;
            });

            setMealPhotos(meals);
            calculateDailySummary(meals, today);
        } catch (error) {
            console.error('Error loading meals:', error);
        } finally {
            setLoading(false);
        }
    };

    const calculateDailySummary = (meals: MealPhoto[], date: string) => {
        const completedMeals = meals.filter((m) => m.status === 'completed' && m.analysis);

        const totalCalories = completedMeals.reduce(
            (sum, m) => sum + (m.analysis?.calorias_totais_kcal || 0),
            0
        );

        const totalMacros = completedMeals.reduce(
            (acc, m) => ({
                protein: acc.protein + (m.analysis?.macro_nutrientes.proteinas_g || 0),
                carbs: acc.carbs + (m.analysis?.macro_nutrientes.carboidratos_g || 0),
                fats: acc.fats + (m.analysis?.macro_nutrientes.gorduras_totais_g || 0),
            }),
            { protein: 0, carbs: 0, fats: 0 }
        );

        setDailySummary({
            date,
            totalCalories,
            totalMacros,
            mealsCount: completedMeals.length,
            meals: completedMeals,
        });
    };

    const handlePhotoCapture = async (file: File) => {
        if (!user) return;

        setIsAnalyzing(true);
        setCurrentAnalysis(null);

        try {
            // Generate unique ID for this meal photo
            const mealPhotoId = `meal_${Date.now()}`;

            // Upload photo to Firebase Storage
            const { imageUrl, thumbnailUrl } = await uploadMealPhoto(file, user.uid, mealPhotoId);

            // Create meal photo document in Firestore
            const today = format(new Date(), 'yyyy-MM-dd');
            const mealPhotoData = {
                userId: user.uid,
                imageUrl,
                thumbnailUrl,
                capturedAt: new Date(),
                date: today,
                status: 'analyzing',
            };

            const mealsRef = collection(db, 'users', user.uid, 'mealPhotos');
            const docRef = await addDoc(mealsRef, mealPhotoData);

            // Send to webhook for analysis
            const analysis = await analyzeMealPhoto({
                imageUrl,
                userId: user.uid,
                mealPhotoId: docRef.id,
                timestamp: new Date().toISOString(),
            });

            if (analysis) {
                // Update document with analysis
                await updateDoc(doc(db, 'users', user.uid, 'mealPhotos', docRef.id), {
                    analysis,
                    status: 'completed',
                });

                setCurrentAnalysis(analysis);

                toast({
                    title: 'Refeição analisada!',
                    description: `${analysis.calorias_totais_kcal} calorias detectadas.`,
                });

                // Reload meals
                await loadTodaysMeals();

                // Reset capture interface for next photo
                setShowCapture(false);
                setCurrentAnalysis(null);
            }
        } catch (error) {
            console.error('Error processing meal photo:', error);
            toast({
                title: 'Erro ao processar foto',
                description: 'Tente novamente.',
                variant: 'destructive',
            });
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleDeleteMeal = async (mealId: string) => {
        if (!user) return;

        try {
            await deleteDoc(doc(db, 'users', user.uid, 'mealPhotos', mealId));
            toast({
                title: 'Refeição removida',
            });
            await loadTodaysMeals();
        } catch (error) {
            console.error('Error deleting meal:', error);
            toast({
                title: 'Erro ao remover',
                variant: 'destructive',
            });
        }
    };

    const handleNewMeal = () => {
        setShowCapture(true);
        setCurrentAnalysis(null);
    };

    // Get target values from user's diet if available
    const targetCalories = userData?.diet?.calories || 2000;
    const targetMacros = userData?.diet?.macros
        ? {
            protein: userData.diet.macros.protein.g,
            carbs: userData.diet.macros.carbs.g,
            fats: userData.diet.macros.fats.g,
        }
        : { protein: 150, carbs: 200, fats: 65 };

    // PRO subscription check
    if (!hasActiveSubscription()) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
                <Header />
                <main className="max-w-4xl mx-auto px-4 py-12">
                    <Card className="p-12 text-center">
                        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
                            <Lock className="w-10 h-10 text-primary" />
                        </div>
                        <h1 className="text-3xl font-bold mb-4">Recurso Exclusivo PRO</h1>
                        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                            O Scanner de Refeições está disponível apenas para assinantes do plano PRO.
                            Tire fotos das suas refeições e receba análise automática de calorias e nutrientes!
                        </p>
                        <Button size="lg" onClick={() => navigate('/assinatura')}>
                            Assinar Plano PRO
                        </Button>
                    </Card>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
            <Header />
            <main className="max-w-7xl mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary via-purple-600 to-pink-600 bg-clip-text text-transparent">
                        Scanner de Refeições
                    </h1>
                    <p className="text-muted-foreground flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {format(new Date(), "dd 'de' MMMM 'de' yyyy")}
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Capture & History */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Add New Meal Button */}
                        {!showCapture && (
                            <Button
                                onClick={handleNewMeal}
                                size="lg"
                                className="w-full h-16 text-lg shadow-lg bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-700"
                            >
                                <Plus className="w-6 h-6 mr-2" />
                                Adicionar Nova Refeição
                            </Button>
                        )}

                        {/* Capture Interface */}
                        {showCapture && (
                            <div>
                                <MealPhotoCapture
                                    onPhotoCapture={handlePhotoCapture}
                                    analysis={currentAnalysis}
                                    isLoading={isAnalyzing}
                                />
                                {!isAnalyzing && !currentAnalysis && (
                                    <Button
                                        variant="ghost"
                                        onClick={() => setShowCapture(false)}
                                        className="w-full mt-4"
                                    >
                                        Cancelar
                                    </Button>
                                )}
                            </div>
                        )}

                        {/* Meals History */}
                        <div className="space-y-4">
                            <h2 className="text-2xl font-bold">Refeições de Hoje</h2>
                            {loading ? (
                                <Card className="p-8 text-center text-muted-foreground">
                                    Carregando...
                                </Card>
                            ) : mealPhotos.length === 0 ? (
                                <Card className="p-8 text-center text-muted-foreground">
                                    Nenhuma refeição registrada hoje.
                                    <br />
                                    Adicione sua primeira refeição!
                                </Card>
                            ) : (
                                <div className="space-y-4">
                                    {mealPhotos.map((meal) => (
                                        <MealPhotoCard
                                            key={meal.id}
                                            mealPhoto={meal}
                                            onDelete={handleDeleteMeal}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column - Summary */}
                    <div className="lg:col-span-1">
                        {dailySummary && (
                            <div className="sticky top-24">
                                <DailyNutritionSummaryComponent
                                    summary={dailySummary}
                                    targetCalories={targetCalories}
                                    targetMacros={targetMacros}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Scanner;
