import "server-only";

import { buscar } from "./buscar";
import type { OF1Driver, OF1Lap, OF1Meeting, OF1Session, OF1Stint, OF1Weather } from "../types";

const get = <T>(path: string) => buscar<T>("openf1", path);

export const meetings = (year: string) => get<OF1Meeting[]>(`meetings?year=${year}`);
export const raceSessions = (year: string) => get<OF1Session[]>(`sessions?year=${year}&session_name=Race`);
export const drivers = (sessionKey: number) => get<OF1Driver[]>(`drivers?session_key=${sessionKey}`);
export const weather = (sessionKey: number) => get<OF1Weather[]>(`weather?session_key=${sessionKey}`);
export const stints = (sessionKey: number) => get<OF1Stint[]>(`stints?session_key=${sessionKey}`);
export const laps = (sessionKey: number) => get<OF1Lap[]>(`laps?session_key=${sessionKey}`);
