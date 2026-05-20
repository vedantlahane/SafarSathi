// src/pages/user/map/components/map-icons.tsx

export function PoliceIcon() {
  return (
    <div className="relative group cursor-pointer">
      {/* Glow ring */}
      <div className="absolute inset-0 rounded-full bg-blue-500 opacity-20 blur-sm scale-150" />
      {/* Pin body */}
      <div
        className="relative flex items-center justify-center w-9 h-9 rounded-full shadow-xl border-2 border-white"
        style={{
          background: "linear-gradient(135deg, #1e40af 0%, #1d4ed8 50%, #2563eb 100%)",
          boxShadow: "0 4px 14px rgba(37,99,235,0.5), 0 1px 3px rgba(0,0,0,0.3)",
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="rgba(255,255,255,0.15)" />
          {/* Star inside shield */}
          <polygon points="12,8 13.2,11 16.5,11 13.9,12.9 14.9,16 12,14 9.1,16 10.1,12.9 7.5,11 10.8,11" fill="white" stroke="none" />
        </svg>
      </div>
      {/* Bottom pin triangle */}
      <div
        className="absolute left-1/2 -translate-x-1/2 -bottom-1.5 w-0 h-0"
        style={{
          borderLeft: "5px solid transparent",
          borderRight: "5px solid transparent",
          borderTop: "7px solid #1d4ed8",
          filter: "drop-shadow(0 2px 2px rgba(0,0,0,0.3))",
        }}
      />
    </div>
  );
}

export function HospitalIcon() {
  return (
    <div className="relative group cursor-pointer">
      {/* Glow ring */}
      <div className="absolute inset-0 rounded-xl bg-rose-500 opacity-20 blur-sm scale-125" />
      {/* Square pin body */}
      <div
        className="relative flex items-center justify-center w-9 h-9 rounded-xl shadow-xl border-2 border-white"
        style={{
          background: "linear-gradient(135deg, #be123c 0%, #e11d48 50%, #f43f5e 100%)",
          boxShadow: "0 4px 14px rgba(225,29,72,0.5), 0 1px 3px rgba(0,0,0,0.3)",
        }}
      >
        {/* Cross symbol */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="white"
        >
          <rect x="10" y="4" width="4" height="16" rx="1" />
          <rect x="4" y="10" width="16" height="4" rx="1" />
        </svg>
      </div>
      {/* Bottom pin triangle */}
      <div
        className="absolute left-1/2 -translate-x-1/2 -bottom-1.5 w-0 h-0"
        style={{
          borderLeft: "5px solid transparent",
          borderRight: "5px solid transparent",
          borderTop: "7px solid #e11d48",
          filter: "drop-shadow(0 2px 2px rgba(0,0,0,0.3))",
        }}
      />
    </div>
  );
}

export function UserIcon({ heading }: { heading: number | null }) {
  return (
    <div className="relative flex items-center justify-center" style={{ width: 48, height: 48 }}>
      {/* Outer accuracy pulse ring */}
      <div
        className="absolute rounded-full animate-ping"
        style={{ inset: "-16px", background: "rgba(59,130,246,0.4)" }}
      />
      {/* Mid glow ring */}
      <div
        className="absolute rounded-full"
        style={{
          inset: "6px",
          background: "rgba(59,130,246,0.2)",
          borderRadius: "50%",
        }}
      />
      {/* Heading arrow */}
      {heading !== null && (
        <div
          className="absolute"
          style={{
            top: "50%",
            left: "50%",
            width: 0,
            height: 0,
            transform: `translate(-50%, -50%) rotate(${heading}deg) translateY(-20px)`,
            transformOrigin: "50% 20px",
            transition: "transform 0.3s ease-out",
            borderLeft: "5px solid transparent",
            borderRight: "5px solid transparent",
            borderBottom: "10px solid #2563eb",
            filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.4))",
          }}
        />
      )}
      {/* Core dot */}
      <div
        className="relative rounded-full border-[3px] border-white z-10"
        style={{
          width: 20,
          height: 20,
          background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
          boxShadow: "0 2px 10px rgba(37,99,235,0.7), 0 0 0 3px rgba(59,130,246,0.3)",
        }}
      />
    </div>
  );
}

export function DestinationIcon() {
  return (
    <div className="relative group cursor-pointer">
      <div className="absolute inset-0 rounded-full bg-emerald-500 opacity-20 blur-sm scale-150" />
      <div
        className="relative flex items-center justify-center w-10 h-10 rounded-full shadow-xl border-2 border-white"
        style={{
          background: "linear-gradient(135deg, #059669 0%, #10b981 50%, #34d399 100%)",
          boxShadow: "0 4px 14px rgba(16,185,129,0.5), 0 1px 3px rgba(0,0,0,0.3)",
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="white"
        >
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z" />
        </svg>
      </div>
    </div>
  );
}
