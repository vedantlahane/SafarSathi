import { Skeleton } from "@/components/ui/skeleton";

/** Loading skeleton matching the ID page card + actions layout. */
export function IDSkeleton() {
    return (
        <div className="p-4 space-y-4">
            {/* Card skeleton — credit card aspect ratio */}
            <Skeleton
                className="w-full rounded-2xl"
                style={{ paddingBottom: "63.1%" }}
            />
            {/* Quick actions skeleton */}
            <div className="grid grid-cols-2 gap-3">
                <Skeleton className="h-24 rounded-2xl" />
                <Skeleton className="h-24 rounded-2xl" />
            </div>
            <Skeleton className="h-12 w-full rounded-2xl" />
        </div>
    );
}
