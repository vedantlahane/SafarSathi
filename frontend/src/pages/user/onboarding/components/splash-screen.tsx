import { Sparkles } from "lucide-react";
import { motion } from "motion/react";

export function SplashScreen() {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="flex min-h-screen flex-col items-center justify-center px-6 text-center"
    >
      <div className="relative mb-7">
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
          className="h-24 w-24 rounded-3xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.3)] border border-white/10"
          style={{
            background:
              "linear-gradient(135deg, color-mix(in oklch, var(--theme-primary) 80%, black), var(--theme-primary))",
          }}
        >
          <div className="flex h-full items-center justify-center relative p-2">
            <img src="/yatrax-logo.png" alt="YatraX Logo" className="w-full h-full object-contain z-10" />
            <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/0 rounded-3xl" />
          </div>
        </motion.div>
        <motion.span 
          animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="absolute -right-2 -bottom-2 rounded-xl bg-white p-2 shadow-lg"
        >
          <Sparkles className="h-4 w-4 text-amber-500" />
        </motion.span>
      </div>

      <h1 className="text-3xl font-bold">YatraX</h1>
      <p className="mt-2 max-w-xs text-sm text-muted-foreground">
        Real-time safety intelligence for every journey.
      </p>
      <motion.p 
        animate={{ opacity: [0.3, 1, 0.3] }}
        transition={{ repeat: Infinity, duration: 1.5 }}
        className="mt-8 text-xs text-muted-foreground"
      >
        Loading safety setup…
      </motion.p>
    </motion.div>
  );
}
