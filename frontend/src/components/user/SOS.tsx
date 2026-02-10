import { postSOS } from "@/lib/api";
import { hapticFeedback } from "@/lib/store";
import { useState, useRef } from "react";
import { Siren, CheckCircle2, Loader2 } from "lucide-react"; // Assuming Lucide icons are available
import { Button } from "@/components/ui/button"; // Assuming shadcn/ui Button

interface SOSProps {
  touristId: string;
}

export default function SOS({ touristId }: SOSProps) {
  const [sosDialogOpen, setSosDialogOpen] = useState(false);
  const [sosLoading, setSosLoading] = useState(false);
  const [sosSuccess, setSosSuccess] = useState(false);
  const [swipeProgress, setSwipeProgress] = useState(0); // 0-100 for progress bar
  const swipeRef = useRef<HTMLDivElement>(null);
  const startX = useRef(0);
  const isSwiping = useRef(false);

  const handleSOS = async () => {
    if (!touristId) return;
    hapticFeedback("heavy");
    setSosLoading(true);
    try {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            await postSOS(touristId, {
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
            });
            setSosSuccess(true);
            hapticFeedback("heavy");
            setSosLoading(false);
          },
          async () => {
            await postSOS(touristId, {});
            setSosSuccess(true);
            setSosLoading(false);
          }
        );
      } else {
        await postSOS(touristId, {});
        setSosSuccess(true);
        setSosLoading(false);
      }
    } catch {
      setSosLoading(false);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    isSwiping.current = true;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isSwiping.current || !swipeRef.current) return;
    const currentX = e.touches[0].clientX;
    const deltaX = currentX - startX.current;
    const maxSwipe = swipeRef.current.offsetWidth; // Full width of the bar
    const progress = Math.min(Math.max(deltaX / maxSwipe * 100, 0), 100);
    setSwipeProgress(progress);
  };

  const handleTouchEnd = () => {
    if (!isSwiping.current) return;
    isSwiping.current = false;
    if (swipeProgress >= 80) { // Trigger if swiped 80% or more
      handleSOS();
      setSosDialogOpen(true);
    }
    setSwipeProgress(0); // Reset
  };

  return (
    <div className="relative">
      {/* Swipeable SOS Bar */}
      <div
        ref={swipeRef}
        className="relative w-full h-16 bg-red-100 rounded-full overflow-hidden cursor-pointer select-none"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-red-700 flex items-center justify-center">
          <Siren className="h-6 w-6 text-white mr-2" />
          <span className="text-white font-bold">Swipe Right for SOS</span>
        </div>
        {/* Progress Indicator */}
        <div
          className="absolute left-0 top-0 h-full bg-white/20 transition-all duration-200"
          style={{ width: `${swipeProgress}%` }}
        />
        {/* Swipe Handle */}
        <div
          className="absolute left-0 top-0 h-full w-16 bg-white rounded-full shadow-lg flex items-center justify-center transition-transform duration-200"
          style={{ transform: `translateX(${swipeProgress}%)` }}
        >
          <Siren className="h-5 w-5 text-red-600" />
        </div>
      </div>

      {/* Optional: Fallback Button */}
      <Button
        variant="destructive"
        className="mt-4 w-full"
        onClick={() => {
          handleSOS();
          setSosDialogOpen(true);
        }}
        disabled={sosLoading}
      >
        {sosLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Manual SOS"}
      </Button>

      {/* Success Dialog (similar to Home.tsx) */}
      {sosDialogOpen && sosSuccess && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl p-6 text-center max-w-sm">
            <CheckCircle2 className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-xl font-bold">SOS Sent!</h2>
            <p className="text-muted-foreground mt-2">Help is on the way.</p>
            <Button
              className="mt-4"
              onClick={() => {
                setSosDialogOpen(false);
                setSosSuccess(false);
              }}
            >
              OK
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
