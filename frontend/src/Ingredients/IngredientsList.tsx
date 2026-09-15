import { useEffect, useState } from "react";

type IngredientUnit = 'kilogram' | 'gram' | 'millilitre' | 'litre' | 'item'

interface Ingredient {
    id: number;
    name: string;
    price: number;
    ingredientUnit: IngredientUnit;
    createdAt: string;
}



function IngredientsList() {
    const [ingredients, setIngredients] = useState<Ingredient[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/immutability
        loadIngredients();
    }, [])

    const loadIngredients = async () => {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/ingredients`);
        const data = await res.json();
        setIngredients(data);
        setLoading(false);
    }

    if (loading) return <p>Loading...</p>;

    return (
        <>
            <ul>
                {ingredients.map((i) => (
                    <li key={i.id}>
                        {i.name} : {i.price} : {i.ingredientUnit}
                    </li>
                ))}
            </ul>
        </>
    )
}

export default IngredientsList;