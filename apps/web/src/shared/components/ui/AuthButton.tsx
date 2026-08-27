import type { ReactNode } from "react";

export function AuthButton({ children, onClick, disabled }: { children: ReactNode; onClick?: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex w-full items-center justify-center gap-2 rounded-full gradient-primary py-4 text-[15px] font-semibold text-primary-foreground shadow-float transition active:scale-[0.99] disabled:opacity-50 disabled:active:scale-100"
    >
      {children}
    </button>
  );
}
