import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import RecipeListPage from "./recipes/RecipeListPage.tsx";
import IngredientsListPage from "./ingredients/IngredientsListPage.tsx";
import IngredientDetailsPage from "./ingredients/IngredientDetailsPage.tsx";
import BottomNav from "./components/nav/BottomNav.tsx";
import RecipeDetailsPage from "./recipes/RecipeDetailsPage.tsx";
import LoginPage from "./auth/LoginPage.tsx";
import RegisterPage from "./auth/RegisterPage.tsx";
import { useAuth } from "./auth/AuthContext.ts";
import OrdersPage from "./orders/OrdersPage.tsx";
import BakePlanPage from "./bakePlan/BakePlanPage.tsx";
import SettingsPage from "./settings/SettingsPage.tsx";
import LeftNav from "./components/nav/LeftNav.tsx";
import AccountPage from "./auth/AccountPage.tsx";
import MorePage from "./more/MorePage.tsx";
import SessionsPage from "./sessions/SessionsPage.tsx";

function AppLayout() {
    const { user, loading } = useAuth();

    if (loading) return null;
    if (!user) return <Navigate to="/login" replace />;

    return (
        <div className="h-screen flex flex-col lg:flex-row">
            <LeftNav className="hidden lg:flex h-full w-64 bg-nav border-r border-nav-border" />

            <main className="flex-1 overflow-hidden">
                <section className="max-w-5xl mx-auto px-4 h-full py-6">
                    <Outlet />
                </section>
            </main>

            <BottomNav className="flex lg:hidden h-20 shrink-0 bg-nav border-t border-nav-border" />
        </div>
    );
}

function App() {
    return (
        <Routes>
            <Route path="/" element={<Navigate to="/recipes" replace />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            <Route element={<AppLayout />}>
                <Route path="/recipes" element={<RecipeListPage />} />
                <Route path="/recipes/new" element={<RecipeDetailsPage />} />
                <Route path="/recipes/:id" element={<RecipeDetailsPage />} />

                <Route path="/ingredients" element={<IngredientsListPage />} />
                <Route path="/ingredients/new" element={<IngredientDetailsPage />} />
                <Route path="/ingredients/:id" element={<IngredientDetailsPage />} />

                <Route path="/sessions" element={<SessionsPage />} />
                <Route path="/orders" element={<OrdersPage />} />
                <Route path="/bakeplan" element={<BakePlanPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/account" element={<AccountPage />} />
                <Route path="/more" element={<MorePage />} />
            </Route>
        </Routes>
    );
}

export default App;
