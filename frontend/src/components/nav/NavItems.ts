import { BookOpen, Carrot, ReceiptText, Calendar1, Settings } from "lucide-react";

//Not sure about icons:
//Possible for Recipes include CookingPot, BookBookmark, BookText, ChefHat
//Possible for Ingredients include ShoppingBasket, ShoppingBag, ShoppingCart, ChefHat, Carrot

export const navItems = [
    { to: "/ingredients", label: "Ingredients", icon: Carrot },
    { to: "/recipes", label: "Recipes", icon: BookOpen },
    { to: "/orders", label: "Orders", icon: ReceiptText },
    { to: "/bakeplan", label: "Bake plan", icon: Calendar1 },
    { to: "/settings", label: "Settings", icon: Settings },
];
