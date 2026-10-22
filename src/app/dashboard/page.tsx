import type { Metadata } from "next";

import { CalendarStrip } from "@/components/dashboard/calendar-strip";
import { CircuitOverview } from "@/components/dashboard/circuit-overview";
import { DriverCard } from "@/components/dashboard/driver-card";
import { LapDistribution } from "@/components/dashboard/lap-distribution";
import { Leaderboard } from "@/components/dashboard/leaderboard";
import { Panel, Unavailable } from "@/components/dashboard/panel";
import { PointsChart } from "@/components/dashboard/points-chart";
import { RaceHero } from "@/components/dashboard/race-hero";
import { DriverStandings, TeamLegend, TeamStandings } from "@/components/dashboard/standings-bars";
import { TyreStrategy } from "@/components/dashboard/tyre-strategy";
import { Reveal } from "@/components/motion/reveal";
import { SeasonSelect } from "@/components/season-select";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { FIRST_TELEMETRY_SEASON, getDashboard, resolveSeason, seasons } from "@/lib/f1";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ season?: string }> }) {
  const season = resolveSeason((await searchParams).season);
  const d = await getDashboard(season);
  const race = d.lastRace;
  const winner = race?.leaderboard[0];
  const leader = d.standings[0];
  const noTelemetry =
    Number(season) < FIRST_TELEMETRY_SEASON
      ? `Dados de pneus e voltas existem a partir de ${FIRST_TELEMETRY_SEASON}.`
      : "Dados de pneus e voltas indisponíveis para esta corrida.";

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_left,#1a0f12_0%,#07080a_45%),radial-gradient(ellipse_at_bottom_right,#0c1420_0%,transparent_50%)]">
      <div className="mx-auto flex max-w-[1500px] gap-4 p-3 sm:p-4">
        <div className="min-w-0 flex-1 space-y-4">
          <header className="glass flex flex-wrap items-center justify-between gap-3 rounded-3xl px-5 py-3">
            <Link
              href={`/?season=${season}`}
              className="grid size-9 place-items-center rounded-full bg-white/[0.06] transition hover:-translate-x-0.5 hover:bg-white/[0.12]"
              aria-label="Voltar ao início"
            >
              <ArrowLeft className="size-4" />
            </Link>
            <div className="mr-auto">
              <p className="kicker">Temporada {season}</p>
              <p className="font-display text-lg font-bold">
                {d.completedRounds} de {d.schedule.length} etapas
                {leader && (
                  <span className="text-muted-foreground font-normal">
                    {" "}· líder: <span style={{ color: leader.driver.team.color }}>{leader.driver.familyName}</span> ({leader.points} pts)
                  </span>
                )}
              </p>
            </div>
            <SeasonSelect season={season} seasons={seasons()} />
          </header>

          {race ? (
            <>
              <Reveal className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
                <div className="min-w-0 space-y-4">
                  <RaceHero analysis={race} />
                  <Panel title="Leaderboard" kicker={`Resultado final · ${race.leaderboard[0]?.laps ?? "–"} voltas`}>
                    <Leaderboard rows={race.leaderboard} />
                  </Panel>
                </div>
                <div className="space-y-4">
                  <CircuitOverview circuit={race.circuit} weather={race.weather} title="Visão geral do circuito" />
                  {winner && (
                    <DriverCard
                      driver={winner.driver}
                      label="Vencedor"
                      stats={[
                        { label: "Largada", value: winner.grid ? `P${winner.grid}` : "Box" },
                        { label: "Pontos", value: String(winner.points) },
                        { label: "Pit stops", value: String(Math.max(0, winner.tyres.length - 1)) },
                      ]}
                    />
                  )}
                </div>
              </Reveal>

              <Reveal className="grid gap-4 xl:grid-cols-2">
                <Panel id="estrategia" title="Estratégia de pneus" kicker="Stints por piloto · ordem de chegada">
                  {race.strategy.length ? <TyreStrategy rows={race.strategy} /> : <Unavailable>{noTelemetry}</Unavailable>}
                </Panel>
                <Panel id="ritmo" title="Ritmo de corrida" kicker="Distribuição das voltas limpas · top 10">
                  {race.distribution.length ? (
                    <>
                      <LapDistribution data={race.distribution} />
                      <p className="text-muted-foreground mt-2 text-[11px]">
                        Caixa = 50% central das voltas · traço branco = mediana · pontos = cada volta. Excluídas volta 1, entradas e saídas de box e voltas acima de 107% da mediana.
                      </p>
                    </>
                  ) : (
                    <Unavailable>{noTelemetry}</Unavailable>
                  )}
                </Panel>
              </Reveal>
            </>
          ) : (
            <Panel>
              <Unavailable>Nenhuma corrida disputada ainda nesta temporada.</Unavailable>
            </Panel>
          )}

          <Reveal id="campeonato" className="grid scroll-mt-6 gap-4 xl:grid-cols-[1.3fr_1fr_1fr]">
            <Panel title="Evolução do campeonato" kicker="Pontos acumulados · top 6 · corridas + sprints">
              {d.points.rows.length ? <PointsChart series={d.points} /> : <Unavailable>Sem corridas ainda.</Unavailable>}
            </Panel>
            <Panel title="Pilotos" kicker="Classificação">
              <DriverStandings rows={d.standings} />
            </Panel>
            <Panel title="Construtores" kicker="Classificação">
              <TeamStandings rows={d.teams} />
            </Panel>
          </Reveal>

          <Reveal>
            <Panel title="Equipes" kicker="Cores usadas nos gráficos">
              <TeamLegend drivers={d.standings} />
            </Panel>
          </Reveal>

          <Reveal>
            <Panel id="calendario" title="Calendário" kicker={`${d.schedule.length} etapas`}>
              <CalendarStrip races={d.schedule} nextRound={d.nextRace?.round} />
            </Panel>
          </Reveal>

          <p className="text-muted-foreground pb-4 text-center text-xs">
            Dados: Jolpica F1 (resultados), OpenF1 (pneus, voltas, clima, pilotos) e MultiViewer (traçados). Projeto não oficial.
          </p>
        </div>
      </div>
    </div>
  );
}
