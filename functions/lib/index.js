"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzeMeal = exports.webhookPagamento = void 0;
const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();
const db = admin.firestore();
// Duração dos planos em meses
const PLAN_DURATION = {
    mensal: 1,
    semestral: 6,
    anual: 12,
};
exports.webhookPagamento = functions.https.onRequest(async (req, res) => {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z;
    // Permitir apenas POST
    if (req.method !== "POST") {
        res.status(405).send("Method Not Allowed");
        return;
    }
    try {
        const payload = req.body;
        console.log("Webhook recebido:", JSON.stringify(payload, null, 2));
        // Tentar extrair informações do pagamento
        const paymentStatus = ((_a = payload.data) === null || _a === void 0 ? void 0 : _a.status) || ((_b = payload.payment) === null || _b === void 0 ? void 0 : _b.status) || payload.status;
        // Email lookup strategies
        const userEmail = ((_d = (_c = payload.data) === null || _c === void 0 ? void 0 : _c.metadata) === null || _d === void 0 ? void 0 : _d.user_email) ||
            ((_f = (_e = payload.data) === null || _e === void 0 ? void 0 : _e.payer) === null || _f === void 0 ? void 0 : _f.email) ||
            ((_g = payload.customer) === null || _g === void 0 ? void 0 : _g.email) ||
            payload.email || // Some gateways send at root
            payload.payer_email;
        // ID lookup strategies
        const userId = ((_j = (_h = payload.data) === null || _h === void 0 ? void 0 : _h.metadata) === null || _j === void 0 ? void 0 : _j.user_id) ||
            ((_k = payload.custom_fields) === null || _k === void 0 ? void 0 : _k.user_id);
        // Plan lookup strategies
        const productName = ((_l = payload.product) === null || _l === void 0 ? void 0 : _l.name) ||
            ((_o = (_m = payload.products) === null || _m === void 0 ? void 0 : _m[0]) === null || _o === void 0 ? void 0 : _o.title) ||
            ((_q = (_p = payload.products) === null || _p === void 0 ? void 0 : _p[0]) === null || _q === void 0 ? void 0 : _q.name) ||
            ((_s = (_r = payload.plans) === null || _r === void 0 ? void 0 : _r[0]) === null || _s === void 0 ? void 0 : _s.title) ||
            ((_w = (_v = (_u = (_t = payload.data) === null || _t === void 0 ? void 0 : _t.additional_info) === null || _u === void 0 ? void 0 : _u.items) === null || _v === void 0 ? void 0 : _v[0]) === null || _w === void 0 ? void 0 : _w.title) ||
            "";
        const plan = ((_y = (_x = payload.data) === null || _x === void 0 ? void 0 : _x.metadata) === null || _y === void 0 ? void 0 : _y.plan) ||
            ((_z = payload.custom_fields) === null || _z === void 0 ? void 0 : _z.plan) ||
            extractPlanFromProduct(productName);
        console.log(`Dados extraídos: Email=${userEmail}, ID=${userId}, Plano=${plan}, Status=${paymentStatus}`);
        // Verificar se o pagamento foi aprovado
        // VegaCheckout muitas vezes manda "paid" ou "approved"
        const validStatuses = ["approved", "completed", "paid", "succeeded"];
        if (!validStatuses.includes((paymentStatus || "").toLowerCase())) {
            console.log(`Status de pagamento não aprovado: ${paymentStatus}`);
            res.status(200).send({ received: true, action: "ignored", reason: `payment status is ${paymentStatus}` });
            return;
        }
        // Precisamos do email ou userId para identificar o usuário
        if (!userEmail && !userId) {
            console.error("Dados do usuário não encontrados no webhook");
            res.status(400).send({ error: "user data not found" });
            return;
        }
        // Buscar usuário pelo email ou ID
        let userDocRef = null;
        if (userId) {
            userDocRef = db.collection("users").doc(userId);
        }
        else if (userEmail) {
            const userQuery = await db.collection("users").where("email", "==", userEmail).limit(1).get();
            if (!userQuery.empty) {
                userDocRef = userQuery.docs[0].ref;
            }
        }
        if (!userDocRef) {
            console.error(`Usuário não encontrado: ${userEmail || userId}`);
            res.status(404).send({ error: "user not found" });
            return;
        }
        // Calcular data de expiração
        const now = new Date();
        const durationMonths = PLAN_DURATION[plan] || 1;
        const endDate = new Date(now);
        endDate.setMonth(endDate.getMonth() + durationMonths);
        // Atualizar assinatura do usuário
        await userDocRef.update({
            subscription: {
                plan: plan,
                status: "active",
                startDate: admin.firestore.Timestamp.fromDate(now),
                endDate: admin.firestore.Timestamp.fromDate(endDate),
            },
        });
        console.log(`Assinatura ativada para usuário: ${userEmail || userId}, plano: ${plan}, expira: ${endDate}`);
        res.status(200).send({
            received: true,
            action: "subscription_activated",
            plan: plan,
            endDate: endDate.toISOString(),
        });
    }
    catch (error) {
        console.error("Erro ao processar webhook:", error);
        res.status(500).send({ error: "internal error" });
    }
});
// Função auxiliar para extrair o plano do nome do produto
function extractPlanFromProduct(productName) {
    const nameLower = productName.toLowerCase();
    if (nameLower.includes("anual") || nameLower.includes("annual")) {
        return "anual";
    }
    else if (nameLower.includes("semestral") || nameLower.includes("6 meses")) {
        return "semestral";
    }
    return "mensal";
}
// Função proxy para análise de refeição (resolve problema de CORS)
// V2 Syntax: request object contains data and auth
exports.analyzeMeal = functions.https.onCall(async (request) => {
    // Try to handle both v1 and v2 or just assume v2 based on previous errors
    // If request.data exists and it's not the payload but the wrapper, use it.
    // Check if it's v2 (request has .auth)
    const auth = request.auth;
    const data = request.data;
    // Verificar autenticação
    if (!auth) {
        throw new functions.https.HttpsError('unauthenticated', 'O usuário deve estar autenticado para analisar refeições.');
    }
    const { imageUrl, userId, mealPhotoId, timestamp } = data;
    const webhookUrl = 'https://webhook.nexaapp.online/webhook/fe75d6ee-4030-4147-a612-6b2c5f67cb2c';
    console.log(`[PROXY] Iniciando análise para usuário ${auth.uid}`);
    console.log(`[PROXY] Enviando para: ${webhookUrl}`);
    try {
        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                imageUrl,
                userId: userId || auth.uid,
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
//# sourceMappingURL=index.js.map