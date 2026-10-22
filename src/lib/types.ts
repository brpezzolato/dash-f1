/* ---------- Jolpica (formato Ergast) ---------- */

export interface Driver {
  driverId: string;
  code?: string;
  permanentNumber?: string;
  givenName: string;
  familyName: string;
  nationality: string;
  dateOfBirth?: string;
}

export interface Constructor {
  constructorId: string;
  name: string;
  nationality: string;
}

export interface DriverStanding {
  positionText: string;
  points: string;
  wins: string;
  Driver: Driver;
  Constructors: Constructor[];
}

export interface ConstructorStanding {
  positionText: string;
  points: string;
  wins: string;
  Constructor: Constructor;
}

export interface Result {
  number: string;
  position: string;
  positionText: string;
  points: string;
  grid: string;
  laps: string;
  status: string;
  Driver: Driver;
  Constructor: Constructor;
  Time?: { time: string };
  FastestLap?: { rank: string; lap: string; Time: { time: string } };
}

export interface Race {
  season: string;
  round: string;
  raceName: string;
  date: string;
  time?: string;
  Circuit: {
    circuitId: string;
    circuitName: string;
    Location: { locality: string; country: string; lat: string; long: string };
  };
  Results?: Result[];
  SprintResults?: Result[];
  Sprint?: { date: string; time?: string };
}

/* ---------- OpenF1 ---------- */

export interface OF1Meeting {
  meeting_key: number;
  meeting_name: string;
  circuit_key: number;
  circuit_short_name: string;
  location: string;
  country_name: string;
  country_code: string;
  date_start: string;
  year: number;
}

export interface OF1Session {
  session_key: number;
  meeting_key: number;
  session_name: string;
  session_type: string;
  date_start: string;
  date_end: string;
  circuit_key: number;
  circuit_short_name: string;
  location: string;
  country_name: string;
  year: number;
}

export interface OF1Driver {
  driver_number: number;
  full_name: string;
  name_acronym: string;
  first_name?: string;
  last_name?: string;
  team_name: string;
  team_colour?: string;
  headshot_url?: string;
  country_code?: string;
}

export interface OF1Weather {
  date: string;
  air_temperature: number;
  track_temperature: number;
  humidity: number;
  rainfall: number;
  wind_speed: number;
  pressure: number;
}

export interface OF1Stint {
  driver_number: number;
  stint_number: number;
  lap_start: number;
  lap_end: number;
  compound: string;
  tyre_age_at_start: number;
}

export interface OF1Lap {
  driver_number: number;
  lap_number: number;
  lap_duration: number | null;
  is_pit_out_lap: boolean;
  st_speed?: number | null;
}

/* ---------- MultiViewer ---------- */

export interface MVCircuit {
  x: number[];
  y: number[];
  rotation: number;
  corners?: Array<{ number: number; letter?: string; angle: number; trackPosition: { x: number; y: number } }>;
}

/* ---------- Modelos já tratados para a interface ---------- */

export interface TrackMap {
  /** Caminho SVG normalizado num viewBox 0 0 1000 1000. */
  path: string;
  corners: Array<{ number: string; x: number; y: number }>;
  start: { x: number; y: number };
}

export interface CircuitInfo {
  name: string;
  locality: string;
  country: string;
  lengthKm?: number;
  laps?: number;
  firstGp?: number;
  map?: TrackMap;
}

export interface WeatherSummary {
  airTemp: number;
  trackTemp: number;
  humidity: number;
  windSpeed: number;
  rain: boolean;
}

export interface TeamInfo {
  id: string;
  name: string;
  color: string;
}

export interface DriverInfo {
  id: string;
  code: string;
  number?: number;
  givenName: string;
  familyName: string;
  team: TeamInfo;
  headshot?: string;
  countryCode?: string;
  /** Código ISO de 2 letras do país do piloto, para a bandeira. */
  flag?: string;
}

export interface LeaderboardRow {
  position: string;
  driver: DriverInfo;
  grid: number;
  laps: number;
  gap: string;
  points: number;
  bestLap?: string;
  fastest: boolean;
  /** Compostos usados na corrida, na ordem. */
  tyres: string[];
  /** Pneu com que terminou e quantas voltas ele tinha. */
  finalTyre?: { compound: string; laps: number };
  /** Distância para o líder em segundos (ou voltas inteiras, se retardatário). */
  gapSeconds?: number;
  lapsDown: number;
  finished: boolean;
}

export interface StrategyRow {
  driver: DriverInfo;
  totalLaps: number;
  stints: Array<{ compound: string; from: number; to: number; age: number }>;
}

export interface LapDistribution {
  driver: DriverInfo;
  /** Tempos de volta em segundos, só voltas “limpas”. */
  laps: number[];
  min: number;
  q1: number;
  median: number;
  q3: number;
  max: number;
}

export interface PointsSeries {
  rows: Array<{ round: string; race: string } & Record<string, number | string>>;
  drivers: Array<{ id: string; code: string; color: string; dashed: boolean }>;
}

/** Números de um piloto na temporada, calculados a partir dos resultados. */
export interface DriverSeasonStats {
  races: number;
  points: number;
  sprintPoints: number;
  wins: number;
  podiums: number;
  poles: number;
  top10: number;
  dnfs: number;
  fastestLaps: number;
  bestFinish?: number;
  avgFinish?: number;
  avgGrid?: number;
  positionsGained: number;
  pointsPerRace: number;
  /** Participação nos pontos da própria equipe (0–1). */
  teamShare: number;
  gapToLeader: number;
  age?: number;
  /** Posição de chegada por etapa (null = abandono/ausente). */
  form: Array<{ round: string; position: number | null }>;
}
