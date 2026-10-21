import {
    BookOpen,
    ShoppingBasket,
    ReceiptText,
    Calendar1,
    Settings,
    CircleUserRound,
    CookingPot,
    CircleEllipsis,
    type LucideIcon,
} from "lucide-react";

type NavItem = {
    to: string;
    label: string;
    icon: LucideIcon;
    desktop: boolean;
    mobile: "tab" | "more";
};

export const navItems: NavItem[] = [
    {
        to: "/ingredients",
        label: "Ingredients",
        icon: ShoppingBasket,
        desktop: true,
        mobile: "tab",
    },
    { to: "/recipes", label: "Recipes", icon: BookOpen, desktop: true, mobile: "tab" },
    { to: "/orders", label: "Orders", icon: ReceiptText, desktop: true, mobile: "tab" },
    { to: "/sessions", label: "Sessions", icon: CookingPot, desktop: true, mobile: "tab" },

    { to: "/bakeplan", label: "Bake plan", icon: Calendar1, desktop: true, mobile: "more" },
    { to: "/settings", label: "Settings", icon: Settings, desktop: true, mobile: "more" },
    { to: "/account", label: "Account", icon: CircleUserRound, desktop: false, mobile: "more" },
    { to: "/more", label: "More", icon: CircleEllipsis, desktop: false, mobile: "tab" },
];

export const desktopItems = navItems.filter((n) => n.desktop);
export const tabItems = navItems.filter((n) => n.mobile === "tab");
export const moreItems = navItems.filter((n) => n.mobile === "more");
