import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "success";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: ButtonVariant;
};

export function Button({
  children,
  variant = "secondary",
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      type="button"
      className={`ui-button ui-button-${variant} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function GhostButton({
  children,
  className = "",
  tone,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  tone?: "primary" | "success" | "danger";
}) {
  const variant = tone === "success" ? "success" : tone === "danger" ? "danger" : "secondary";

  return (
    <Button
      variant={variant}
      className={`ui-button-ghost ${className}`}
      {...props}
    >
      {children}
    </Button>
  );
}

