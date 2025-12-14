import { WebhookPayload, WebhookResponse, MealAnalysis } from '@/types/mealPhoto';
import { WEBHOOK_CONFIG } from '@/config/webhookConfig';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Send photo to webhook for analysis
export const analyzeMealPhoto = async (
    payload: WebhookPayload
): Promise<MealAnalysis | null> => {
    // Log para debug
    console.log('🔍 [WEBHOOK] Iniciando análise de refeição...');
    console.log('🔍 [WEBHOOK] URL configurada:', WEBHOOK_CONFIG.url);
    console.log('🔍 [WEBHOOK] Payload:', JSON.stringify(payload, null, 2));

    // Se o webhook não estiver configurado, retorna análise mock para desenvolvimento
    if (!WEBHOOK_CONFIG.url) {
        console.warn('⚠️ [WEBHOOK] URL not configured. Using mock analysis.');
        return getMockAnalysis();
    }

    let lastError: Error | null = null;

    // Retry logic
    for (let attempt = 1; attempt <= WEBHOOK_CONFIG.maxRetries; attempt++) {
        try {
            console.log(`🚀 [WEBHOOK] Tentativa ${attempt}/${WEBHOOK_CONFIG.maxRetries}...`);

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), WEBHOOK_CONFIG.timeout);

            console.log('📤 [WEBHOOK] Enviando requisição para:', WEBHOOK_CONFIG.url);
            console.log('📤 [WEBHOOK] Headers:', JSON.stringify(WEBHOOK_CONFIG.headers, null, 2));

            const response = await fetch(WEBHOOK_CONFIG.url, {
                method: 'POST',
                headers: WEBHOOK_CONFIG.headers,
                body: JSON.stringify(payload),
                signal: controller.signal,
            });

            clearTimeout(timeoutId);

            console.log('📥 [WEBHOOK] Resposta recebida. Status:', response.status);
            console.log('📥 [WEBHOOK] Headers da resposta:', JSON.stringify(Object.fromEntries(response.headers.entries()), null, 2));

            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ [WEBHOOK] Erro na resposta:', errorText);
                throw new Error(`Webhook returned status ${response.status}: ${errorText}`);
            }

            const responseText = await response.text();
            console.log('📄 [WEBHOOK] Corpo da resposta:', responseText);

            let data: WebhookResponse;
            try {
                data = JSON.parse(responseText);
                console.log('✅ [WEBHOOK] JSON parseado com sucesso:', JSON.stringify(data, null, 2));
            } catch (parseError) {
                console.error('❌ [WEBHOOK] Erro ao parsear JSON:', parseError);
                throw new Error(`Failed to parse webhook response: ${responseText}`);
            }

            // O webhook retorna diretamente a estrutura de análise
            if (data && data.calorias_totais_kcal !== undefined) {
                console.log('✅ [WEBHOOK] Análise recebida com sucesso!');
                return data as MealAnalysis;
            } else {
                console.error('❌ [WEBHOOK] Formato de resposta inválido. Esperava "calorias_totais_kcal"');
                throw new Error('Invalid webhook response format');
            }
        } catch (error) {
            lastError = error as Error;
            console.error(`❌ [WEBHOOK] Tentativa ${attempt} falhou:`, error);

            // Wait before retry (except on last attempt)
            if (attempt < WEBHOOK_CONFIG.maxRetries) {
                console.log(`⏳ [WEBHOOK] Aguardando ${WEBHOOK_CONFIG.retryDelay}ms antes da próxima tentativa...`);
                await new Promise((resolve) => setTimeout(resolve, WEBHOOK_CONFIG.retryDelay));
            }
        }
    }

    console.error('❌ [WEBHOOK] Todas as tentativas falharam. Usando análise mock.');
    console.error('❌ [WEBHOOK] Último erro:', lastError);

    // Em vez de lançar erro, retorna mock para não quebrar a experiência do usuário
    return getMockAnalysis();
};

// Mock analysis for development/testing
const getMockAnalysis = (): MealAnalysis => {
    console.log('🎭 [WEBHOOK] Usando análise MOCK');
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
        aviso_precisao: "⚠️ ATENÇÃO: Esta é uma análise MOCK (de teste). O webhook real não respondeu corretamente."
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
