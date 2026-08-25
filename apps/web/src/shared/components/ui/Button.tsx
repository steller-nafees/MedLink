import type { ButtonHTMLAttributes, ReactNode } from "react";

export function Button({ children, variant = "secondary", className = "", ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode; variant?: "primary" | "secondary" }) {
	return <button type="button" className={`ui-button ui-button-${variant} ${className}`} {...props}>{children}</button>;
}
