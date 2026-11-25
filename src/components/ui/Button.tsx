import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost";

const variants: Record<Variant, string> = {
  primary: "bg-teal text-white hover:bg-teal-dark disabled:bg-teal/40",
  secondary:
    "border border-line bg-white text-foreground hover:bg-background disabled:opacity-60",
  ghost: "text-muted hover:bg-background hover:text-foreground",
};

export function buttonClass(variant: Variant = "primary", className = ""): string {
  return [
    "inline-flex items-center justify-center gap-2 rounded-[10px] px-5 py-3 text-sm font-semibold transition-colors",
    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal",
    "disabled:cursor-not-allowed",
    variants[variant],
    className,
  ]
    .filter(Boolean)
    .join(" ");
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

export function Button({
  variant = "primary",
  className = "",
  type = "button",
  ...props
}: ButtonProps) {
  return <button type={type} className={buttonClass(variant, className)} {...props} />;
}
