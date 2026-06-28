import { Skeleton } from "@/components/ui/skeleton";

export function MarketplaceCardSkeleton() {
    return (
        <div className="bg-white dark:bg-[#141414] rounded-[1rem] md:rounded-2xl p-3 md:p-4 border border-gray-100 dark:border-[#2A2A2A] h-full flex flex-col space-y-4">
            {/* Image Skeleton */}
            <Skeleton className="h-28 md:h-40 rounded-xl w-full" />

            {/* Title and Badge */}
            <div className="flex flex-col sm:flex-row sm:justify-between items-start gap-2">
                <div className="flex items-center gap-1.5 flex-wrap w-full sm:w-auto">
                    <Skeleton className="h-5 w-32 rounded-md" />
                    <Skeleton className="h-4 w-12 rounded-full" />
                </div>
                <div className="flex flex-col items-start sm:items-end gap-1.5 w-full sm:w-auto">
                    <Skeleton className="h-5 w-20 rounded-md" />
                </div>
            </div>

            {/* Description lines */}
            <div className="space-y-2 hidden sm:block">
                <Skeleton className="h-3.5 w-full rounded-md" />
                <Skeleton className="h-3.5 w-5/6 rounded-md" />
                <Skeleton className="h-3.5 w-2/3 rounded-md" />
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-2.5 md:pt-4 border-t border-gray-50 dark:border-[#2A2A2A] mt-auto">
                <div className="flex items-center gap-2">
                    <Skeleton className="w-5 h-5 md:w-6 md:h-6 rounded-full" />
                    <Skeleton className="h-3 w-16 rounded-md" />
                </div>
                <div className="flex items-center gap-1">
                    <Skeleton className="w-3.5 h-3.5 rounded-full" />
                    <Skeleton className="h-3 w-6 rounded-md" />
                </div>
            </div>
        </div>
    );
}

export function MarketplaceSectionSkeleton({ count = 4 }: { count?: number }) {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            {Array.from({ length: count }).map((_, i) => (
                <MarketplaceCardSkeleton key={i} />
            ))}
        </div>
    );
}
