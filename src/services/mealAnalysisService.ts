import { WebhookPayload, WebhookResponse, MealAnalysis } from '@/types/mealPhoto';
import { doc, updateDoc } from 'firebase/firestore';
import { db, functions } from '@/lib/firebase'; // Import functions
import { httpsCallable } from 'firebase/functions';

// Send photo to webhook for analysis (via Cloud Function Proxy)
export const analyzeMealPhoto = async (
    payload: WebhookPayload
): Promise<MealAnalysis | null> => {
    console.log('🔍 [PROXY] Iniciando análise via Cloud Function...');

    try {
        const analyzeMeal = httpsCallable(functions, 'analyzeMeal');

        // Call Cloud Function
        const result = await analyzeMeal(payload);

        const data = result.data as any; // Cast 'unknown' to 'any' or specific type
        console.log('✅ [PROXY] Resposta da Cloud Function:', data);

        if (data && data.calorias_totais_kcal !== undefined) {
            return data as MealAnalysis;
        } else {
            // Fallback para mock se a resposta vier vazia do n8n (ainda debugging)
            if (!data || Object.keys(data).length === 0) {
                console.warn('⚠️ [PROXY] Resposta vazia. Endpoint pode não ter retornado JSON.');
                throw new Error("Empty response from analysis service");
            }
            throw new Error('Invalid analysis response format');
        }

    } catch (error) {
        console.error('❌ [PROXY] Erro na análise:', error);

        // Fallback Mock em caso de erro (para não travar o usuário durante testes)
        console.log('🎭 [PROXY] Usando análise MOCK (Fallback)');
        return getMockAnalysis();
    }
};

// Mock analysis for development/testing
const getMockAnalysis = (): MealAnalysis => {
    return {
        descricao: "Prato com frango grelhado (MOCK)",
        calorias_totais_kcal: 450,
        macro_nutrientes: {
            proteinas_g: 35,
            carboidratos_g: 45,
            gorduras_totais_g: 12
        },
        detalhes: {
            fibras_g: 6,
            acucares_g: 2,
            sodio_mg: 380,
            gorduras_saturadas_g: 3
        },
        ingredientes: [
            { name: "Peito de Frango Grelhado", quantity: "150g", calories: 165, protein: 31, carbs: 0, fat: 3.6 },
            { name: "Arroz Integral", quantity: "100g", calories: 123, protein: 2.6, carbs: 25.6, fat: 1 }
        ],
        aviso_precisao: "Atenção: Erro na conexão com o servidor de análise. Dados simulados."
    };
};

export const updateMealPhotoStatus = async (
    userId: string,
    mealPhotoId: string,
    updates: {
        status?: 'uploading' | 'analyzing' | 'completed' | 'error';
        analysis?: MealAnalysis;
        errorMessage?: string;
    }
): Promise<void> => {
    try {
        const mealPhotoRef = doc(db, 'users', userId, 'mealPhotos', mealPhotoId);
        await updateDoc(mealPhotoRef, updates);
    } catch (error) {
        console.error('Error updating meal photo status:', error);
        throw error;
    }
};
