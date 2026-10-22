"use client";

import { useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function SeasonSelect({ season, seasons }: { season: string; seasons: string[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex items-center gap-2">
      {pending && <Loader2 className="text-muted-foreground size-4 animate-spin" />}
      <Select
        value={season}
        onValueChange={(s) => startTransition(() => router.push(`${pathname}?season=${s}`, { scroll: false }))}
      >
        <SelectTrigger size="sm" className="w-24 rounded-full border-white/10 bg-white/5" aria-label="Temporada">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {seasons.map((s) => (
            <SelectItem key={s} value={s}>
              {s}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
