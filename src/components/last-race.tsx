"use client";

import { motion } from "motion/react";

import { Badge } from "@/components/ui/badge";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Race } from "@/lib/types";
import { teamColor } from "@/lib/teams";

export function LastRace({ race }: { race?: Race }) {
  return (
    <Card className="h-full rounded-sm border-0 py-5 shadow-xl shadow-black/25">
      <CardHeader className="px-5">
        <CardDescription className="text-teal text-[10px] font-semibold tracking-[0.2em] uppercase">
          Última corrida {race && `· R${race.round}`}
        </CardDescription>
        <CardTitle className="font-display text-2xl font-bold uppercase">{race?.raceName ?? "—"}</CardTitle>
        {race && (
          <CardAction>
            <Badge variant="outline">{race.Circuit.Location.country}</Badge>
          </CardAction>
        )}
      </CardHeader>
      <CardContent className="max-h-[420px] overflow-y-auto px-3 sm:px-5">
        {race?.Results ? (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-8">#</TableHead>
                <TableHead>Piloto</TableHead>
                <TableHead className="text-right">Grid</TableHead>
                <TableHead className="text-right">Tempo</TableHead>
                <TableHead className="text-right">Pts</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {race.Results.map((r, i) => {
                const gained = Number(r.grid) > 0 ? Number(r.grid) - Number(r.position) : 0;
                return (
                  <motion.tr
                    key={r.Driver.driverId}
                    data-slot="table-row"
                    className="hover:bg-muted/50 border-b transition-colors"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: Math.min(i * 0.03, 0.5) }}
                  >
                    <TableCell className="font-display font-bold italic">{r.positionText}</TableCell>
                    <TableCell>
                      <span className="mr-2 inline-block h-3.5 w-1 rounded-full align-[-2px]" style={{ background: teamColor(r.Constructor.constructorId) }} />
                      <span className="font-medium uppercase">{r.Driver.familyName}</span>
                      {r.FastestLap?.rank === "1" && (
                        <Badge className="ml-2 bg-fuchsia-600 text-[10px] text-white">VMR</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {r.grid === "0" ? "Box" : r.grid}
                      {gained !== 0 && (
                        <span className={`ml-1 text-[11px] ${gained > 0 ? "text-teal" : "text-destructive"}`}>
                          {gained > 0 ? `▲${gained}` : `▼${-gained}`}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-right tabular-nums">{r.Time?.time ?? r.status}</TableCell>
                    <TableCell className="text-right font-semibold tabular-nums">{r.points}</TableCell>
                  </motion.tr>
                );
              })}
            </TableBody>
          </Table>
        ) : (
          <p className="text-muted-foreground py-10 text-center text-sm">Nenhuma corrida disputada ainda.</p>
        )}
      </CardContent>
    </Card>
  );
}
