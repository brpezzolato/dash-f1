import { DriverAvatar, NumberBadge } from "@/components/driver-avatar";
import { TyreDot } from "@/components/tyres";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { LeaderboardRow } from "@/lib/types";

export function Leaderboard({ rows }: { rows: LeaderboardRow[] }) {
  return (
    <div className="scrollbar-thin max-h-[560px] overflow-y-auto">
      <Table>
        <TableHeader className="bg-background/80 sticky top-0 z-10 backdrop-blur">
          <TableRow className="hover:bg-transparent">
            <TableHead className="text-[11px]">Pos</TableHead>
            <TableHead className="text-[11px]">Piloto</TableHead>
            <TableHead className="hidden text-[11px] md:table-cell">Equipe</TableHead>
            <TableHead className="text-right text-[11px]">Gap / tempo</TableHead>
            <TableHead className="hidden text-[11px] sm:table-cell">Pneus</TableHead>
            <TableHead className="hidden text-right text-[11px] sm:table-cell">Melhor volta</TableHead>
            <TableHead className="text-right text-[11px]">Grid</TableHead>
            <TableHead className="text-right text-[11px]">Pts</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((r) => {
            const delta = r.grid > 0 && Number(r.position) ? r.grid - Number(r.position) : 0;
            return (
              <TableRow key={r.driver.id} className="border-white/[0.05] hover:bg-white/[0.04]">
                <TableCell className="font-display num w-12 font-bold">P{r.position}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2.5">
                    <NumberBadge driver={r.driver} />
                    <DriverAvatar driver={r.driver} className="size-7" />
                    <span>
                      <span className="text-muted-foreground hidden lg:inline">{r.driver.givenName} </span>
                      <span className="font-semibold">{r.driver.familyName}</span>
                    </span>
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <span className="flex items-center gap-2 text-white/80">
                    <span className="h-3.5 w-1 rounded-full" style={{ background: r.driver.team.color }} />
                    {r.driver.team.name}
                  </span>
                </TableCell>
                <TableCell className="num text-right text-white/80">{r.gap}</TableCell>
                <TableCell className="hidden sm:table-cell">
                  <div className="flex -space-x-1">
                    {r.tyres.length ? r.tyres.map((t, i) => <TyreDot key={i} name={t} />) : <span className="text-muted-foreground">—</span>}
                  </div>
                </TableCell>
                <TableCell className={`num hidden text-right sm:table-cell ${r.fastest ? "font-semibold text-[#c77dff]" : "text-white/70"}`}>
                  {r.bestLap ?? "—"}
                </TableCell>
                <TableCell className="num text-right">
                  <span className="text-white/70">{r.grid || "Box"}</span>
                  {delta !== 0 && (
                    <span className={`ml-1 text-[11px] ${delta > 0 ? "text-emerald-400" : "text-rose-400"}`}>
                      {delta > 0 ? `▲${delta}` : `▼${-delta}`}
                    </span>
                  )}
                </TableCell>
                <TableCell className="num text-right font-semibold">{r.points || ""}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
