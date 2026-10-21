import { NavLink } from "react-router-dom";
import { desktopItems } from "./NavItems";
import { ChefHat } from "lucide-react";
import UserPanel from "../ui/UserPanel";

function LeftNav({ className = "" }: { className?: string }) {
    return (
        <nav className={`flex px-3 py-5 flex-col justify-between ${className}`}>
            <div>
                <div className="px-3 flex items-center mb-6 border-b-4 pb-5 border-primary">
                    <ChefHat className="h-8 w-8 mr-2 text-primary" />
                    <div className="font-bold text-header text-xl">Baking Management</div>
                </div>
                {desktopItems.map((n) => {
                    const Icon = n.icon;
                    return (
                        <NavLink
                            key={n.to}
                            to={n.to}
                            className={({ isActive }) =>
                                `flex items-center px-3 py-2 gap-1 my-1 rounded-lg text-header ${isActive ? "bg-background shadow-[inset_3px_0_0_var(--color-primary)] text-primary font-bold" : ""}`
                            }
                        >
                            <Icon className="h-5 w-5 mr-2" />
                            <span className="text-header">{n.label}</span>
                        </NavLink>
                    );
                })}
            </div>
            <UserPanel showLogout={true} />
        </nav>
    );
}

export default LeftNav;
