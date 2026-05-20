// src/pages/user/map/components/map-loading.tsx
export function MapLoading() {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(2,6,23,0.85)", backdropFilter: "blur(12px)" }}
    >
      <div
        className="flex flex-col items-center gap-5 px-10 py-8 rounded-3xl"
        style={{
          background: "rgba(15,23,42,0.9)",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 30px 60px rgba(0,0,0,0.5)",
        }}
      >
        {/* Animated radar rings */}
        <div className="relative flex items-center justify-center w-16 h-16">
          <div
            className="absolute inset-0 rounded-full animate-ping"
            style={{ background: "rgba(59,130,246,0.15)", animationDuration: "1.5s" }}
          />
          <div
            className="absolute rounded-full animate-ping"
            style={{
              inset: "6px",
              background: "rgba(59,130,246,0.2)",
              animationDuration: "1.5s",
              animationDelay: "0.3s",
            }}
          />
          <div
            className="relative flex items-center justify-center w-12 h-12 rounded-full"
            style={{
              background: "linear-gradient(135deg, #1d4ed8, #2563eb)",
              boxShadow: "0 0 20px rgba(37,99,235,0.6)",
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
          </div>
        </div>

        <div className="text-center space-y-1">
          <p className="text-sm font-semibold text-white">Loading Map</p>
          <p className="text-xs text-slate-400">Fetching live safety data…</p>
        </div>

        {/* Shimmer bar */}
        <div className="w-36 h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
          <div
            className="h-full rounded-full"
            style={{
              width: "40%",
              background: "linear-gradient(90deg, transparent, #3b82f6, transparent)",
              animation: "shimmer 1.4s infinite",
            }}
          />
        </div>

        <style>{`
          @keyframes shimmer {
            0% { transform: translateX(-200%); }
            100% { transform: translateX(350%); }
          }
        `}</style>
      </div>
    </div>
  );
}