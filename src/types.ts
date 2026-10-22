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
  position?: string;
  positionText: string;
  points: string;
  wins: string;
  Driver: Driver;
  Constructors: Constructor[];
}

export interface ConstructorStanding {
  position?: string;
  positionText: string;
  points: string;
  wins: string;
  Constructor: Constructor;
}

export interface Circuit {
  circuitId: string;
  circuitName: string;
  Location: { locality: string; country: string };
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
  Circuit: Circuit;
  Results?: Result[];
  SprintResults?: Result[];
  Sprint?: { date: string; time?: string };
}
