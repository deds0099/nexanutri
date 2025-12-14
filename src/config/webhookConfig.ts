// Webhook configuration for meal analysis

export const WEBHOOK_CONFIG = {
    // URL do webhook - NexaApp (atualizado)
    url: import.meta.env.VITE_MEAL_ANALYSIS_WEBHOOK_URL || 'https://webhook.nexaapp.online/webhook/fe75d6ee-4030-4147-a612-6b2c5f67cb2c',

    // Headers de autenticação
    headers: {
        'Content-Type': 'application/json',
        // Só adiciona Authorization se tiver API key
        ...(import.meta.env.VITE_WEBHOOK_API_KEY ? {
            'Authorization': `Bearer ${import.meta.env.VITE_WEBHOOK_API_KEY}`
        } : {})
    },

    // Timeout em milissegundos (30 segundos)
    timeout: 30000,

    // Número de tentativas em caso de falha
    maxRetries: 3,

    // Delay entre tentativas (em ms)
    retryDelay: 2000,
};

// Função para verificar se o webhook está configurado
export const isWebhookConfigured = (): boolean => {
    return Boolean(WEBHOOK_CONFIG.url);
};
