import { WebhookPayload, WebhookResponse, MealAnalysis } from '@/types/mealPhoto';
import { WEBHOOK_CONFIG } from '@/config/webhookConfig';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Send photo to webhook for analysis
export const analyzeMealPhoto = async (
    payload: WebhookPayload
): Promise<MealAnalysis | null> => {
    // Se o webhook não estiver configurado, retorna análise mock para desenvolvimento
    if (!WEBHOOK_CONFIG.url) {
        console.warn('Webhook URL not configured. Using mock analysis.');
        return getMockAnalysis();
    }

    let lastError: Error | null = null;

    // Retry logic
    for (let attempt = 1; attempt <= WEBHOOK_CONFIG.maxRetries; attempt++) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), WEBHOOK_CONFIG.timeout);

            const response = await fetch(WEBHOOK_CONFIG.url, {
                method: 'POST',
                headers: WEBHOOK_CONFIG.headers,
                body: JSON.stringify(payload),
                signal: controller.signal,
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`Webhook returned status ${response.status}`);
            }

            const data: WebhookResponse = await response.json();

            // O webhook retorna diretamente a estrutura de análise
            if (data && data.calorias_totais_kcal !== undefined) {
                return data as MealAnalysis;
            } else {
                throw new Error('Invalid webhook response format');
            }
        } catch (error) {
            lastError = error as Error;
            console.error(`Attempt ${attempt} failed:`, error);

            // Wait before retry (except on last attempt)
            if (attempt < WEBHOOK_CONFIG.maxRetries) {
                await new Promise((resolve) => setTimeout(resolve, WEBHOOK_CONFIG.retryDelay));
            }
        }
    }

    throw lastError || new Error('Failed to analyze meal photo');
};

// Mock analysis for development/testing
const getMockAnalysis = (): MealAnalysis => {
    return {
        descricao: "Prato com frango grelhado, arroz integral e brócolis no vapor",
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
            { name: "Arroz Integral", quantity: "100g", calories: 123, protein: 2.6, carbs: 25.6, fat: 1 },
            { name: "Brócolis no Vapor", quantity: "100g", calories: 34, protein: 2.8, carbs: 7, fat: 0.4 },
            { name: "Azeite de Oliva", quantity: "1 colher (10ml)", calories: 90, protein: 0, carbs: 0, fat: 10 }
        ],
        aviso_precisao: "Análise feita com base em estimativa visual. Valores podem variar ±15%."
    };
};

// Update meal photo status in Firestore
export const updateMealPhotoStatus = async (
    userId: string,
    mealPhotoId: string,
    updates: {
        status?: 'uploading' | 'analyzing' | 'completed' | 'error';
        analysis?: MealAnalysis;
        errorMessage?: string;
    }
): Promise<void> => {
    const userRef = doc(db, 'users', userId);

    try {
        // This will be updated when we add mealPhotos to the user document
        // For now, we'll use a subcollection
        const mealPhotoRef = doc(db, 'users', userId, 'mealPhotos', mealPhotoId);
        await updateDoc(mealPhotoRef, updates);
    } catch (error) {
        console.error('Error updating meal photo status:', error);
        throw error;
    }
};
