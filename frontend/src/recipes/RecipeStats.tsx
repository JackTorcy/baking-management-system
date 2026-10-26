import Card from "../components/ui/Card";
import { formatGBP } from "../types/Recipe";

interface RecipeStatsProps {
    price: string;
    cost: number;
    scale: number;
    editMode: boolean;
    error?: string;
    onPriceChange: (price: string) => void;
}

const statValue = "flex h-11 items-center text-2xl font-semibold tabular-nums";

function RecipeStats({ price, cost, scale, editMode, error, onPriceChange }: RecipeStatsProps) {
    const priceValue = Number(price);
    const margin = priceValue - cost;

    return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <Card>
                <label htmlFor="price" className="text-sm">
                    Price
                </label>
                {editMode ? (
                    <div className="relative h-11">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2">£</span>
                        <input
                            id="price"
                            type="text"
                            inputMode="decimal"
                            className="h-full w-full rounded-lg border border-border bg-background pl-7 pr-3 text-xl font-semibold tabular-nums text-header"
                            value={price}
                            onChange={(e) => onPriceChange(e.target.value)}
                        />
                    </div>
                ) : (
                    <div className={`${statValue} text-header`}>{formatGBP(priceValue)}</div>
                )}
                {error && <span className="text-danger text-sm">{error}</span>}
            </Card>
            <Card>
                <div className="text-sm">Cost</div>
                <div className={`${statValue} text-header`}>{formatGBP(cost)}</div>
                {scale !== 1 && (
                    <div className="text-sm">{formatGBP(cost * scale)} at this size</div>
                )}
            </Card>
            <Card>
                <div className="text-sm">Margin</div>
                <div className={`${statValue} ${margin < 0 ? "text-danger" : "text-header"}`}>
                    {priceValue > 0 ? (
                        <>
                            {formatGBP(margin)}
                            <span className="ml-2 text-base font-normal text-body">
                                {Math.round((margin / priceValue) * 100)}%
                            </span>
                        </>
                    ) : (
                        "—"
                    )}
                </div>
            </Card>
        </div>
    );
}

export default RecipeStats;
