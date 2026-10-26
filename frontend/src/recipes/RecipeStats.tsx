import Card from "../components/ui/Card";
import { formatGBP } from "../types/Recipe";

interface RecipeStatsProps {
    sellingPrice: string;
    cost: number;
    scale: number;
    editMode: boolean;
    error?: string;
    onSellingPriceChange: (sellingPrice: string) => void;
}

const statValue = "flex h-11 items-center text-2xl font-semibold tabular-nums";

function RecipeStats({
    sellingPrice,
    cost,
    scale,
    editMode,
    error,
    onSellingPriceChange,
}: RecipeStatsProps) {
    const isSold = sellingPrice.trim() !== "";
    const priceValue = Number(sellingPrice);
    const margin = priceValue - cost;

    return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <Card>
                <label htmlFor="sellingPrice" className="text-sm">
                    Selling price
                </label>
                {editMode ? (
                    <div className="relative h-11">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2">£</span>
                        <input
                            id="sellingPrice"
                            type="text"
                            inputMode="decimal"
                            placeholder="Not sold separately"
                            className="h-full w-full rounded-lg border border-border bg-background pl-7 pr-3 text-xl font-semibold tabular-nums text-header placeholder:text-base placeholder:font-normal"
                            value={sellingPrice}
                            onChange={(e) => onSellingPriceChange(e.target.value)}
                        />
                    </div>
                ) : isSold ? (
                    <div className={`${statValue} text-header`}>{formatGBP(priceValue)}</div>
                ) : (
                    <div className={`${statValue} text-base font-normal`}>Not sold</div>
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
                <div
                    className={`${statValue} ${isSold && margin < 0 ? "text-danger" : "text-header"}`}
                >
                    {isSold && priceValue > 0 ? (
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
