import { useMemo, useState } from "react";
import { ArrowRight, ShieldAlert, Siren, Route } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";

interface FeatureSlidesProps {
  onNext: () => void;
  onSkip: () => void;
}

const SLIDES = [
  {
    title: "Safety score updates live",
    description:
      "Your score reacts to location, time, alerts, and nearby support services.",
    icon: ShieldAlert,
  },
  {
    title: "SOS ball is always available",
    description:
      "Long press the floating SOS ball, then swipe inward/up/down to start emergency countdown.",
    icon: Siren,
  },
  {
    title: "Map picks safer routes",
    description:
      "Route lines are scored by risk zones and response accessibility, not just distance.",
    icon: Route,
  },
];

export function FeatureSlides({ onNext, onSkip }: FeatureSlidesProps) {
  const [index, setIndex] = useState(0);

  const slide = useMemo(() => SLIDES[index], [index]);
  const Icon = slide.icon;

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col px-4 pt-14 pb-8">
      <button
        className="self-end text-xs font-medium text-muted-foreground"
        onClick={onSkip}
      >
        Skip
      </button>

      <GlassCard level={1} className="mt-8 rounded-3xl p-6 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
          <Icon className="h-7 w-7 text-primary" />
        </div>
        <h3 className="text-xl font-bold">{slide.title}</h3>
        <p className="mt-2 text-sm text-muted-foreground">{slide.description}</p>
      </GlassCard>

      <div className="mt-6 flex items-center justify-center gap-2">
        {SLIDES.map((_, i) => (
          <span
            key={i}
            className={`h-2 rounded-full transition-all ${i === index ? "w-6 bg-primary" : "w-2 bg-muted"
              }`}
          />
        ))}
      </div>

      <div className="mt-auto flex gap-2">
        {index < SLIDES.length - 1 ? (
          <Button className="h-12 flex-1 rounded-xl" onClick={() => setIndex((v) => v + 1)}>
            Next
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button className="h-12 flex-1 rounded-xl" onClick={onNext}>
            Continue
          </Button>
        )}
      </div>
    </div>
  );
}
