import type { VercelRequest, VercelResponse } from '@vercel/node';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';

// Duração dos planos em meses
const PLAN_DURATION: Record<string, number> = {
    mensal: 1,
    semestral: 6,
    anual: 12,
};

// Inicializar Firebase Admin
if (getApps().length === 0) {
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
        initializeApp({
            credential: cert(serviceAccount),
        });
    } else {
        // Fallback para desenvolvimento local
        initializeApp({
            projectId: 'nexanutri',
        });
    }
}

const db = getFirestore();

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

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Permitir apenas POST
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method Not Allowed" });
    }

    // Headers CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST');

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
        const approvedStatuses = ["approved", "completed", "paid", "APPROVED", "COMPLETED", "PAID"];
        if (!approvedStatuses.includes(paymentStatus || "")) {
            console.log(`Status de pagamento não aprovado: ${paymentStatus}`);
            return res.status(200).json({ received: true, action: "ignored", reason: "payment not approved" });
        }

        // Precisamos do email ou userId para identificar o usuário
        if (!userEmail && !userId) {
            console.error("Dados do usuário não encontrados no webhook");
            return res.status(400).json({ error: "user data not found" });
        }

        // Buscar usuário pelo email ou ID
        let userDocRef: FirebaseFirestore.DocumentReference | null = null;

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
            return res.status(404).json({ error: "user not found" });
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
                startDate: Timestamp.fromDate(now),
                endDate: Timestamp.fromDate(endDate),
            },
        });

        console.log(`Assinatura ativada para usuário: ${userEmail || userId}, plano: ${plan}, expira: ${endDate}`);

        return res.status(200).json({
            received: true,
            action: "subscription_activated",
            plan: plan,
            endDate: endDate.toISOString(),
        });

    } catch (error) {
        console.error("Erro ao processar webhook:", error);
        return res.status(500).json({ error: "internal error" });
    }
}
