import { Route, Routes } from "react-router-dom";
import RecipeTest from "./recipes/Recipe.tsx";
import IngredientsList from "./ingredients/IngredientsList.tsx";
import IngredientDetails from "./ingredients/IngredientDetails.tsx";
import TopNav from "./components/nav/TopNav.tsx";
import BottomNav from "./components/nav/BottomNav.tsx";

function App() {
    return (
        <div className="h-screen flex flex-col">
            <TopNav className="hidden md:flex h-20 shrink-0 bg-primary" />

            <main className="flex-1 overflow-hidden">
                <section className="max-w-5xl mx-auto px-4 h-full py-6">
                    <Routes>
                        <Route path="/recipe" element={<RecipeTest />}></Route>
                        <Route path="/ingredients" element={<IngredientsList />}></Route>
                        <Route path="/ingredients/new" element={<IngredientDetails />}></Route>
                        <Route path="/ingredients/:id" element={<IngredientDetails />}></Route>
                    </Routes>
                </section>
            </main>

            <BottomNav className="flex md:hidden h-20 shrink-0 bg-primary" />
        </div>
    );
}

export default App;
