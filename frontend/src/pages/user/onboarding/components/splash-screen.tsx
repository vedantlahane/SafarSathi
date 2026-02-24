import { Shield, Sparkles } from "lucide-react";

export function SplashScreen() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <div className="relative mb-7">
        <div
          className="h-24 w-24 rounded-3xl shadow-2xl"
          style={{
            background:
              "linear-gradient(135deg, color-mix(in oklch, var(--theme-primary) 80%, black), var(--theme-primary))",
          }}
        >
          <div className="flex h-full items-center justify-center">
            <Shield className="h-12 w-12 text-white" />
          </div>
        </div>
        <span className="absolute -right-2 -bottom-2 rounded-xl bg-white p-2 shadow-lg">
          <Sparkles className="h-4 w-4 text-amber-500" />
        </span>
      </div>

      <h1 className="text-3xl font-bold">YatraX</h1>
      <p className="mt-2 max-w-xs text-sm text-muted-foreground">
        Real-time safety intelligence for every journey.
      </p>
      <p className="mt-8 text-xs text-muted-foreground">Loading safety setup…</p>
    </div>
  );
}
