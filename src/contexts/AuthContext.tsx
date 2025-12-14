import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import {
    User,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut as firebaseSignOut
} from "firebase/auth";
import { doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

export interface Subscription {
    plan: "mensal" | "semestral" | "anual";
    status: "active" | "expired" | "cancelled";
    startDate: Date;
    endDate: Date;
}

export interface MealOption {
    name: string;
    items: string[];
}

export interface MealItem {
    name: string;
    time: string;
    items: string[];
    options?: MealOption[];
    calories: number;
    macros?: {
        protein: number;
        carbs: number;
        fats: number;
    };
}

export interface DietPlan {
    calories: number;
    objective: string;
    meals: MealItem[];
    generatedAt: Date;
    // New fields
    tbm?: number;
    tdee?: number;
    macros?: {
        protein: { g: number; pct: number };
        carbs: { g: number; pct: number };
        fats: { g: number; pct: number };
    };
    warnings?: string[];
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

    // Efeito para monitorar autenticação
    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
            setUser(user);
            if (!user) {
                setUserData(null);
                setLoading(false);
            }
        });
        return () => unsubscribeAuth();
    }, []);

    // Efeito para monitorar dados do usuário em tempo real
    useEffect(() => {
        let unsubscribeSnapshot: () => void;

        if (user) {
            const userRef = doc(db, "users", user.uid);

            unsubscribeSnapshot = onSnapshot(userRef, (docSnap) => {
                if (docSnap.exists()) {
                    const data = docSnap.data();

                    // Helper segura para datas
                    const parseDate = (dateVal: any) => {
                        if (!dateVal) return new Date();
                        if (dateVal.toDate && typeof dateVal.toDate === 'function') {
                            return dateVal.toDate();
                        }
                        return new Date(dateVal);
                    };

                    const subscription = data.subscription ? {
                        ...data.subscription,
                        startDate: parseDate(data.subscription.startDate),
                        endDate: parseDate(data.subscription.endDate),
                    } : undefined;

                    const diet = data.diet ? {
                        ...data.diet,
                        generatedAt: parseDate(data.diet.generatedAt),
                    } : undefined;

                    setUserData({
                        email: data.email,
                        name: data.name,
                        createdAt: parseDate(data.createdAt),
                        subscription,
                        diet,
                    });
                } else {
                    // Fallback para usuário sem doc
                    setUserData({
                        email: user.email || "",
                        name: user.displayName || "",
                        createdAt: new Date(),
                    });
                }
                setLoading(false);
            }, (error) => {
                console.error("Erro no realtime listener:", error);
                setLoading(false);
            });
        }

        return () => {
            if (unsubscribeSnapshot) unsubscribeSnapshot();
        };
    }, [user]);

    // Manter fetchUserData apenas como compatibilidade ou refresh manual se necessário
    const fetchUserData = async (uid: string) => {
        // Agora o estado é gerenciado pelo snapshot, essa função pode ser no-op ou log
        console.log("fetchUserData chamado (deprecated em favor do realtime)");
    };

    const refreshUserData = async () => {
        // No-op, pois o snapshot já atualiza sozinho
    };

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
