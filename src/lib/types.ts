export interface Driver {
  driverId: string;
  code?: string;
  permanentNumber?: string;
  givenName: string;
  familyName: string;
  nationality: string;
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
  position: string;
  positionText: string;
  points: string;
  grid: string;
  status: string;
  Driver: Driver;
  Constructor: Constructor;
  Time?: { time: string };
  FastestLap?: { rank: string; Time: { time: string } };
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
    Location: { locality: string; country: string };
  };
  Results?: Result[];
  SprintResults?: Result[];
  Sprint?: { date: string; time?: string };
}

/** Pontos acumulados por etapa, já prontos para o gráfico. */
export interface Progression {
  rows: Array<{ round: string; race: string } & Record<string, number | string>>;
  drivers: Array<{ id: string; code: string; color: string; dashed: boolean }>;
}

export interface SeasonData {
  season: string;
  drivers: DriverStanding[];
  constructors: ConstructorStanding[];
  schedule: Race[];
  lastRace?: Race;
  progression: Progression;
}
