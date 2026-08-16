import { cn } from "@/lib/utils";
import { ChevronRight, Globe } from "lucide-react";
import { accountTypes, type AccountRole } from "@/lib/medlink/auth-roles";

export function AccountTypeCards({
  onSelect,
  selected,
  showWebOnlyBadge,
  className,
}: {
  onSelect: (role: AccountRole) => void;
  selected?: AccountRole;
  showWebOnlyBadge?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("space-y-3", className)}>
      {accountTypes.map((t) => (
        <button
          key={t.id}
          type="button"
          onClick={() => onSelect(t.id)}
          className={cn(
            "flex w-full items-start gap-4 rounded-[26px] border bg-surface p-5 text-left shadow-card transition active:scale-[0.99]",
            selected === t.id ? "border-primary ring-4 ring-primary/12" : "border-border/70 hover:border-primary/40"
          )}
        >
          <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-surface-variant text-[22px]">{t.emoji}</span>
          <span className="min-w-0 flex-1">
            <span className="flex flex-wrap items-center gap-2">
              <span className="text-[15.5px] font-bold text-foreground">{t.label}</span>
              {showWebOnlyBadge && t.webOnly && (
                <span className="inline-flex items-center gap-1 rounded-full bg-info/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-info">
                  <Globe className="size-3" /> Web only
                </span>
              )}
            </span>
            <span className="mt-1.5 block text-[12.5px] leading-relaxed text-muted-foreground">{t.summary}</span>
          </span>
          <ChevronRight className="mt-1 size-5 shrink-0 text-muted-foreground" />
        </button>
      ))}
    </div>
  );
}
