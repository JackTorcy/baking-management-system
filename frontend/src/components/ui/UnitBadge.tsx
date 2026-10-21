import { Droplet, Hash, Weight, type LucideIcon } from "lucide-react";
import { unitKind, type IngredientUnit, type UnitKind } from "../../types/Ingredient";

const kindStyle: Record<UnitKind, { icon: LucideIcon; className: string }> = {
    weight: { icon: Weight, className: "bg-unit-weight/15 text-unit-weight" },
    volume: { icon: Droplet, className: "bg-unit-volume/15 text-unit-volume" },
    count: { icon: Hash, className: "bg-unit-count/15 text-unit-count" },
};

function UnitBadge({ unit }: { unit: IngredientUnit }) {
    const { icon: Icon, className } = kindStyle[unitKind[unit]];
    return (
        <span className={`flex justify-center items-center p-3 rounded-lg ${className}`}>
            <Icon className="h-7 w-7" />
        </span>
    );
}

export default UnitBadge;
