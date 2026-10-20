import { TriangleAlert } from "lucide-react";

function Placeholder({ page }: { page: string }) {
    return (
        <div className="h-full flex flex-col gap-10 items-center justify-center">
            <TriangleAlert className="h-40 w-40 text-danger" />
            <div className="text-4xl text-center">
                {page} under construction... Please return when it's complete!
            </div>
        </div>
    );
}

export default Placeholder;
