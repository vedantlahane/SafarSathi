import { useState, useRef, useCallback, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: ReactNode;
  className?: string;
}

export function PullToRefresh({ onRefresh, children, className }: PullToRefreshProps) {
  const [pulling, setPulling] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const startY = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const threshold = 80;
  
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (containerRef.current?.scrollTop === 0) {
      startY.current = e.touches[0].clientY;
      setPulling(true);
    }
  }, []);
  
  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!pulling || refreshing) return;
    const currentY = e.touches[0].clientY;
    const diff = currentY - startY.current;
    if (diff > 0) {
      setPullDistance(Math.min(diff * 0.5, threshold * 1.5));
    }
  }, [pulling, refreshing]);
  
  const handleTouchEnd = useCallback(async () => {
    if (!pulling) return;
    setPulling(false);
    
    if (pullDistance >= threshold && !refreshing) {
      setRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setRefreshing(false);
      }
    }
    setPullDistance(0);
  }, [pulling, pullDistance, refreshing, onRefresh]);
  
  return (
    <div
      ref={containerRef}
      className={cn("overflow-y-auto", className)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div
        className="flex items-center justify-center transition-all duration-200"
        style={{ height: refreshing ? 48 : pullDistance, minHeight: refreshing ? 48 : 0 }}
      >
        {(pullDistance > 0 || refreshing) && (
          <div
            className={cn(
              "flex items-center gap-2 text-sm text-muted-foreground",
              refreshing && "animate-pulse"
            )}
          >
            <div
              className={cn(
                "h-5 w-5 rounded-full border-2 border-primary border-t-transparent",
                refreshing && "animate-spin"
              )}
              style={{
                transform: refreshing ? undefined : `rotate(${pullDistance * 3}deg)`,
              }}
            />
            <span>{refreshing ? "Refreshing..." : pullDistance >= threshold ? "Release to refresh" : "Pull to refresh"}</span>
          </div>
        )}
      </div>
      {children}
    </div>
  );
}
