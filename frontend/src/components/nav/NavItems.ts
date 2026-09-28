import { BookBookmark, Carrot } from "lucide-react";

//Not sure about icons:
//Possible for Recipes include CookingPot, BookBookmark, BookText, ChefHat
//Possible for Ingredients include ShoppingBasket, ShoppingBag, ShoppingCart, ChefHat, Carrot

export const navItems = [
    { to: "/ingredients", label: "Ingredients", icon: Carrot },
    { to: "/recipe", label: "Recipes", icon: BookBookmark },
];
