import { useMemo, useState } from "react";
import { ArrowDown, ArrowLeft, ArrowRight, Hand, Siren } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SOSTutorialProps {
  onNext: () => void;
  onBack: () => void;
}

const STEPS = [
  "Hold the SOS ball for 300ms until guides appear.",
  "Swipe inward (toward screen center) or up/down.",
  "Cancel during 3-2-1 countdown by tapping anywhere.",
];

export function SOSTutorial({ onNext, onBack }: SOSTutorialProps) {
  const [active, setActive] = useState(false);

  const side = useMemo(() => (Math.random() > 0.5 ? "right" : "left"), []);

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col px-4 pt-14 pb-8">
      <h3 className="text-2xl font-bold">SOS gesture tutorial</h3>
      <p className="mt-2 text-sm text-muted-foreground">
        Practice once now, so you can trigger help instantly when needed.
      </p>

      <div className="mt-6 glass-1 rounded-3xl p-6">
        <div className="relative mx-auto h-56 rounded-2xl border border-border/60 bg-muted/20">
          <button
            className={`absolute top-1/2 -translate-y-1/2 h-14 w-14 rounded-full border border-border bg-white/70 shadow-lg backdrop-blur ${
              side === "right" ? "right-3" : "left-3"
            } ${active ? "scale-110" : ""}`}
            onMouseDown={() => setActive(true)}
            onMouseUp={() => setActive(false)}
            onTouchStart={() => setActive(true)}
            onTouchEnd={() => setActive(false)}
            aria-label="SOS tutorial ball"
          >
            <Siren className="mx-auto h-6 w-6 text-primary" />
          </button>

          {active && (
            <>
              {side === "right" ? (
                <ArrowLeft className="absolute left-1/2 top-1/2 h-6 w-6 -translate-y-1/2 text-primary animate-bounce-left" />
              ) : (
                <ArrowRight className="absolute left-1/2 top-1/2 h-6 w-6 -translate-y-1/2 text-primary animate-bounce-right" />
              )}
              <ArrowDown className="absolute left-1/2 bottom-8 h-6 w-6 -translate-x-1/2 text-primary animate-bounce-down" />
            </>
          )}
        </div>

        <div className="mt-4 space-y-2">
          {STEPS.map((item) => (
            <div key={item} className="flex items-start gap-2 text-xs text-muted-foreground">
              <Hand className="mt-0.5 h-3.5 w-3.5 text-primary" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-auto grid grid-cols-2 gap-2">
        <Button variant="outline" className="h-12 rounded-xl" onClick={onBack}>
          Back
        </Button>
        <Button className="h-12 rounded-xl" onClick={onNext}>
          Continue
        </Button>
      </div>
    </div>
  );
}
