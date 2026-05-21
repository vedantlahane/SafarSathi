import { useEffect } from "react";
import {
  X,
  ChevronRight,
  ChevronLeft,
  Shield,
  LayoutDashboard,
  Bell,
  Users,
  Map,
  Building2,
  Megaphone,
  CheckCircle,
} from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface TourStep {
  title: string;
  description: string;
  tab: string;
  icon: any;
  highlightText: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    title: "Welcome to YatraX Admin",
    description: "This console gives you real-time regional oversight of tourist safety, geofenced risk zones, emergency alerts, and first responders in the field. Let's take a quick tour to get familiar with all the options.",
    tab: "dashboard",
    icon: Shield,
    highlightText: "Admin Console Overview",
  },
  {
    title: "System Stats & Overview",
    description: "The Dashboard provides a consolidated view of live active/resolved alerts, online tourists, and responder coverage. The live activity log and system status components update dynamically.",
    tab: "dashboard",
    icon: LayoutDashboard,
    highlightText: "Dashboard Section",
  },
  {
    title: "Emergency Alerts & Dispatch",
    description: "View and manage SOS triggers, inactivity alarms, and geofence violations. In the Alerts tab, you can assign police units to emergency cases or resolve them individually or in bulk.",
    tab: "alerts",
    icon: Bell,
    highlightText: "Alerts Management",
  },
  {
    title: "Tourist Directory",
    description: "Monitor registered tourists in your area. Review their individual risk scores (calculated from battery, connectivity, and proximity to risk zones) and access calling/emailing shortcuts.",
    tab: "tourists",
    icon: Users,
    highlightText: "Tourist Profiles & Risk Scores",
  },
  {
    title: "Geofencing & Risk Zones",
    description: "Review and draw geofenced risk zones on the map. You can add circular zones by clicking on the map, or draw complex polygons for custom hazard/safety perimeters.",
    tab: "zones",
    icon: Map,
    highlightText: "Interactive Map Geofencing",
  },
  {
    title: "First Responder Operations",
    description: "Manage responder units and police departments. Monitor active patrol coverages, add new departments, and update operational parameters.",
    tab: "police",
    icon: Building2,
    highlightText: "Police & Dispatch Coverage",
  },
  {
    title: "Emergency Broadcasts",
    description: "Need to notify all tourists or target a specific area? Use the Broadcast tool to draft alerts sent instantly via WebSockets to everyone, or filter by specific risk zones and districts.",
    tab: "dashboard",
    icon: Megaphone,
    highlightText: "Global Notification Tool",
  },
  {
    title: "Ready to Administer",
    description: "You're all set! Use the top search bar for quick lookups on names, zones, or statuses. Real-time updates keep you informed without manual page refreshes. Stay alert!",
    tab: "dashboard",
    icon: CheckCircle,
    highlightText: "All Caught Up!",
  },
];

interface AdminTourProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentStep: number;
  setCurrentStep: (step: number) => void;
}

export function AdminTour({
  isOpen,
  onClose,
  setActiveTab,
  currentStep,
  setCurrentStep,
}: AdminTourProps) {
  useEffect(() => {
    if (!isOpen) return;

    // Set the active tab dynamically based on the step configuration
    const step = TOUR_STEPS[currentStep];
    if (step) {
      setActiveTab(step.tab);
    }
  }, [currentStep, isOpen, setActiveTab]);

  // Support keyboard shortcuts for navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        handleNext();
      } else if (e.key === "ArrowLeft") {
        handlePrev();
      } else if (e.key === "Escape") {
        handleClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentStep, isOpen]);

  if (!isOpen) return null;

  const currentData = TOUR_STEPS[currentStep];
  const Icon = currentData.icon;
  const progressPercent = ((currentStep + 1) / TOUR_STEPS.length) * 100;

  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleClose = () => {
    localStorage.setItem("yatrax:admin-tour-completed", "true");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 pointer-events-none flex items-end justify-center md:items-center md:justify-end md:p-8">
      {/* Semi-transparent backdrop only to block interactions slightly but keep visual dashboard visible */}
      <div 
        className="fixed inset-0 bg-slate-900/5 backdrop-blur-[1px] pointer-events-auto"
        onClick={handleClose}
      />

      {/* Floating Tour Card */}
      <GlassCard
        level={1}
        className="relative w-full max-w-md mx-4 mb-4 md:mb-0 md:mx-0 pointer-events-auto border border-emerald-500/20 shadow-2xl animate-scale-in"
        style={{
          boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1), 0 0 50px -10px var(--theme-glow)",
        }}
      >
        {/* Header decoration */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-emerald-500 via-sky-500 to-indigo-500" />

        <div className="p-6">
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 rounded-full p-1 hover:bg-slate-100/50 transition-colors"
            title="Skip Tour"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Icon + Title */}
          <div className="flex items-center gap-3.5 mb-3">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100/80 border border-emerald-200/50 flex items-center justify-center text-emerald-600 shadow-sm">
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-emerald-600 tracking-wider uppercase bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                {currentData.highlightText}
              </span>
              <h3 className="text-base font-bold text-slate-950 mt-1 leading-tight">
                {currentData.title}
              </h3>
            </div>
          </div>

          {/* Description */}
          <p className="text-[13px] leading-relaxed text-slate-600 mb-5 min-h-[72px]">
            {currentData.description}
          </p>

          {/* Progress Indicator */}
          <div className="space-y-1.5 mb-5">
            <div className="flex justify-between text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
              <span>Progress</span>
              <span>
                Step {currentStep + 1} of {TOUR_STEPS.length}
              </span>
            </div>
            <Progress value={progressPercent} className="h-1 bg-slate-100" />
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-between gap-3 pt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="text-xs text-slate-400 hover:text-slate-600 px-2 hover:bg-transparent"
            >
              Skip Tour
            </Button>

            <div className="flex items-center gap-2">
              {currentStep > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrev}
                  className="h-8 gap-1 rounded-xl text-xs font-semibold border-slate-200 hover:bg-slate-50/50 text-slate-700"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                  <span>Back</span>
                </Button>
              )}

              <Button
                size="sm"
                onClick={handleNext}
                className="h-8 gap-1 rounded-xl text-xs font-semibold bg-slate-900 text-white shadow-md shadow-slate-900/10 hover:bg-slate-800"
              >
                <span>
                  {currentStep === TOUR_STEPS.length - 1 ? "Finish" : "Next"}
                </span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
