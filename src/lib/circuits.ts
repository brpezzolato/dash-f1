/**
 * Dados fixos dos circuitos (a Jolpica não traz extensão nem número de voltas).
 * Chave: circuitId da Jolpica.
 */
export const CIRCUITS: Record<string, { lengthKm: number; laps: number; firstGp: number }> = {
  albert_park: { lengthKm: 5.278, laps: 58, firstGp: 1996 },
  shanghai: { lengthKm: 5.451, laps: 56, firstGp: 2004 },
  suzuka: { lengthKm: 5.807, laps: 53, firstGp: 1987 },
  bahrain: { lengthKm: 5.412, laps: 57, firstGp: 2004 },
  jeddah: { lengthKm: 6.174, laps: 50, firstGp: 2021 },
  miami: { lengthKm: 5.412, laps: 57, firstGp: 2022 },
  imola: { lengthKm: 4.909, laps: 63, firstGp: 1980 },
  monaco: { lengthKm: 3.337, laps: 78, firstGp: 1950 },
  catalunya: { lengthKm: 4.657, laps: 66, firstGp: 1991 },
  villeneuve: { lengthKm: 4.361, laps: 70, firstGp: 1978 },
  red_bull_ring: { lengthKm: 4.318, laps: 71, firstGp: 1970 },
  silverstone: { lengthKm: 5.891, laps: 52, firstGp: 1950 },
  spa: { lengthKm: 7.004, laps: 44, firstGp: 1950 },
  hungaroring: { lengthKm: 4.381, laps: 70, firstGp: 1986 },
  zandvoort: { lengthKm: 4.259, laps: 72, firstGp: 1952 },
  monza: { lengthKm: 5.793, laps: 53, firstGp: 1950 },
  baku: { lengthKm: 6.003, laps: 51, firstGp: 2016 },
  marina_bay: { lengthKm: 4.94, laps: 62, firstGp: 2008 },
  americas: { lengthKm: 5.513, laps: 56, firstGp: 2012 },
  rodriguez: { lengthKm: 4.304, laps: 71, firstGp: 1963 },
  interlagos: { lengthKm: 4.309, laps: 71, firstGp: 1973 },
  vegas: { lengthKm: 6.201, laps: 50, firstGp: 2023 },
  losail: { lengthKm: 5.419, laps: 57, firstGp: 2021 },
  yas_marina: { lengthKm: 5.281, laps: 58, firstGp: 2009 },
};
