import { matchPath, NavLink, useLocation } from "react-router-dom";
import { moreItems, tabItems } from "./NavItems";

function BottomNav({ className = "" }: { className?: string }) {
    const { pathname } = useLocation();
    const inMoreSection = moreItems.some((n) => matchPath({ path: n.to, end: false }, pathname));

    return (
        <nav className={className}>
            {tabItems.map((n) => {
                const Icon = n.icon;
                const active =
                    !!matchPath({ path: n.to, end: false }, pathname) ||
                    (n.to === "/more" && inMoreSection);
                return (
                    <NavLink
                        key={n.to}
                        to={n.to}
                        className={`flex flex-col flex-1 text-xs justify-center gap-1 items-center ${active ? "font-semibold text-header" : "font-medium text-body"}`}
                    >
                        <span
                            className={`rounded-full px-5 py-1 transition-colors ${active ? "bg-primary/15 text-primary-dark" : ""}`}
                        >
                            <Icon className="h-6 w-6" />
                        </span>
                        {n.label}
                    </NavLink>
                );
            })}
        </nav>
    );
}

export default BottomNav;
