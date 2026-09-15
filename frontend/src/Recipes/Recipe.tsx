import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

interface NewRecipe {
    name: string;
    description?: string;
    price: number;
}

interface Recipe extends NewRecipe {
    id: number;
    createdAt: string;
}

function RecipeTest() {
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [loading, setLoading] = useState(false);
    
    const newRecipe: NewRecipe = { 
        name: 'Apple Pie',
        description: 'Bare good G',
        price: 6.79
    };

    const loadRecipes = async () => {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/recipes`);
        const data = await res.json();
        setRecipes(data);
        setLoading(false);
    }

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        loadRecipes();
    }, [])

    const handleCreate = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/recipes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newRecipe),
            });

            console.log('status:', res.status);          // did it reach the server?
            if (!res.ok) {
                const text = await res.text();
                console.error('failed:', res.status, text); // what did the server say?
                return;
            }
            else {
                await loadRecipes();
            }

            const created = await res.json();
            console.log('created:', created);
        } catch (err) {
            console.error('fetch threw:', err);            // network/CORS-level failure
        }
    };

    const handleDelete = async (id: number) => {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/recipes/${id}`, {
            method: 'DELETE'
        });
        if (res.ok) {
            setRecipes(recipes => recipes.filter(r => r.id !== id));
        } else {
            console.error('delete failed:', res.status);
        }
    }

    const updateRecipe = async (recipe: Recipe) => {
        const updatedRecipe: Recipe = { 
            id: recipe.id,
            name: 'Updated Food',
            description: 'Updated Data',
            createdAt: recipe.createdAt,
            price: 999.99
        };  

        return updatedRecipe;
    }

    const handleEdit = async (recipe: Recipe) => {
        const editedRecipe = await updateRecipe(recipe);

        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/recipes/${recipe.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editedRecipe),
            });

            console.log('status:', res.status);          // did it reach the server?
            if (!res.ok) {
                const text = await res.text();
                console.error('failed:', res.status, text); // what did the server say?
                return;
            }
            else {
                await loadRecipes();
            }

            const edited = await res.json();
            console.log('created:', edited);
        } catch (err) {
            console.error('edit threw:', err);
        }
    }

    if (loading) return <p>Loading...</p>;

    return (
        <>
            <h1>Recipes stuff</h1>
            <ul>
                {recipes.map((r) => (
                    <li key={r.id}>
                        {r.name}: {r.price} 
                        <button type="button" onClick={() => handleEdit(r)}>Edit</button>
                        <button type="button" onClick={() => handleDelete(r.id)}>Delete</button>
                    </li>
                ))}
            </ul>
            <button type="button" 
                onClick={() => handleCreate()}
            >
                Add Recipe
            </button>
            <Link to="/test">Go to Test</Link>
        </>
    )
}

export default RecipeTest;