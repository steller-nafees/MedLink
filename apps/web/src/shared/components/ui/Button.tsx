import type { ReactNode } from "react";

export function GhostButton({
  children,
  onClick,
  tone = "neutral",
}: {
  children: ReactNode;
  onClick?: () => void;
  tone?: "neutral" | "success" | "danger";
}) {
  const toneCls =
    tone === "success"
      ? "border-success/30 text-success hover:bg-success/10"
      : tone === "danger"
        ? "border-destructive/30 text-destructive hover:bg-destructive/10"
        : "border-border text-foreground/75 hover:bg-surface-variant";
  return (
    <button
      onClick={onClick}
      className={`rounded-full border px-3 py-1.5 text-[11.5px] font-semibold transition ${toneCls}`}
    >
      {children}
    </button>
  );
}

export function Button({
  children,
  onClick,
  variant = "primary",
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "danger";
}) {
  const variantCls =
    variant === "primary"
      ? "bg-primary text-primary-foreground shadow-card hover:opacity-90"
      : "border border-destructive/30 text-destructive hover:bg-destructive/10";
      
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-4 py-2 text-[12.5px] font-semibold transition ${variantCls}`}
    >
      {children}
    </button>
  );
}
