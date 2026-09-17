import { Route, Routes } from "react-router-dom";
import RecipeTest from "./recipes/Recipe.tsx";
import Test from "./Test.tsx";
import IngredientsList from "./ingredients/IngredientsList.tsx";
import IngredientDetails from "./ingredients/IngredientDetails.tsx";

function App() {
    return (
        <>
            <section>
                <h1 className="text-3xl font-bold underline text-blue-600">
                    Tailwind works
                </h1>
            </section>
            <main>
                <Routes>
                    <Route path="/test" element={<Test />}></Route>
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
            </main>
        </>
    );
}

export default App;
