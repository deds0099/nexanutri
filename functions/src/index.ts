import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();
const db = admin.firestore();

// Duração dos planos em meses
const PLAN_DURATION: Record<string, number> = {
    mensal: 1,
    semestral: 6,
    anual: 12,
};

interface WebhookPayload {
    event?: string;
    type?: string;
    data?: {
        id?: string;
        status?: string;
        external_reference?: string;
        payer?: {
            email?: string;
        };
        metadata?: {
            plan?: string;
            user_email?: string;
            user_id?: string;
        };
        additional_info?: {
            items?: Array<{
                title?: string;
                description?: string;
            }>;
        };
    };
    // VegaCheckout format
    customer?: {
        email?: string;
    };
    payment?: {
        status?: string;
    };
    product?: {
        name?: string;
    };
    custom_fields?: {
        plan?: string;
        user_id?: string;
    };
}

export const webhookPagamento = functions.https.onRequest(async (req, res) => {
    // Permitir apenas POST
    if (req.method !== "POST") {
        res.status(405).send("Method Not Allowed");
        return;
    }

    try {
        const payload: WebhookPayload = req.body;

        console.log("Webhook recebido:", JSON.stringify(payload, null, 2));

        // Tentar extrair informações do pagamento (funciona com VegaCheckout e MercadoPago)
        const paymentStatus = payload.data?.status || payload.payment?.status;
        const userEmail =
            payload.data?.metadata?.user_email ||
            payload.data?.payer?.email ||
            payload.customer?.email;
        const userId =
            payload.data?.metadata?.user_id ||
            payload.custom_fields?.user_id;
        const plan =
            payload.data?.metadata?.plan ||
            payload.custom_fields?.plan ||
            extractPlanFromProduct(payload.product?.name || payload.data?.additional_info?.items?.[0]?.title || "");

        // Verificar se o pagamento foi aprovado
        if (paymentStatus !== "approved" && paymentStatus !== "completed" && paymentStatus !== "paid") {
            console.log(`Status de pagamento não aprovado: ${paymentStatus}`);
            res.status(200).send({ received: true, action: "ignored", reason: "payment not approved" });
            return;
        }

        // Precisamos do email ou userId para identificar o usuário
        if (!userEmail && !userId) {
            console.error("Dados do usuário não encontrados no webhook");
            res.status(400).send({ error: "user data not found" });
            return;
        }

        // Buscar usuário pelo email ou ID
        let userDocRef: admin.firestore.DocumentReference | null = null;

        if (userId) {
            userDocRef = db.collection("users").doc(userId);
        } else if (userEmail) {
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

    } catch (error) {
        console.error("Erro ao processar webhook:", error);
        res.status(500).send({ error: "internal error" });
    }
});

// Função auxiliar para extrair o plano do nome do produto
function extractPlanFromProduct(productName: string): string {
    const nameLower = productName.toLowerCase();
    if (nameLower.includes("anual") || nameLower.includes("annual")) {
        return "anual";
    } else if (nameLower.includes("semestral") || nameLower.includes("6 meses")) {
        return "semestral";
    }
    return "mensal";
}
