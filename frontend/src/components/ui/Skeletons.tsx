import { Skeleton } from "./Skeleton";

export function CardSkeleton() {
    return (
        <div className="bg-[#151A21] border border-[#1F2937] rounded-2xl p-4 flex flex-col h-full space-y-4">
            <Skeleton className="h-40 w-full rounded-xl" />
            <div className="space-y-2">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
            </div>
            <div className="flex gap-2 mt-auto">
                <Skeleton className="h-10 flex-1 rounded-lg" />
                <Skeleton className="h-10 w-10 rounded-lg" />
                <Skeleton className="h-10 w-10 rounded-lg" />
            </div>
        </div>
    );
}

export function StatCardSkeleton() {
    return (
        <div className="bg-[#151A21] border border-[#1F2937] rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-5 w-5 rounded-full" />
            </div>
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-3 w-24" />
        </div>
    );
}

export function ListSkeleton() {
    return (
        <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4 p-4 bg-[#151A21] border border-[#1F2937] rounded-xl">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-1/4" />
                        <Skeleton className="h-3 w-1/2" />
                    </div>
                    <Skeleton className="h-8 w-20 rounded-lg" />
                </div>
            ))}
        </div>
    );
}

export function CalendarSkeleton() {
    return (
        <div className="bg-[#151A21] border border-[#1F2937] rounded-2xl p-6 h-[700px] flex flex-col space-y-4">
            <div className="flex justify-between items-center mb-4">
                <Skeleton className="h-10 w-48" />
                <div className="flex gap-2">
                    <Skeleton className="h-10 w-24" />
                    <Skeleton className="h-10 w-24" />
                </div>
            </div>
            <div className="flex-1 grid grid-cols-7 gap-1">
                {[...Array(35)].map((_, i) => (
                    <Skeleton key={i} className="h-full w-full rounded-sm opacity-20" />
                ))}
            </div>
        </div>
    );
}
export function TableSkeleton({ rows = 5, cols = 5 }: { rows?: number; cols?: number }) {
    return (
        <div className="w-full space-y-4">
            <div className="bg-[#0B0E14] border-b border-[#1F2937] p-4 flex gap-4">
                {[...Array(cols)].map((_, i) => (
                    <Skeleton key={i} className="h-4 flex-1" />
                ))}
            </div>
            {[...Array(rows)].map((_, i) => (
                <div key={i} className="p-4 flex gap-4 border-b border-[#1F2937]/50">
                    {[...Array(cols)].map((_, j) => (
                        <Skeleton key={j} className="h-10 flex-1 rounded-lg" />
                    ))}
                </div>
            ))}
        </div>
    );
}
