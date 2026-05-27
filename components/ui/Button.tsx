import React from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "gold";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  asChild?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-cf-red text-white hover:bg-cf-red-light border border-cf-red hover:border-cf-red-light",
  secondary:
    "bg-cf-surface text-cf-cream border border-cf-border hover:bg-cf-border",
  ghost:
    "bg-transparent text-cf-cream hover:bg-cf-surface border border-transparent",
  danger:
    "bg-red-700 text-white hover:bg-red-600 border border-red-700",
  gold:
    "bg-cf-gold text-cf-dark hover:bg-cf-gold-light border border-cf-gold font-semibold",
};

const sizeClasses: Record<Size, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-3 text-base",
};

const Spinner = () => (
  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
  </svg>
);

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  asChild = false,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  const classes = cn(
    "inline-flex items-center justify-center gap-2 rounded font-medium transition-colors duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-cf-red",
    variantClasses[variant],
    sizeClasses[size],
    className
  );

  // asChild: clone the single child element and apply button styles to it
  // (avoids invalid <button><a> nesting when wrapping Next.js Links)
  if (asChild && React.isValidElement(children)) {
    const child = children as React.ReactElement<React.HTMLAttributes<HTMLElement>>;
    return React.cloneElement(child, {
      ...props,
      className: cn(classes, child.props.className),
    });
  }

  return (
    <button
      disabled={disabled || loading}
      className={classes}
      {...props}
    >
      {loading && <Spinner />}
      {children}
    </button>
  );
}
