import { Skeleton } from "@/components/ui/skeleton";
import "./style.scss";
export function SkeletonCard() {
  return (
    <div className="flex h-full w-full flex-col space-y-3">
      <Skeleton className="h-full w-full rounded-xl cus-skeleton-css" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-[250px]" />
        <Skeleton className="h-4 w-[200px]" />
      </div>
    </div>
  );
}
