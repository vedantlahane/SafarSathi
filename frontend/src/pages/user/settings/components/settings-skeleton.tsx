import { Skeleton } from "@/components/ui/skeleton";

/** Loading skeleton matching the Settings page layout. */
export function SettingsSkeleton() {
    return (
        <div className="p-4 space-y-6">
            {/* Profile header skeleton */}
            <div className="flex items-center gap-4">
                <Skeleton className="h-16 w-16 rounded-full" />
                <div className="space-y-2 flex-1">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-48" />
                </div>
            </div>

            {/* Section skeletons */}
            {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-3">
                    <Skeleton className="h-3 w-24" />
                    <div className="space-y-1">
                        <Skeleton className="h-14 w-full rounded-xl" />
                        <Skeleton className="h-14 w-full rounded-xl" />
                        <Skeleton className="h-14 w-full rounded-xl" />
                    </div>
                </div>
            ))}
        </div>
    );
}
