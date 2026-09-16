import { Route, Routes } from "react-router-dom";
import RecipeTest from "./Recipes/Recipe.tsx";
import Test from "./Test.tsx";
import IngredientsList from "./Ingredients/IngredientsList.tsx";
import IngredientDetails from "./Ingredients/IngredientDetails.tsx";

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
          <Route path="/ingredients" element={<IngredientsList />}></Route>
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
