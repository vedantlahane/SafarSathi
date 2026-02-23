import { useIdentity } from "./hooks/use-identity";
import { IDEmptyState } from "./components/id-empty-state";
import { IDCard } from "./components/id-card";
import { IDQuickActions } from "./components/quick-actions";
import { IDDetailsSheet } from "./components/id-details-sheet";
import { IDSkeleton } from "./components/id-skeleton";

const Identity = () => {
  const id = useIdentity();

  if (!id.session?.touristId) return <IDEmptyState />;

  if (id.loading) return <IDSkeleton />;

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
