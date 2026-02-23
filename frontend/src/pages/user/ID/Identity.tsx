import { Skeleton } from "@/components/ui/skeleton";
import { useIdentity } from "./hooks/use-identity";
import { IDEmptyState } from "./components/id-empty-state";
import { IDCard } from "./components/id-card";
import { IDQuickActions } from "./components/quick-actions";
import { IDDetailsSheet } from "./components/id-details-sheet";

const Identity = () => {
  const id = useIdentity();

  if (!id.session?.touristId) return <IDEmptyState />;

  if (id.loading) return (
    <div className="p-4 space-y-4">
      <Skeleton className="w-full rounded-2xl" style={{ paddingBottom: "63.1%" }} />
      <div className="grid grid-cols-2 gap-3">
        <Skeleton className="h-24 rounded-2xl" />
        <Skeleton className="h-24 rounded-2xl" />
      </div>
      <Skeleton className="h-12 w-full rounded-2xl" />
    </div>
  );

  return (
    <div className="flex flex-col gap-4 p-4 pb-24">
      <IDCard
        profile={id.profile}
        sessionName={id.session.name}
        isFlipped={id.isFlipped}
        onFlip={id.handleFlip}
      />
      <IDQuickActions
        onShare={id.handleShare}
        onViewDetails={() => id.setShowDetails(true)}
        shareAvailable={!!navigator.share}
      />
      <IDDetailsSheet
        open={id.showDetails}
        onOpenChange={id.setShowDetails}
        profile={id.profile}
        copied={id.copied}
        onCopy={id.handleCopy}
      />
    </div>
  );
};

export default Identity;
