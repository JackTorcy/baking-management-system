import { NavLink } from "react-router-dom";
import { navItems } from "./NavItems";

function BottomNav({ className = "" }: { className?: string }) {
    return (
        <nav className={`bottom-0 ${className}`}>
            {navItems.map((n) => {
                const Icon = n.icon;
                return (
                    <NavLink
                        key={n.to}
                        to={n.to}
                        className={({ isActive }) =>
                            `flex flex-1 justify-center items-center text-header ${isActive ? "bg-primary-dark" : ""}`
                        }
                    >
                        <Icon className="h-8 w-8" />
                    </NavLink>
                );
            })}{" "}
        </nav>
    );
}

export default BottomNav;
