import { Skeleton } from "@/components/ui/skeleton";

export function JobBoardCardSkeleton() {
    return (
        <div className="bg-white rounded-2xl p-5 border border-gray-100 flex flex-col h-full space-y-4">
            {/* Header image area */}
            <Skeleton className="h-44 rounded-xl w-full" />

            {/* Title */}
            <Skeleton className="h-6 w-3/4 rounded-md" />

            {/* Price Range box */}
            <div className="bg-[#C69C2E]/5 rounded-xl p-3 flex items-center justify-between border border-[#C69C2E]/10">
                <div className="flex items-center gap-2">
                    <Skeleton className="w-8 h-8 rounded-lg" />
                    <div className="space-y-1.5">
                        <Skeleton className="h-3 w-16 rounded-md" />
                        <Skeleton className="h-4.5 w-24 rounded-md" />
                    </div>
                </div>
                <div className="text-right space-y-1.5 flex flex-col items-end">
                    <Skeleton className="h-3 w-8 rounded-md" />
                    <Skeleton className="h-4.5 w-12 rounded-md" />
                </div>
            </div>

            {/* Description lines */}
            <div className="space-y-2 flex-1">
                <Skeleton className="h-3.5 w-full rounded-md" />
                <Skeleton className="h-3.5 w-11/12 rounded-md" />
                <Skeleton className="h-3.5 w-4/5 rounded-md" />
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-50 mt-auto">
                <div className="flex items-center gap-2">
                    <Skeleton className="w-8 h-8 rounded-full" />
                    <div className="space-y-1">
                        <Skeleton className="h-2.5 w-10 rounded-md" />
                        <Skeleton className="h-3.5 w-16 rounded-md" />
                    </div>
                </div>
                <div className="flex items-center gap-1.5">
                    <Skeleton className="w-4 h-4 rounded-full" />
                    <Skeleton className="h-3 w-16 rounded-md" />
                </div>
            </div>
        </div>
    );
}

export function JobBoardSectionSkeleton({ count = 3 }: { count?: number }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {Array.from({ length: count }).map((_, i) => (
                <JobBoardCardSkeleton key={i} />
            ))}
        </div>
    );
}
