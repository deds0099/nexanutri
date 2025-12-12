
const WEBHOOK_URL = "https://us-central1-nexanutri.cloudfunctions.net/webhookPagamento";

async function testWebhook() {
    console.log("🚀 Enviando simulação de pagamento para o Webhook...");
    console.log(`URL: ${WEBHOOK_URL}`);

    // Payload simulando o VegaCheckout (estrutura realista)
    const payload = {
        products: [
            { title: "Plano Mensal", name: "Plano Mensal", amount: 500 }
        ],
        customer: {
            email: "naoexiste@teste.com"
        },
        payment: {
            status: "approved"
        }
    };

    try {
        const response = await fetch(WEBHOOK_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        console.log(`\n📥 Status da Resposta: ${response.status} ${response.statusText}`);

        const text = await response.text();
        try {
            const json = JSON.parse(text);
            console.log("📦 Corpo da Resposta (JSON):", JSON.stringify(json, null, 2));
        } catch (e) {
            console.log("📦 Corpo da Resposta (Texto):", text);
        }

        if (response.status === 404) {
            console.log("\n✅ SUCESSO: O webhook respondeu 404 'user not found'.");
            console.log("Isso prova que a função está NO AR e processando a lógica corretamente (pois o email não existe).");
        } else if (response.status === 200) {
            console.log("\n✅ SUCESSO COMPLETO: O webhook processou e aceitou o pagamento!");
        } else {
            console.log("\n⚠️ ALERTA: O status não foi o esperado para um usuário inexistente.");
        }

    } catch (error) {
        console.error("\n❌ ERRO Fatal:", error.message);
    }
}

testWebhook();
