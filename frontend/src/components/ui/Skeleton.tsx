import { cn } from "../../lib/utils";

interface SkeletonProps {
    className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
    return (
        <div
            className={cn(
                "animate-pulse rounded-md bg-[#1F2937]/50",
                className
            )}
        />
    );
}
