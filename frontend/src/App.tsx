import { Route, Routes } from "react-router-dom";
import RecipeTest from "./recipes/Recipe.tsx";
import IngredientsList from "./ingredients/IngredientsList.tsx";
import IngredientDetails from "./ingredients/IngredientDetails.tsx";
import TopNav from "./components/nav/TopNav.tsx";

function App() {
    return (
        <>
            <TopNav className="hidden md:flex" />

            <main className="py-6">
                <section className="max-w-5xl mx-auto px-4">
                    <Routes>
                        <Route path="/recipe" element={<RecipeTest />}></Route>
                        <Route
                            path="/ingredients"
                            element={<IngredientsList />}
                        ></Route>
                        <Route
                            path="/ingredients/new"
                            element={<IngredientDetails />}
                        ></Route>
                        <Route
                            path="/ingredients/:id"
                            element={<IngredientDetails />}
                        ></Route>
                    </Routes>
                </section>
            </main>
        </>
    );
}

export default App;
