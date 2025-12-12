import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import {
    User,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut as firebaseSignOut
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

export interface Subscription {
    plan: "mensal" | "semestral" | "anual";
    status: "active" | "expired" | "cancelled";
    startDate: Date;
    endDate: Date;
}

export interface MealItem {
    name: string;
    time: string;
    items: string[];
    calories: number;
}

export interface DietPlan {
    calories: number;
    objective: string;
    meals: MealItem[];
    generatedAt: Date;
}

interface UserData {
    email: string;
    name: string;
    createdAt: Date;
    subscription?: Subscription;
    diet?: DietPlan;
}

interface AuthContextType {
    user: User | null;
    userData: UserData | null;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<void>;
    signUp: (email: string, password: string, name: string) => Promise<void>;
    signOut: () => Promise<void>;
    hasActiveSubscription: () => boolean;
    refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [userData, setUserData] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchUserData = async (uid: string) => {
        try {
            const userDoc = await getDoc(doc(db, "users", uid));
            if (userDoc.exists()) {
                const data = userDoc.data();

                // Helper segura para datas
                const parseDate = (dateVal: any) => {
                    if (!dateVal) return new Date();
                    // Se for Timestamp do Firestore
                    if (dateVal.toDate && typeof dateVal.toDate === 'function') {
                        return dateVal.toDate();
                    }
                    // Se for string ou number
                    return new Date(dateVal);
                };

                const subscription = data.subscription ? {
                    ...data.subscription,
                    startDate: parseDate(data.subscription.startDate),
                    endDate: parseDate(data.subscription.endDate),
                } : undefined;

                // Debug logs para Dieta
                console.log("DEBUG RAW FIRESTORE DATA:", data);
                if (data.diet) {
                    console.log("DEBUG RAW DIET:", data.diet);
                } else {
                    console.log("DEBUG: Sem campo 'diet' no Firestore");
                }

                const diet = data.diet ? {
                    ...data.diet,
                    generatedAt: parseDate(data.diet.generatedAt),
                } : undefined;

                console.log("DEBUG PROCESSED DIET:", diet);

                setUserData({
                    email: data.email,
                    name: data.name,
                    createdAt: parseDate(data.createdAt),
                    subscription,
                    diet,
                });
            }
        } catch (error) {
            console.error("Erro ao buscar dados do usuário:", error);
        }
    };

    const refreshUserData = async () => {
        if (user) {
            await fetchUserData(user.uid);
        }
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setUser(user);
            if (user) {
                await fetchUserData(user.uid);
            } else {
                setUserData(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // Debug effect
    useEffect(() => {
        if (userData) {
            console.log("DEBUG: UserData carregado:", userData);

            if (userData.subscription) {
                const now = new Date();
                const endDate = userData.subscription.endDate;
                const status = userData.subscription.status?.toLowerCase() || "";

                console.log("DEBUG: Comparação de datas:", {
                    now: now.toISOString(),
                    endDate: endDate instanceof Date ? endDate.toISOString() : endDate,
                    isActive: status === "active",
                    isDateValid: endDate > now
                });
            }
        }
    }, [userData]);

    const signIn = async (email: string, password: string) => {
        await signInWithEmailAndPassword(auth, email, password);
    };

    const signUp = async (email: string, password: string, name: string) => {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);

        // Criar documento do usuário no Firestore
        await setDoc(doc(db, "users", userCredential.user.uid), {
            email,
            name,
            createdAt: new Date(),
        });
    };

    const signOut = async () => {
        await firebaseSignOut(auth);
        setUserData(null);
    };

    const hasActiveSubscription = (): boolean => {
        if (!userData?.subscription) return false;

        const now = new Date();
        const endDate = userData.subscription.endDate;
        const status = userData.subscription.status?.toLowerCase() || "";

        return status === "active" && endDate > now;
    };

    return (
        <AuthContext.Provider value={{
            user,
            userData,
            loading,
            signIn,
            signUp,
            signOut,
            hasActiveSubscription,
            refreshUserData,
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth deve ser usado dentro de um AuthProvider");
    }
    return context;
}
