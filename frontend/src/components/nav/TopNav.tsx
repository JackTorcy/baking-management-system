import { NavLink } from "react-router-dom";
import { navItems } from "./NavItems";

function TopNav({ className = "" }: { className?: string }) {
    return (
        <nav className={`top-0 ${className}`}>
            {navItems.map((n) => {
                const Icon = n.icon;
                return (
                    <NavLink
                        key={n.to}
                        to={n.to}
                        className={({ isActive }) =>
                            `flex flex-1 flex-col justify-center items-center gap-1 text-header ${isActive ? "bg-primary-dark" : ""}`
                        }
                    >
                        <Icon className="h-8 w-8" />
                        <span className="text-s">{n.label}</span>
                    </NavLink>
                );
            })}{" "}
        </nav>
    );
}

export default TopNav;
