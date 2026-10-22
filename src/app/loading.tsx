import { Backdrop } from "@/components/backdrop";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <>
      <Backdrop />
      <main className="mx-auto max-w-7xl space-y-10 px-4 pt-6 sm:px-6 sm:pt-10">
        <Skeleton className="h-[520px] rounded-sm bg-black/80 lg:w-[78%]" />
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-80 rounded-sm bg-black/60" />
          <Skeleton className="h-80 rounded-sm bg-white/60" />
        </div>
      </main>
    </>
  );
}
