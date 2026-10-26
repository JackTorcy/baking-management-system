import { TriangleAlert } from "lucide-react";

function ErrorList({ errors }: { errors: string[] }) {
    if (errors.length === 0) return null;

    return (
        <div role="alert" className="flex items-start text-sm text-danger font-bold">
            <TriangleAlert className="w-5 h-5 mr-2 shrink-0" />
            <ul>
                {errors.map((e) => (
                    <li key={e}>{e}</li>
                ))}
            </ul>
        </div>
    );
}

export default ErrorList;
