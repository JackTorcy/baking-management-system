import { useEffect, useState, type ReactNode } from "react";
import { AuthContext, type CurrentUser } from "./AuthContext";

function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<CurrentUser | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadMe = async () => {
            try {
                const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/me`);
                if (res.ok) setUser(await res.json());
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        loadMe();
    }, []);

    return (
        <AuthContext.Provider value={{ user, loading, setUser }}>{children}</AuthContext.Provider>
    );
}

export default AuthProvider;
