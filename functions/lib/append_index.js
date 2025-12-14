"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzeMeal = void 0;
// Função proxy para análise de refeição (resolve problema de CORS)
exports.analyzeMeal = functions.https.onCall(async (data, context) => {
    // Verificar autenticação
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'O usuário deve estar autenticado para analisar refeições.');
    }
    const { imageUrl, userId, mealPhotoId, timestamp } = data;
    const webhookUrl = 'https://webhook.nexaapp.online/webhook/fe75d6ee-4030-4147-a612-6b2c5f67cb2c';
    console.log(`[PROXY] Iniciando análise para usuário ${context.auth.uid}`);
    console.log(`[PROXY] Enviando para: ${webhookUrl}`);
    try {
        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                imageUrl,
                userId: userId || context.auth.uid,
                mealPhotoId,
                timestamp: timestamp || new Date().toISOString()
            }),
        });
        if (!response.ok) {
            const errorText = await response.text();
            console.error(`[PROXY] Erro do webhook: ${response.status} - ${errorText}`);
            throw new functions.https.HttpsError('internal', `Erro no serviço de análise: ${response.status}`);
        }
        const responseText = await response.text();
        console.log('[PROXY] Resposta bruta do webhook:', responseText);
        if (!responseText) {
            console.warn('[PROXY] Resposta vazia do webhook');
            // Retornar um objeto de erro controlado ou mock aqui se necessário, 
            // mas melhor deixar o frontend tratar ou lançar erro
            return {};
        }
        try {
            const responseData = JSON.parse(responseText);
            console.log('[PROXY] Resposta JSON parseada com sucesso');
            return responseData;
        }
        catch (e) {
            console.error('[PROXY] Erro ao parsear JSON:', e);
            throw new functions.https.HttpsError('internal', 'A resposta do serviço de análise não é um JSON válido.');
        }
    }
    catch (error) {
        console.error('[PROXY] Erro ao chamar webhook:', error);
        throw new functions.https.HttpsError('internal', 'Falha ao conectar com serviço de análise.');
    }
});
//# sourceMappingURL=append_index.js.map