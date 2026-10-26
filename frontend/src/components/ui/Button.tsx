import type { ButtonHTMLAttributes } from "react";

const variantStyle = {
    primary: "bg-primary text-header hover:bg-primary-dark",
    secondary: "bg-secondary text-header hover:bg-secondary-dark",
    danger: "bg-danger text-white hover:bg-danger/85",
    outline: "border border-border bg-surface text-header hover:bg-background",
};

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: keyof typeof variantStyle;
    icon?: boolean;
};

function Button({
    variant = "primary",
    icon = false,
    type = "button",
    className = "",
    ...props
}: ButtonProps) {
    const shape = icon ? "rounded-full p-2" : "min-w-40 rounded-2xl px-4 py-2 font-semibold";
    return (
        <button
            type={type}
            className={`flex items-center justify-center transition disabled:cursor-not-allowed disabled:opacity-50 ${shape} ${variantStyle[variant]} ${className}`}
            {...props}
        />
    );
}

export default Button;
