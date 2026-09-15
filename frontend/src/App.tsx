import { Route, Routes } from 'react-router-dom';
import RecipeTest from './Recipes/Recipe.tsx';
import Test from './Test.tsx';

function App() {
  return (
    <>
      <section>
        <h1 className="text-3xl font-bold underline text-blue-600">Tailwind works</h1>
        
      </section>
      <main>
        <Routes>
          <Route path="/test" element={<Test />}></Route>
          <Route path="/recipe" element={<RecipeTest/>}></Route>
        </Routes>
      </main>
    </>
  )
}

export default App
