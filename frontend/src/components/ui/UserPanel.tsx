import { LogOut, Store } from "lucide-react";
import { useAuth } from "../../auth/AuthContext";

function UserPanel({ showLogout, className }: { showLogout: boolean; className?: string }) {
    const { logout, user } = useAuth();

    return (
        <div
            className={`flex items-center justify-between px-2 py-3 border border-nav-border rounded-lg ${showLogout ? "bg-background" : "bg-surface"} ${className}`}
        >
            <div className="flex">
                <div className="bg-nav px-1 py-2 ml-1 mr-2 rounded-lg">
                    <Store className="text-primary-dark" />
                </div>
                <div className="min-w-0">
                    <div className="text-sm font-extrabold truncate">{user?.bakeryName}</div>
                    <div className="text-xs font-semibold truncate">{user?.email}</div>
                </div>
            </div>
            <button
                hidden={!showLogout}
                className="cursor-pointer"
                type="button"
                aria-label="Log out"
                onClick={logout}
            >
                <LogOut />
            </button>
        </div>
    );
}
export default UserPanel;
