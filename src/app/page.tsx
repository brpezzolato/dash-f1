import { LapDistribution } from "@/components/dashboard/lap-distribution";
import { Panel, Unavailable } from "@/components/dashboard/panel";
import { PointsChart } from "@/components/dashboard/points-chart";
import { TeamLegend, TeamStandings } from "@/components/dashboard/standings-bars";
import { TyreStrategy } from "@/components/dashboard/tyre-strategy";
import { CircuitOverview } from "@/components/dashboard/circuit-overview";
import { Reveal } from "@/components/motion/reveal";
import { CalendarRail } from "@/components/site/calendar-rail";
import { DriversCarousel } from "@/components/site/drivers-carousel";
import { Hero } from "@/components/site/hero";
import { Block, SectionHeading } from "@/components/site/hud";
import { IntroLoader } from "@/components/site/intro-loader";
import { Ranking } from "@/components/site/ranking";
import { ScrollText } from "@/components/site/scroll-text";
import { SmoothScroll } from "@/components/site/smooth-scroll";
import { FIRST_TELEMETRY_SEASON, getDashboard, resolveSeason, seasons } from "@/lib/f1";

export default async function Home({ searchParams }: { searchParams: Promise<{ season?: string }> }) {
  const season = resolveSeason((await searchParams).season);
  const d = await getDashboard(season);
  const race = d.lastRace;
  const winner = race?.leaderboard[0];
  const [leader, second] = d.standings;
  const topTeam = d.teams[0];
  const rows = d.standings.map((s) => ({ ...s, stats: d.stats[s.driver.id] }));
  const maps = Object.fromEntries(d.tracks.map((t) => [t.name, t.map]));
  if (race?.circuit.map) maps[race.circuit.name] = race.circuit.map;
  if (d.nextCircuit?.map) maps[d.nextCircuit.name] = d.nextCircuit.map;
  const noTelemetry =
    Number(season) < FIRST_TELEMETRY_SEASON
      ? `Dados de pneus e voltas existem a partir de ${FIRST_TELEMETRY_SEASON}.`
      : "Dados de pneus e voltas indisponíveis para esta corrida.";

  const statement = leader
    ? `${leader.driver.familyName} lidera ${season} com ${leader.points} pontos e ${leader.wins} vitórias${
        second ? `, ${leader.points - second.points} à frente de ${second.driver.familyName}` : ""
      }. ${topTeam ? `${topTeam.name} soma ${topTeam.points} pontos entre os construtores` : ""} após ${d.completedRounds} de ${d.schedule.length} etapas.`
    : `A temporada ${season} ainda não começou.`;

  return (
    <main className="bg-[#07080a]">
      <SmoothScroll />
      <IntroLoader key={season} season={season} drivers={d.standings.map((s) => s.driver)} tracks={d.tracks} />

      <Hero
        data={{
          season,
          seasons: seasons(),
          raceName: race?.race.raceName,
          round: race?.race.round,
          raceDate: race?.race.date,
          live: race?.live ?? false,
          totalLaps: race?.circuit.laps,
          avgLap: race?.avgLap,
          leaderboard: race?.leaderboard ?? [],
          circuit: race?.circuit ?? d.nextCircuit,
          weather: race?.weather,
          focus: winner ? { driver: winner.driver, label: "Vencedor" } : d.leader ? { driver: d.leader, label: "Líder" } : undefined,
        }}
      />

      <div className="mx-auto max-w-[1500px] space-y-4 px-3 pt-4 sm:px-4">
        <Block className="py-24 sm:py-36 lg:py-40">
          <p className="mb-6 font-mono text-[11px] tracking-[0.25em] text-white/45 uppercase">
            <span className="text-f1">00</span> — A temporada em uma frase
          </p>
          <ScrollText text={statement} highlight={[leader?.driver.familyName ?? "", topTeam?.name ?? ""].flatMap((s) => s.split(" "))} />
        </Block>

        <Block id="pilotos">
          <SectionHeading index="01" kicker="Grid da temporada" title="Pilotos" />
          <Reveal>
            <DriversCarousel items={rows} />
          </Reveal>
        </Block>

        <Block id="ranking">
          <SectionHeading index="02" kicker="Passe o mouse para ver tudo" title="Ranking do campeonato" />
          <Ranking rows={rows} />
        </Block>

        <Block id="analise" className="space-y-4">
          <SectionHeading index="03" kicker={race ? `${race.race.raceName} · R${race.race.round}` : "Última corrida"} title="Análise da corrida" />
          {race ? (
            <>
              <Reveal className="grid gap-4 xl:grid-cols-[380px_minmax(0,1fr)]">
                <CircuitOverview circuit={race.circuit} weather={race.weather} title="Pista e clima" />
                <Panel title="Estratégia de pneus" kicker="Stints por piloto · ordem de chegada">
                  {race.strategy.length ? <TyreStrategy rows={race.strategy} /> : <Unavailable>{noTelemetry}</Unavailable>}
                </Panel>
              </Reveal>
              <Reveal>
                <Panel title="Ritmo de corrida" kicker="Distribuição das voltas limpas · top 10">
                  {race.distribution.length ? (
                    <>
                      <LapDistribution data={race.distribution} />
                      <p className="mt-2 text-[11px] text-white/45">
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
        </Block>

        <Block className="space-y-4">
          <SectionHeading index="04" kicker="Pontos acumulados · corridas + sprints" title="Campeonato" />
          <Reveal className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
            <Panel title="Evolução" kicker="Top 6 pilotos">
              {d.points.rows.length ? <PointsChart series={d.points} /> : <Unavailable>Sem corridas ainda.</Unavailable>}
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
        </Block>

        <CalendarRail races={d.schedule} nextRound={d.nextRace?.round} maps={maps} />
      </div>

      <footer className="mx-auto max-w-[1500px] space-y-1 px-4 py-12 text-center text-xs text-white/40 sm:px-6">
        <p>Dados: Jolpica F1 (resultados), OpenF1 (pneus, voltas, clima, pilotos) e MultiViewer (traçados). Projeto não oficial.</p>
        <p>
          Vídeo:{" "}
          <a className="underline" href="https://commons.wikimedia.org/wiki/File:2021_Russian_Grand_Prix_-_start_for_warm-up.webm" target="_blank" rel="noreferrer">
            “2021 Russian Grand Prix – start for warm-up”
          </a>
          , por rubin16,{" "}
          <a className="underline" href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noreferrer">
            CC BY-SA 4.0
          </a>
          , via Wikimedia Commons.
        </p>
      </footer>
    </main>
  );
}
