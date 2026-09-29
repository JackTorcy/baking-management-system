import { Link } from "react-router-dom";
import { navItems } from "./NavItems";

function TopNav({ className = "" }: { className?: string }) {
    return (
        <nav className={`top-0 ${className}`}>
            {navItems.map((n) => {
                const Icon = n.icon;
                return (
                    <Link
                        key={n.to}
                        to={n.to}
                        className="flex flex-1 flex-col justify-center items-center gap-1 text-header hover:bg-primary-dark"
                    >
                        <Icon className="h-8 w-8" />
                        <span className="text-s">{n.label}</span>
                    </Link>
                );
            })}{" "}
        </nav>
    );
}

export default TopNav;
