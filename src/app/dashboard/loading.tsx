import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto flex max-w-[1500px] gap-4 p-4">
      <Skeleton className="hidden h-[calc(100vh-2rem)] w-16 rounded-3xl bg-white/5 lg:block" />
      <div className="flex-1 space-y-4">
        <Skeleton className="h-16 rounded-3xl bg-white/5" />
        <div className="grid gap-4 xl:grid-cols-[1fr_380px]">
          <Skeleton className="h-[640px] rounded-3xl bg-white/5" />
          <Skeleton className="h-[640px] rounded-3xl bg-white/5" />
        </div>
      </div>
    </div>
  );
}
