import { NavLink } from "react-router-dom";
import { navItems } from "./NavItems";
import { ChefHat, LogOut, Store } from "lucide-react";
import { useAuth } from "../../auth/AuthContext";

function LeftNav({ className = "" }: { className?: string }) {
    const { user, setUser } = useAuth();

    const logout = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/logout`, {
                method: "POST",
            });

            if (res.ok) {
                setUser(null);
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <nav className={`flex px-3 py-5 flex-col justify-between ${className}`}>
            <div>
                <div className="px-3 flex items-center mb-10">
                    <ChefHat className="h-8 w-8 mr-2 text-primary" />
                    <div className="font-bold text-header text-xl">Baking Management</div>
                </div>
                {navItems.map((n) => {
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
            <div className="bg-background flex items-center justify-between px-2 py-3 border border-nav-border rounded-lg">
                <div className="bg-nav px-1 py-2 mr-1 rounded-lg">
                    <Store className="text-primary-dark" />
                </div>
                <div className="min-w-0">
                    <div className="text-sm font-extrabold truncate">{user?.bakeryName}</div>
                    <div className="text-xs font-semibold truncate">{user?.email}</div>
                </div>
                <button type="button" aria-label="Log out" onClick={logout}>
                    <LogOut className="" />
                </button>
            </div>
        </nav>
    );
}

export default LeftNav;
