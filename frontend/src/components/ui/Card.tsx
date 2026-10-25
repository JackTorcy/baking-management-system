import type { ReactNode } from "react";

function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
    return (
        <div className={`rounded-2xl border border-border/40 bg-surface p-4 ${className}`}>
            {children}
        </div>
    );
}

export default Card;
