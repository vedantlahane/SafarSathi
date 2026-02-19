import { memo } from "react";

function StatusBarInner() {
    return (
        <div className="safe-area-top" style={{ backgroundColor: "var(--theme-bg-from)" }} />
    );
}

export const StatusBar = memo(StatusBarInner);
