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

interface UserData {
    email: string;
    name: string;
    createdAt: Date;
    subscription?: Subscription;
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
                const subscription = data.subscription ? {
                    ...data.subscription,
                    startDate: data.subscription.startDate?.toDate?.() || new Date(data.subscription.startDate),
                    endDate: data.subscription.endDate?.toDate?.() || new Date(data.subscription.endDate),
                } : undefined;

                setUserData({
                    email: data.email,
                    name: data.name,
                    createdAt: data.createdAt?.toDate?.() || new Date(data.createdAt),
                    subscription,
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

        return userData.subscription.status === "active" && endDate > now;
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
