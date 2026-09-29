import { Link } from "react-router-dom";
import { navItems } from "./NavItems";

function BottomNav({ className = "" }: { className?: string }) {
    return (
        <nav className={`bottom-0 ${className}`}>
            {navItems.map((n) => {
                const Icon = n.icon;
                return (
                    <Link
                        key={n.to}
                        to={n.to}
                        className="flex flex-1 justify-center items-center text-header hover:bg-primary-dark"
                    >
                        <Icon className="h-8 w-8" />
                    </Link>
                );
            })}{" "}
        </nav>
    );
}

export default BottomNav;
