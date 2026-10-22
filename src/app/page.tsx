import { HomeScreen } from "@/components/home/home-screen";
import { getHome, resolveSeason, seasons } from "@/lib/f1";
import { highlights } from "@/lib/videos";

export default async function Home({ searchParams }: { searchParams: Promise<{ season?: string }> }) {
  const season = resolveSeason((await searchParams).season);
  const d = await getHome(season);
  const race = d.lastRace;
  const winner = race?.leaderboard[0];

  return (
    <HomeScreen
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
        video: highlights()[0],
        videoMp4: process.env.NEXT_PUBLIC_HERO_VIDEO_MP4,
      }}
    />
  );
}
