import { useState } from 'react';
import {
  fetchConstructorStandings,
  fetchDriverStandings,
  fetchLastRace,
  fetchSchedule,
  fetchSeasonResults,
  fetchSeasonSprints,
} from './api';
import { useAsync } from './useAsync';
import { Card } from './components/Card';
import { KpiRow } from './components/KpiRow';
import { DriverStandings } from './components/DriverStandings';
import { ConstructorChart } from './components/ConstructorChart';
import { PointsProgression } from './components/PointsProgression';
import { LastRace } from './components/LastRace';
import { Calendar } from './components/Calendar';

const CURRENT_YEAR = new Date().getFullYear();
const SEASONS = Array.from({ length: CURRENT_YEAR - 1999 }, (_, i) => String(CURRENT_YEAR - i));

export default function App() {
  const [season, setSeason] = useState(SEASONS[0]);

  const drivers = useAsync(() => fetchDriverStandings(season), [season]);
  const constructors = useAsync(() => fetchConstructorStandings(season), [season]);
  const schedule = useAsync(() => fetchSchedule(season), [season]);
  const lastRace = useAsync(() => fetchLastRace(season), [season]);
  const progression = useAsync(
    () => Promise.all([fetchSeasonResults(season), fetchSeasonSprints(season)]),
    [season],
  );

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <span className="logo">F1</span>
          <h1>Dashboard</h1>
        </div>
        <label className="season">
          Temporada
          <select value={season} onChange={(e) => setSeason(e.target.value)}>
            {SEASONS.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
      </header>

      <KpiRow drivers={drivers.data} constructors={constructors.data} schedule={schedule.data} />

      <div className="grid">
        <Card title="Evolução de pontos" subtitle="Top 6 pilotos · corridas + sprints" state={progression} className="span-2">
          {([races, sprints]) => <PointsProgression races={races} sprints={sprints} top={6} />}
        </Card>

        <Card title="Pilotos" subtitle="Classificação" state={drivers} className="scroll">
          {(data) => <DriverStandings standings={data} />}
        </Card>

        <Card title="Construtores" subtitle="Classificação" state={constructors}>
          {(data) => <ConstructorChart standings={data} />}
        </Card>

        <Card
          title="Última corrida"
          subtitle={lastRace.data ? `${lastRace.data.raceName} · ${lastRace.data.Circuit.circuitName}` : undefined}
          state={lastRace}
          className="scroll"
        >
          {(data) => <LastRace race={data} />}
        </Card>

        <Card title="Calendário" subtitle={`${schedule.data?.length ?? ''} etapas`} state={schedule} className="scroll">
          {(data) => <Calendar races={data} />}
        </Card>
      </div>

      <footer className="footer muted">
        Dados: <a href="https://github.com/jolpica/jolpica-f1" target="_blank" rel="noreferrer">Jolpica F1 API</a> (sucessora da Ergast). Projeto não oficial, sem vínculo com a Formula 1.
      </footer>
    </div>
  );
}
