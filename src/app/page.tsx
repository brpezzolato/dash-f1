import { Backdrop } from "@/components/backdrop";
import { Calendar } from "@/components/calendar";
import { Hero } from "@/components/hero/hero";
import { Highlights } from "@/components/highlights";
import { LastRace } from "@/components/last-race";
import { PointsChart } from "@/components/points-chart";
import { SectionTitle } from "@/components/section-title";
import { Standings } from "@/components/standings";
import { Ticker } from "@/components/ticker";
import { FIRST_SEASON, getSeasonData } from "@/lib/f1";
import { nextRace } from "@/lib/race-date";

const CURRENT_SEASON = new Date().getFullYear();
const SEASONS = Array.from({ length: CURRENT_SEASON - FIRST_SEASON + 1 }, (_, i) => String(CURRENT_SEASON - i));

export default async function Home({ searchParams }: { searchParams: Promise<{ season?: string }> }) {
  const { season: requested } = await searchParams;
  const season = requested && SEASONS.includes(requested) ? requested : SEASONS[0];
  const data = await getSeasonData(season);

  const [leader, runnerUp] = data.drivers;
  const next = nextRace(data.schedule);
  const doneRounds = next ? Number(next.round) - 1 : data.schedule.length;
  const gap = leader && runnerUp ? Number(leader.points) - Number(runnerUp.points) : undefined;

  return (
    <>
      <Backdrop />
      <main className="mx-auto max-w-7xl space-y-16 px-4 pt-6 pb-20 sm:px-6 sm:pt-10">
        <Hero
          season={season}
          seasons={SEASONS}
          leader={leader}
          gap={gap}
          next={next}
          doneRounds={doneRounds}
          totalRounds={data.schedule.length}
        />

        <div className="-mx-4 sm:-mx-6 lg:pt-8">
          <Ticker drivers={data.drivers} />
        </div>

        <Highlights
          leader={leader}
          runnerUp={runnerUp}
          topTeam={data.constructors[0]}
          lastRace={data.lastRace}
          doneRounds={doneRounds}
        />

        <section id="classificacao" className="scroll-mt-8">
          <SectionTitle kicker={`Temporada ${season}`} title="Classificação" />
          <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
            <Standings drivers={data.drivers} constructors={data.constructors} />
            <PointsChart progression={data.progression} />
          </div>
        </section>

        <section id="corridas" className="scroll-mt-8">
          <SectionTitle kicker="Resultado" title="Última corrida" />
          <LastRace race={data.lastRace} />
        </section>

        <section id="calendario" className="scroll-mt-8">
          <SectionTitle kicker={`${data.schedule.length} etapas`} title="Calendário" />
          <Calendar races={data.schedule} nextRound={next?.round} />
        </section>

        <footer className="text-teal-ink/70 text-center text-xs">
          Dados da{" "}
          <a className="underline" href="https://github.com/jolpica/jolpica-f1" target="_blank" rel="noreferrer">
            Jolpica F1 API
          </a>
          . Projeto não oficial, sem vínculo com a Formula 1, FIA ou equipes.
        </footer>
      </main>
    </>
  );
}
