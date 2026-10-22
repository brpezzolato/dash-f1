import { DriverFocus } from "@/components/landing/driver-focus";
import { HighlightsCard, NextRaceCard, StandingsCard } from "@/components/landing/landing-cards";
import { VideoBackground } from "@/components/landing/video-background";
import { GlassNav } from "@/components/nav";
import { getOverview, raceDate, resolveSeason, seasons } from "@/lib/f1";
import { highlights } from "@/lib/videos";

export default async function Home({ searchParams }: { searchParams: Promise<{ season?: string }> }) {
  const season = resolveSeason((await searchParams).season);
  const o = await getOverview(season);
  const [first, second] = o.standings;
  const videos = highlights();

  return (
    <>
      <VideoBackground videos={videos} mp4={process.env.NEXT_PUBLIC_HERO_VIDEO_MP4} />
      <div className="mx-auto max-w-6xl px-4 pt-5 pb-16 sm:px-6">
        <GlassNav active="/" season={season} seasons={seasons()} />

        <main className="glass-strong mt-8 overflow-hidden rounded-[2rem] p-5 sm:p-8">
          <DriverFocus
            driver={first?.driver}
            points={first?.points}
            wins={first?.wins}
            gap={first && second ? first.points - second.points : undefined}
            completed={o.completedRounds}
            total={o.schedule.length}
            season={season}
          />

          <div className="relative z-10 mt-6 grid gap-4 md:grid-cols-3">
            <NextRaceCard race={o.nextRace} circuit={o.nextCircuit} date={o.nextRace ? raceDate(o.nextRace) : undefined} />
            <StandingsCard rows={o.standings} season={season} />
            <HighlightsCard videos={videos} />
          </div>
        </main>

        <p className="text-muted-foreground mt-8 text-center text-xs">
          Dados: Jolpica F1, OpenF1 e MultiViewer · Vídeos: canal oficial da F1 no YouTube · Projeto não oficial.
        </p>
      </div>
    </>
  );
}
