import { Link } from "react-router-dom";
import { navItems } from "./NavItems";

function TopNav({ className = "" }: { className?: string }) {
    return (
        <nav className={`h-20 bg-primary flex ${className}`}>
            {navItems.map((n) => {
                const Icon = n.icon;
                return (
                    <Link
                        key={n.to}
                        to={n.to}
                        className="flex flex-1 flex-col justify-center items-center gap-1 text-header hover:bg-primary-dark"
                    >
                        <Icon className="h-5 w-5" />
                        <span className="text-xs">{n.label}</span>
                    </Link>
                );
            })}{" "}
        </nav>
    );
}

export default TopNav;
