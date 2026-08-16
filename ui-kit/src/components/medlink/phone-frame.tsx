import { useRef, useState, type ReactNode } from "react";
import { toPng } from "html-to-image";
import { Check, Download, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function PhoneFrame({ children, label, className }: { children: ReactNode; label?: string; className?: string }) {
  const frameRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<"idle" | "saving" | "done">("idle");

  const slugify = () =>
    (label || "medlink").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "screenshot";

  const download = async () => {
    const frame = frameRef.current;
    const scroll = scrollRef.current;
    if (!frame || !scroll || state === "saving") return;
    setState("saving");

    // Capture only the visible viewport of the phone (true mockup framing).
    // Ensure layout/fonts have settled before rendering the image.
    await new Promise((r) => requestAnimationFrame(() => r(null)));
    if ((document as any).fonts?.ready) await (document as any).fonts.ready;
    await new Promise((r) => setTimeout(r, 100));

    // Temporarily disable backdrop-filter and related filters inside the
    // frame to avoid html-to-image producing blurred artifacts.
    const styleId = "ml-export-overrides";
    const overrideCss = `
      [data-ml-export="true"] * {
        backdrop-filter: none !important;
        -webkit-backdrop-filter: none !important;
        filter: none !important;
      }
      [data-ml-export="true"] .glass, [data-ml-export="true"] .glass-dark {
        backdrop-filter: none !important;
        -webkit-backdrop-filter: none !important;
      }
    `;
    const styleEl = document.createElement("style");
    styleEl.id = styleId;
    styleEl.innerHTML = overrideCss;
    document.head.appendChild(styleEl);
    frame.setAttribute("data-ml-export", "true");

    try {
      const targetWidth = 1440; // S26 Ultra native width
      // Use an integer scale to avoid fractional resampling that can cause
      // an overall blurry output. Ensure at least a scale of 1.
      const scale = Math.max(1, Math.round(targetWidth / frame.offsetWidth));

      const dataUrl = await toPng(frame, {
        cacheBust: true,
        pixelRatio: scale,
        backgroundColor: "transparent",
        width: frame.offsetWidth,
        height: frame.offsetHeight,
        style: {
          transform: "none",
          width: `${frame.offsetWidth}px`,
          height: `${frame.offsetHeight}px`,
        },
        filter: (node) => {
          if (!(node instanceof HTMLElement)) return true;
          return node.dataset.exportHide !== "true";
        },
      });

      const a = document.createElement("a");
      a.download = `${slugify()}-s26ultra-${Date.now()}.png`;
      a.href = dataUrl;
      a.click();
      setState("done");
      setTimeout(() => setState("idle"), 1500);
    } catch (e) {
      console.error(e);
      setState("idle");
    } finally {
      // cleanup
      try {
        frame.removeAttribute("data-ml-export");
      } catch {}
      const existing = document.getElementById(styleId);
      if (existing && existing.parentNode) existing.parentNode.removeChild(existing);
    }
  };

  return (
    <div className={cn("mx-auto flex w-full max-w-[420px] flex-col px-4", className)}>
      {label && <div className="mb-3 text-center text-xs font-medium uppercase tracking-widest text-muted-foreground">{label}</div>}
      <div className="relative">
        <div ref={frameRef} className="relative mx-auto w-full max-w-[380px] px-[6px] py-[6px]">
          <div className="relative rounded-[46px] bg-[#0a0a0a] p-[3px] shadow-[0_30px_80px_-30px_rgba(0,0,0,0.5)]">
            <div className="rounded-[44px] bg-[#1a1a1a] p-[8px]">
              <div className="relative overflow-hidden rounded-[36px] bg-white">
                <div className="pointer-events-none absolute left-1/2 top-2 z-50 size-[11px] -translate-x-1/2 rounded-full bg-[#0a0a0a] ring-[1.5px] ring-[#2a2a2a]" />
                <div className="absolute inset-x-0 top-0 z-40 flex h-8 items-center justify-between px-6 pt-2 text-[11px] font-semibold text-foreground">
                  <span>9:41</span>
                  <span className="flex items-center gap-1.5">
                    <svg width="14" height="9" viewBox="0 0 16 10" fill="none"><path d="M1 9h1.5V6H1v3zm3-6h1.5V9H4V3zm3-3h1.5v9H7V0zm3 6h1.5V9H10V6z" fill="currentColor"/></svg>
                    <svg width="13" height="9" viewBox="0 0 15 11" fill="none"><path d="M7.5 2.6C9.6 2.6 11.5 3.4 13 4.7l1.5-1.5C12.6 1.6 10.1.7 7.5.7S2.4 1.6.5 3.2L2 4.7C3.5 3.4 5.4 2.6 7.5 2.6zM7.5 5.4c1.2 0 2.3.4 3.2 1.1l1.5-1.5C10.9 4 9.3 3.4 7.5 3.4S4.1 4 2.8 5l1.5 1.5c.9-.7 2-1.1 3.2-1.1zM7.5 8.2c.7 0 1.3.2 1.8.6l-1.8 2.2-1.8-2.2c.5-.4 1.1-.6 1.8-.6z" fill="currentColor"/></svg>
                    <span className="ml-0.5 flex h-[10px] w-[22px] items-center rounded-[2px] border border-foreground px-[1px]"><span className="h-[6px] w-full rounded-[1px] bg-foreground" /></span>
                  </span>
                </div>
                <div ref={scrollRef} className="relative h-[820px] overflow-y-auto no-scrollbar bg-background pt-8">
                  {children}
                </div>
              </div>
            </div>
          </div>
          <div className="pointer-events-none absolute right-[-3px] top-[150px] h-[70px] w-[3px] rounded-r-md bg-[#0a0a0a]" />
          <div className="pointer-events-none absolute right-[-3px] top-[240px] h-[46px] w-[3px] rounded-r-md bg-[#0a0a0a]" />
        </div>

        <div data-export-hide="true" className="absolute -right-3 top-4 z-50 md:-right-16 md:top-6">
          <button
            type="button"
            onClick={download}
            aria-label="Download PNG in Samsung S26 Ultra frame"
            title="Download PNG"
            className={cn(
              "flex items-center gap-2 rounded-full gradient-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground shadow-float transition hover:shadow-dialog active:scale-95 md:flex-col md:gap-1 md:px-3 md:py-3",
              state === "saving" && "opacity-80"
            )}
          >
            {state === "saving" ? (
              <Loader2 className="size-4 animate-spin" />
            ) : state === "done" ? (
              <Check className="size-4" />
            ) : (
              <Download className="size-4" />
            )}
            <span className="hidden md:inline text-[10px] uppercase tracking-wider">
              {state === "saving" ? "Saving" : state === "done" ? "Saved" : "PNG"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

