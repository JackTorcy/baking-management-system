import { createContext, useContext } from "react";

export interface CurrentUser {
    email: string;
    bakeryId: number;
    bakeryName: string;
}

interface AuthState {
    user: CurrentUser | null;
    loading: boolean;
    setUser: (user: CurrentUser | null) => void;
    logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthState | null>(null);

export function useAuth() {
    const auth = useContext(AuthContext);
    if (!auth) throw new Error("useAuth must be used inside AuthProvider");
    return auth;
}
