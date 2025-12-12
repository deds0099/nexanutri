import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Duração dos planos em meses
const PLAN_DURATION = {
    mensal: 1,
    semestral: 6,
    anual: 12,
};

// Inicializar Firebase Admin
if (getApps().length === 0) {
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
        try {
            const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
            initializeApp({
                credential: cert(serviceAccount),
            });
        } catch (e) {
            console.error("Failed to parse Service Account", e);
        }
    } else {
        // Fallback if needed or locally
        initializeApp({
            projectId: "nexanutri"
        });
    }
}

const db = getFirestore();

// Função auxiliar para extrair o plano do nome do produto
function extractPlanFromProduct(productName) {
    const nameLower = (productName || '').toLowerCase();
    if (nameLower.includes("anual") || nameLower.includes("annual")) {
        return "anual";
    } else if (nameLower.includes("semestral") || nameLower.includes("6 meses")) {
        return "semestral";
    }
    return "mensal";
}

export default async function handler(req, res) {
    // Headers CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle OPTIONS request
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Permitir apenas POST
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method Not Allowed" });
    }

    try {
        const payload = req.body;
        console.log("Webhook recebido:", JSON.stringify(payload, null, 2));

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
            extractPlanFromProduct(payload.product?.name || payload.data?.additional_info?.items?.[0]?.title || "");

        const approvedStatuses = ["approved", "completed", "paid", "APPROVED", "COMPLETED", "PAID"];
        if (!approvedStatuses.includes(paymentStatus || "")) {
            return res.status(200).json({ received: true, action: "ignored", reason: "payment not approved" });
        }

        if (!userEmail && !userId) {
            return res.status(400).json({ error: "user data not found" });
        }

        let userDocRef = null;
        if (userId) {
            userDocRef = db.collection("users").doc(userId);
        } else if (userEmail) {
            const userQuery = await db.collection("users").where("email", "==", userEmail).limit(1).get();
            if (!userQuery.empty) {
                userDocRef = userQuery.docs[0].ref;
            }
        }

        if (!userDocRef) {
            return res.status(404).json({ error: "user not found" });
        }

        const now = new Date();
        const durationMonths = PLAN_DURATION[plan] || 1;
        const endDate = new Date(now);
        endDate.setMonth(endDate.getMonth() + durationMonths);

        await userDocRef.update({
            subscription: {
                plan: plan,
                status: "active",
                startDate: now,
                endDate: endDate,
            },
        });

        return res.status(200).json({
            received: true,
            action: "subscription_activated",
            plan: plan
        });

    } catch (error) {
        console.error("Erro webhook:", error);
        return res.status(500).json({ error: "internal error" });
    }
}
