import { useNavigate, useParams } from "react-router-dom";
import {
    baseUnit,
    formatUnitPrice,
    ingredientUnits,
    maxUnitPrice,
    pricePer,
    unitKind,
    unitLabel,
    unitsOfKind,
    type ExistingIngredient,
    type IngredientUnit,
    type NewIngredient,
    type UnitKind,
} from "../types/Ingredient";
import { useEffect, useState } from "react";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import PageTitleWithBack from "../components/ui/PageTitleWithBack";
import ConfirmDialog from "../components/ui/ConfirmDialog";

function IngredientDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditing = id !== undefined;
    const buttonLabel = isEditing ? "Update Ingredient" : "Add Ingredient";
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [loadFailed, setLoadFailed] = useState(false);
    const [ingredient, setIngredient] = useState<NewIngredient>({
        name: "",
        price: "",
        packSize: "1",
        ingredientUnit: "kilogram",
    });
    const [lockedKind, setLockedKind] = useState<UnitKind | null>(null);
    const [confirmingDelete, setConfirmingDelete] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState("");
    const unitOptions = lockedKind ? unitsOfKind(lockedKind) : ingredientUnits;
    const isUsedInRecipe = lockedKind !== null;

    const [errors, setErrors] = useState<Record<string, string>>({});
    const validate = () => {
        const newErrors: Record<string, string> = {};

        if (!ingredient.name.trim()) {
            newErrors.name = "Name is required";
        }

        if (!ingredient.price.trim()) {
            newErrors.price = "Price is required";
        } else if (isNaN(Number(ingredient.price)) || ingredient.price.endsWith(".")) {
            newErrors.price = "Price must be a number";
        } else if (Number(ingredient.price) <= 0) {
            newErrors.price = "Price must be greater than 0";
        } else if (ingredient.price && !/^\d*\.?\d{0,4}$/.test(ingredient.price)) {
            newErrors.price = "Price must not have more than 4 decimal places";
        }

        if (!ingredient.packSize.trim()) {
            newErrors.packSize = "Pack size is required";
        } else if (isNaN(Number(ingredient.packSize)) || ingredient.packSize.endsWith(".")) {
            newErrors.packSize = "Pack size must be a number";
        } else if (Number(ingredient.packSize) <= 0) {
            newErrors.packSize = "Pack size must be greater than 0";
        } else if (!/^\d*\.?\d{0,4}$/.test(ingredient.packSize)) {
            newErrors.packSize = "Pack size must not have more than 4 decimal places";
        }

        const unitPrice = pricePer(ingredient, ingredient.ingredientUnit);
        if (!newErrors.price && !newErrors.packSize && unitPrice > maxUnitPrice) {
            const unit = ingredient.ingredientUnit;
            const smallerUnit = baseUnit[unitKind[unit]];
            newErrors.price =
                `That's ${formatUnitPrice(unitPrice)} per ${unitLabel[unit] || unit}. ` +
                `Prices over ${formatUnitPrice(maxUnitPrice)} per unit are usually a typo` +
                (smallerUnit !== unit
                    ? `, or try entering it per ${unitLabel[smallerUnit]}.`
                    : ".");
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    useEffect(() => {
        if (!isEditing) return;

        const loadIngredient = async () => {
            setLoading(true);
            try {
                const res = await fetch(`${import.meta.env.VITE_API_URL}/ingredients/${id}`);
                if (!res.ok) throw new Error(`load failed: ${res.status}`);

                const data: ExistingIngredient = await res.json();
                setIngredient({
                    name: data.name,
                    price: data.price,
                    packSize: data.packSize,
                    ingredientUnit: data.ingredientUnit,
                });
                if (data.isUsedInRecipe) setLockedKind(unitKind[data.ingredientUnit]);
            } catch (err) {
                console.error(err);
                setLoadFailed(true);
            } finally {
                setLoading(false);
            }
        };

        loadIngredient();
    }, [id, isEditing]);

    const deleteIngredient = async () => {
        setDeleting(true);
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/ingredients/${id}`, {
                method: "DELETE",
            });
            if (res.ok) {
                navigate("/ingredients");
                return;
            }
            setDeleteError("Couldn't delete this ingredient. Try again.");
        } catch (err) {
            console.error(err);
            setDeleteError("Couldn't delete this ingredient. Try again.");
        } finally {
            setDeleting(false);
        }
    };

    const handleSubmit = async () => {
        if (!validate()) return;

        setSubmitting(true);
        try {
            const res = await fetch(
                `${import.meta.env.VITE_API_URL}/ingredients${isEditing ? `/${id}` : ""}`,
                {
                    method: isEditing ? "PUT" : "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(ingredient),
                },
            );
            if (!res.ok) throw new Error(`${isEditing ? "edit" : "create"} failed: ${res.status}`);

            const data = await res.json();
            navigate(`/ingredients/${data.id}`);
        } catch (err) {
            console.error(err);
        } finally {
            setSubmitting(false);
        }
    };

    if (isEditing && loadFailed) return <div>Failed to load data</div>;

    if (loading)
        return (
            <div className="flex min-h-screen justify-center items-center">
                <LoadingSpinner className="h-12 w-12 border-4 text-primary" />
            </div>
        );

    return (
        <>
            <PageTitleWithBack title={buttonLabel} backPath="/ingredients"></PageTitleWithBack>

            <div className="grid grid-cols-1 mb-4">
                <div>
                    <label htmlFor="ingredientName" className="block mb-2">
                        Ingredient name
                    </label>
                    <input
                        id="ingredientName"
                        type="text"
                        className="border border-border bg-surface w-full rounded-2xl py-2 px-4"
                        value={ingredient.name}
                        onChange={(e) =>
                            setIngredient((prev) => ({
                                ...prev,
                                name: e.target.value,
                            }))
                        }
                    />
                    {errors.name && <span className="text-danger text-sm">{errors.name}</span>}
                </div>
            </div>
            <div className="mb-2">
                <label htmlFor="ingredientPrice" className="block mb-2">
                    What did you pay?
                </label>
                <div className="flex items-center gap-2">
                    <div className="relative w-38">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2">£</span>
                        <input
                            id="ingredientPrice"
                            type="text"
                            inputMode="decimal"
                            placeholder="1.35"
                            className="border border-border bg-surface w-full rounded-2xl py-2 pl-8 pr-4"
                            value={ingredient.price}
                            onChange={(e) => {
                                if (/^\d*\.?\d{0,4}$/.test(e.target.value))
                                    setIngredient((prev) => ({
                                        ...prev,
                                        price: e.target.value,
                                    }));
                            }}
                        />
                    </div>
                    <span>for</span>
                    <input
                        aria-label="Amount bought"
                        type="text"
                        inputMode="decimal"
                        className="border border-border bg-surface w-20 shrink-0 rounded-2xl py-2 px-3 text-right"
                        value={ingredient.packSize}
                        onChange={(e) =>
                            setIngredient((prev) => ({
                                ...prev,
                                packSize: e.target.value,
                            }))
                        }
                    />
                    <select
                        aria-label="Unit"
                        value={ingredient.ingredientUnit}
                        className="border border-border bg-surface shrink-0 rounded-2xl py-2 px-3"
                        onChange={(e) =>
                            setIngredient((prev) => ({
                                ...prev,
                                ingredientUnit: e.target.value as IngredientUnit,
                            }))
                        }
                    >
                        {unitOptions.map((unit) => (
                            <option key={unit} value={unit}>
                                {unitLabel[unit] || "items"}
                            </option>
                        ))}
                    </select>
                </div>
                {errors.price && <div className="text-danger text-sm">{errors.price}</div>}
                {errors.packSize && <div className="text-danger text-sm">{errors.packSize}</div>}
                {lockedKind && (
                    <div className="text-sm">
                        Used in recipes, so only{" "}
                        {lockedKind === "count" ? "items are" : `${lockedKind} units are`} available
                    </div>
                )}
            </div>
            <div className="mb-4 text-sm min-h-5">
                {Number(ingredient.price) > 0 && Number(ingredient.packSize) > 0 && (
                    <>
                        That's{" "}
                        <span className="font-semibold text-header">
                            {formatUnitPrice(pricePer(ingredient, ingredient.ingredientUnit))}
                        </span>{" "}
                        per {unitLabel[ingredient.ingredientUnit] || ingredient.ingredientUnit}
                    </>
                )}
            </div>
            <div className="flex justify-end gap-2">
                <button
                    type="button"
                    hidden={!isEditing}
                    disabled={isEditing && isUsedInRecipe}
                    onClick={() => {
                        setDeleteError("");
                        setConfirmingDelete(true);
                    }}
                    className="border-2 flex min-w-40 min-h-8 items-center justify-center border-border text-header rounded-2xl py-1 px-3 bg-danger hover:bg-primary-dark disabled:bg-surface disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-gray-50"
                >
                    Delete Ingredient
                </button>
                <button
                    type="button"
                    disabled={submitting}
                    className="border-2 flex min-w-40 min-h-8 items-center justify-center border-primary text-header rounded-2xl py-1 px-3 bg-surface hover:bg-primary-dark"
                    onClick={() => handleSubmit()}
                >
                    {submitting ? <LoadingSpinner className="w-4 h-4" /> : buttonLabel}
                </button>
            </div>

            <ConfirmDialog
                open={confirmingDelete}
                title={`Delete ${ingredient.name}?`}
                confirmLabel="Delete ingredient"
                busy={deleting}
                onConfirm={deleteIngredient}
                onCancel={() => setConfirmingDelete(false)}
            >
                This can't be undone.
                {deleteError && <p className="mt-2 text-sm text-danger">{deleteError}</p>}
            </ConfirmDialog>
        </>
    );
}

export default IngredientDetails;
