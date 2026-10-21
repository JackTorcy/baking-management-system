import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import RecipeList from "./recipes/RecipeList.tsx";
import IngredientsList from "./ingredients/IngredientsList.tsx";
import IngredientDetails from "./ingredients/IngredientDetails.tsx";
import BottomNav from "./components/nav/BottomNav.tsx";
import RecipeDetails from "./recipes/RecipeDetails.tsx";
import Login from "./auth/Login.tsx";
import Register from "./auth/Register.tsx";
import { useAuth } from "./auth/AuthContext.ts";
import Orders from "./orders/Orders.tsx";
import BakePlan from "./bakePlan/BakePlan.tsx";
import Settings from "./settings/Settings.tsx";
import LeftNav from "./components/nav/LeftNav.tsx";
import Account from "./auth/Account.tsx";
import More from "./more/More.tsx";
import Sessions from "./sessions/Sessions.tsx";

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
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route element={<AppLayout />}>
                <Route path="/recipes" element={<RecipeList />} />
                <Route path="/recipes/new" element={<RecipeDetails />} />
                <Route path="/recipes/:id" element={<RecipeDetails />} />

                <Route path="/ingredients" element={<IngredientsList />} />
                <Route path="/ingredients/new" element={<IngredientDetails />} />
                <Route path="/ingredients/:id" element={<IngredientDetails />} />

                <Route path="/sessions" element={<Sessions />} />
                <Route path="/orders" element={<Orders />} />
                <Route path="/bakeplan" element={<BakePlan />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/account" element={<Account />} />
                <Route path="/more" element={<More />} />
            </Route>
        </Routes>
    );
}

export default App;
