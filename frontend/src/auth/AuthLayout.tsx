import { CakeSlice, ChefHat, Cookie, Croissant, Wheat } from "lucide-react";
import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

function AuthLayout({ children }: { children: ReactNode }) {
    const { user, loading } = useAuth();

    if (loading) return null;
    if (user) return <Navigate to="/ingredients" replace></Navigate>;

    return (
        <div className="min-h-screen grid lg:grid-cols-2 bg-background">
            <div className="relative hidden lg:flex flex-col justify-center overflow-hidden bg-primary p-14 text-header">
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 text-header/10"
                >
                    <Croissant className="absolute -left-6 top-16 h-40 w-40 -rotate-12" />
                    <CakeSlice className="absolute right-10 top-10 h-28 w-28 rotate-12" />
                    <Wheat className="absolute -right-8 bottom-24 h-48 w-48 -rotate-6" />
                    <Cookie className="absolute left-20 bottom-10 h-24 w-24 rotate-6" />
                </div>

                <div className="relative max-w-md">
                    <div className="mb-10 flex items-center gap-3">
                        <div className="rounded-2xl bg-surface/25 p-3">
                            <ChefHat className="h-8 w-8" />
                        </div>
                        <span className="text-lg font-semibold">Baking Management</span>
                    </div>
                    <h2 className="text-5xl font-semibold leading-tight tracking-tight">
                        Your recipes, costed to the penny.
                    </h2>
                    <p className="mt-5 text-lg text-header/80">
                        Track ingredient prices, build your recipes and know exactly what every bake
                        costs.
                    </p>
                </div>
            </div>

            <div className="flex items-center justify-center px-4 py-12">
                <div className="w-full max-w-sm">
                    <div className="mb-8 flex items-center gap-3 lg:hidden">
                        <div className="rounded-2xl bg-primary/15 p-2.5 text-primary">
                            <ChefHat className="h-7 w-7" />
                        </div>
                        <span className="text-lg font-semibold text-header">Baking Management</span>
                    </div>
                    {children}
                </div>
            </div>
        </div>
    );
}

export default AuthLayout;
