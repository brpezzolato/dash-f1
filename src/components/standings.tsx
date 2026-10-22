"use client";

import { motion } from "motion/react";

import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { ConstructorStanding, DriverStanding } from "@/lib/types";
import { teamColor } from "@/lib/teams";

const EASE = [0.16, 1, 0.3, 1] as const;

interface Row {
  key: string;
  pos: string;
  name: React.ReactNode;
  sub?: string;
  wins: string;
  points: number;
  color: string;
}

function StandingsTable({ rows }: { rows: Row[] }) {
  const max = rows[0]?.points || 1;
  return (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead className="w-10">Pos</TableHead>
          <TableHead>Nome</TableHead>
          <TableHead className="text-right">Vit.</TableHead>
          <TableHead className="w-[38%] text-right">Pontos</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((r, i) => (
          <motion.tr
            key={r.key}
            data-slot="table-row"
            className="hover:bg-muted/50 border-b transition-colors"
            initial={{ opacity: 0, x: -16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: Math.min(i * 0.035, 0.6), ease: EASE }}
          >
            <TableCell className="font-display text-lg font-bold italic">
              <span className={i < 3 ? "text-teal" : "text-muted-foreground"}>{r.pos}</span>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-3">
                <span className="h-6 w-1 rounded-full" style={{ background: r.color }} />
                <div>
                  <div className="font-medium">{r.name}</div>
                  {r.sub && <div className="text-muted-foreground text-xs">{r.sub}</div>}
                </div>
              </div>
            </TableCell>
            <TableCell className="text-right tabular-nums">{r.wins}</TableCell>
            <TableCell>
              <div className="flex items-center justify-end gap-3">
                <div className="bg-muted hidden h-1.5 flex-1 overflow-hidden rounded-full sm:block">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: r.color }}
                    initial={{ width: 0 }}
                    whileInView={{ width: `${(r.points / max) * 100}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: 0.2 + Math.min(i * 0.035, 0.6), ease: EASE }}
                  />
                </div>
                <span className="font-display w-12 text-right text-lg font-semibold tabular-nums">{r.points}</span>
              </div>
            </TableCell>
          </motion.tr>
        ))}
      </TableBody>
    </Table>
  );
}

export function Standings({ drivers, constructors }: { drivers: DriverStanding[]; constructors: ConstructorStanding[] }) {
  const driverRows: Row[] = drivers.map((d) => {
    const team = d.Constructors.at(-1);
    return {
      key: d.Driver.driverId,
      pos: d.positionText,
      name: (
        <>
          <span className="text-muted-foreground font-normal">{d.Driver.givenName}</span>{" "}
          <span className="font-semibold uppercase">{d.Driver.familyName}</span>
        </>
      ),
      sub: team?.name,
      wins: d.wins,
      points: Number(d.points),
      color: teamColor(team?.constructorId),
    };
  });
  const constructorRows: Row[] = constructors.map((c) => ({
    key: c.Constructor.constructorId,
    pos: c.positionText,
    name: <span className="font-semibold uppercase">{c.Constructor.name}</span>,
    wins: c.wins,
    points: Number(c.points),
    color: teamColor(c.Constructor.constructorId),
  }));

  return (
    <Card className="rounded-sm border-0 py-5 shadow-xl shadow-black/25">
      <CardContent className="px-4 sm:px-6">
        <Tabs defaultValue="drivers">
          <TabsList className="mb-2">
            <TabsTrigger value="drivers">Pilotos</TabsTrigger>
            <TabsTrigger value="constructors">Construtores</TabsTrigger>
          </TabsList>
          <TabsContent value="drivers">
            {driverRows.length ? <StandingsTable rows={driverRows} /> : <Empty />}
          </TabsContent>
          <TabsContent value="constructors">
            {constructorRows.length ? <StandingsTable rows={constructorRows} /> : <Empty />}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

function Empty() {
  return <p className="text-muted-foreground py-10 text-center text-sm">Sem dados para esta temporada.</p>;
}
