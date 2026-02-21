import { memo } from "react";

function StatusBarInner() {
  return (
    <div
      className="safe-area-top transition-colors duration-2000"
      style={{ backgroundColor: "var(--theme-bg-from)" }}
    />
  );
}

export const StatusBar = memo(StatusBarInner);