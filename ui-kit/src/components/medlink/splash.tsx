import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { AuthScreen } from "@/components/medlink/auth/auth-kit";
import medlinkFullLogo from "@/assets/medlink_full.png";

const DURATION_MS = 1800;

export function MedlinkSplash({ next }: { next: string }) {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const pct = Math.min(100, ((now - start) / DURATION_MS) * 100);
      setProgress(pct);
      if (pct < 100) {
        raf = requestAnimationFrame(tick);
      } else {
        navigate({ to: next });
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [navigate, next]);

  return (
    <AuthScreen label="Splash">
      <div className="relative flex min-h-full flex-col items-center justify-center gradient-hero px-8 text-center">
        <span className="pointer-events-none absolute left-1/2 top-1/2 size-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-3xl" />

        <div className="relative flex flex-1 flex-col items-center justify-center">
          <img
            src={medlinkFullLogo}
            alt="MedLink logo"
            className="h-56 w-56 object-contain"
            draggable={false}
          />
        </div>

        <div className="relative w-full max-w-[240px] pb-10">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-border">
            <span
              className="block h-full rounded-full bg-primary transition-[width] duration-100 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.32em] text-muted-foreground">
            SyntheticMinds
          </p>
        </div>
      </div>
    </AuthScreen>
  );
}
