import { useState } from "react";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import { Link, useParams } from "react-router-dom";
import PageTitle from "../components/ui/PageTitle";
import { ArrowLeft } from "lucide-react";

function RecipeDetails() {
    const { id } = useParams();
    const isNew = id === undefined;
    const buttonLabel = isNew ? "Add Recipe" : "Edit Recipe";
    const [loading, setLoading] = useState(false);

    if (loading)
        return (
            <div className="flex min-h-screen justify-center items-center">
                <LoadingSpinner className="h-12 w-12 border-4 text-primary" />
            </div>
        );

    return (
        <>
            {isNew ? <div>New</div> : <div>Existing</div>}
            <div></div>

            <div className="flex mb-6">
                <Link to="/recipes" className="inline-flex items-center gap-2 w-fit p-2 mr-3">
                    <ArrowLeft />
                </Link>

                <PageTitle title={buttonLabel}></PageTitle>
            </div>

            {/* Edit View vs Read View important */}

            {/* ----- Page content ------ */}
            {/* Title Part, Back arrow */}
            {/* Overview (serves, prep, cook times) */}
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
