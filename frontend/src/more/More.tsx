import { NavLink } from "react-router-dom";
import { moreItems } from "../components/nav/NavItems";
import UserPanel from "../components/ui/UserPanel";
import { ChevronRight, LogOut } from "lucide-react";
import { useAuth } from "../auth/AuthContext";

function More() {
    const { logout } = useAuth();

    const navClass =
        "flex items-center gap-5 px-5 py-3 my-1 rounded-2xl active:bg-primary/10 cursor-pointer";

    return (
        <div className="flex flex-col w-full">
            <UserPanel showLogout={false} className="mb-3" />
            {moreItems.map((n) => {
                const Icon = n.icon;
                return (
                    <div key={n.to}>
                        <NavLink to={n.to} className={navClass}>
                            <Icon className="h-6 w-6"></Icon>
                            <div>{n.label}</div>

                            <ChevronRight className="h-6 w-6 ml-auto" />
                        </NavLink>
                        <hr className="border-nav-border" />
                    </div>
                );
            })}
            <button type="button" className={`text-danger ${navClass}`} onClick={logout}>
                <LogOut className="h-6 w-6" /> Log out
            </button>
        </div>
    );
}

export default More;
