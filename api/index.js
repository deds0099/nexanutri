import { initializeApp, cert, getApps, deleteApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');

    try {
        const serviceAccountStr = process.env.FIREBASE_SERVICE_ACCOUNT;

        if (!serviceAccountStr) {
            throw new Error("FIREBASE_SERVICE_ACCOUNT environment variable is missing");
        }

        let serviceAccount;
        try {
            serviceAccount = JSON.parse(serviceAccountStr);
        } catch (e) {
            throw new Error("Failed to parse FIREBASE_SERVICE_ACCOUNT JSON: " + e.message);
        }

        // Ensure clean slate for this request if needed, or reuse
        // Note: Vercel reuses instances, so checking getApps() is good.
        if (getApps().length === 0) {
            initializeApp({
                credential: cert(serviceAccount),
            });
        }

        const db = getFirestore();

        // Try to write a test document
        const testDoc = db.collection('_debug_tests').doc('connection_check');
        await testDoc.set({
            timestamp: new Date().toISOString(),
            status: 'working',
            environment: 'vercel'
        });

        return res.status(200).json({
            status: 'success',
            message: 'Successfully connected to Firestore and wrote test document.',
            projectId: serviceAccount.project_id
        });

    } catch (error) {
        console.error("Firestore Error:", error);
        return res.status(500).json({
            status: 'error',
            message: error.message,
            stack: error.stack
        });
    }
}
