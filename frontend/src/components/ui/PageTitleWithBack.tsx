import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

function PageTitleWithBack({ title, backPath }: { title: string; backPath: string }) {
    return (
        <div className="flex mb-4 gap-3 items-center">
            <Link to={backPath}>
                <ArrowLeft className="h-8 w-8" />
            </Link>

            <div className="text-4xl font-semibold">{title}</div>
        </div>
    );
}

export default PageTitleWithBack;
