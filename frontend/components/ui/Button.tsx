import type { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md";
};

export function Button({
  className = "",
  variant = "primary",
  size = "md",
  ...props
}: ButtonProps) {
  const variants = {
    primary:
      "border-transparent bg-[var(--primary)] text-white shadow-[0_8px_24px_color-mix(in_srgb,var(--primary)_25%,transparent)] hover:bg-[var(--primary-hover)]",
    secondary:
      "border-[var(--border-strong)] bg-[var(--surface-strong)] text-[var(--text)] hover:border-[var(--primary)]",
    ghost:
      "border-transparent bg-transparent text-[var(--text-muted)] hover:bg-[var(--surface-muted)] hover:text-[var(--text)]",
    danger: "border-transparent bg-[var(--danger)] text-white hover:brightness-110",
  };
  return (
    <button
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border font-semibold transition-[transform,background-color,border-color,color,box-shadow] duration-200 active:translate-y-px disabled:opacity-45 ${size === "sm" ? "px-3 text-sm" : "px-4 text-sm"} ${variants[variant]} ${className}`}
      {...props}
    />
  );
}
