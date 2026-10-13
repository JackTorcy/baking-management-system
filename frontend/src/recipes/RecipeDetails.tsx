import { useEffect, useState } from "react";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import { useParams } from "react-router-dom";
import PageTitleWithBack from "../components/ui/PageTitleWithBack";
import SubTitle from "../components/ui/SubTitle";
import type { ExistingRecipe, NewRecipe } from "../types/Recipe";
import type { ExistingIngredient } from "../types/Ingredient";

function RecipeDetails() {
    const { id } = useParams();
    const isNew = id === undefined; //New (no id) vs Existing (id)
    //const isViewMode = true; //View Mode (no edit) vs Edit (edit)
    const buttonLabel = isNew ? "Add Recipe" : "Edit Recipe";
    const [loading, setLoading] = useState(false);
    const [loadFailed, setLoadFailed] = useState(false);
    const [recipe, setRecipe] = useState<NewRecipe>({
        name: "",
        price: "",
        description: "",
        ingredients: [],
    });
    const [allIngredients, setAllIngredients] = useState<ExistingIngredient[]>([]);

    const getIngredientNameFromId = (id: number): string => {
        const ingredient = allIngredients.find((i) => i.id == id);
        return ingredient ? ingredient.name : "";
    };

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);

            await loadAllIngredients();
            if (!isNew) {
                await loadRecipe();
            }

            setLoading(false);
        };

        const loadRecipe = async () => {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/recipes/${id}`);

            if (res.ok) {
                const data: ExistingRecipe = await res.json();
                setRecipe({
                    name: data.name,
                    price: data.price,
                    description: data.description,
                    ingredients: data.ingredients,
                });
            } else {
                setLoadFailed(true);
                console.error("load failed: ", res.status);
            }
        };

        const loadAllIngredients = async () => {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/ingredients`);
            const data = await res.json();
            setAllIngredients(data);
        };

        loadData();
    }, [id, isNew]);

    if (!isNew && loadFailed) return <div>Failed to load data</div>;

    if (loading)
        return (
            <div className="flex min-h-screen justify-center items-center">
                <LoadingSpinner className="h-12 w-12 border-4 text-primary" />
            </div>
        );

    return (
        <>
            {/* Edit View vs Read View important */}

            {/* ----- Page content ------ */}
            {/* Title Part, Back arrow */}
            <PageTitleWithBack title={buttonLabel} backPath="/recipes"></PageTitleWithBack>

            {/* Overview (serves, prep, cook times) */}
            <div className="bg-surface my-4">
                <div className="flex-col">
                    <div className="flex">
                        <div className="flex-1">Serves:</div>
                        <div className="flex-1">Prep Time:</div>
                    </div>
                    <div className="flex">
                        <div className="flex-1">Price:</div>
                        <div className="flex-1">Idk:</div>
                    </div>
                </div>
            </div>

            <div className="border rounded-2xl flex flex-col max-h-80 p-2 bg-surface">
                <SubTitle title="Ingredients"></SubTitle>
                <div className="flex-1 overflow-y-auto">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {recipe.ingredients.map((i) => (
                            <div key={i.ingredientId}>
                                {getIngredientNameFromId(i.ingredientId)}
                            </div>
                        ))}
                    </div>
                    <ul>
                        <li className="flex-1">Test</li>
                        <li className="flex-1">Test</li>
                    </ul>
                </div>

                {/* dropdown — fixed at the bottom of the panel, doesn't move */}
                <div className="shrink-0 border-t border-border">
                    <select className="w-full border border-border rounded-2xl px-3 py-2">
                        <option key="" value="">
                            Select
                        </option>
                        {allIngredients.map((i) => (
                            <option key={i.id} value={i.id}>
                                {i.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Scaling? */}
            {/* Components */}
            {/* Ingredients list - measurements, costing (Nutrition later) */}
            {/* Method */}

            {/* Push users towards doing ingredients first. */}
            {/* Then as you add steps to method, tick which ingredients and how much are used in each step. */}
            {/* This allows you to in sessions track and tick off ingredients as the product is made */}
            {/* Should allow for really simple and clean UX */}
            {/* Will need to add a boolean flag to Recipe Ingredient and Recipe Component joins to allow use to tick them off */}
        </>
    );
}

export default RecipeDetails;
