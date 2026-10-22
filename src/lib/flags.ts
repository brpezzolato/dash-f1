/** Nacionalidade (formato Ergast) → código ISO 3166-1 alfa-2. */
const NATIONALITY: Record<string, string> = {
  American: "us", Argentine: "ar", Australian: "au", Austrian: "at", Belgian: "be", Brazilian: "br",
  British: "gb", Canadian: "ca", Chinese: "cn", Colombian: "co", Danish: "dk", Dutch: "nl",
  Finnish: "fi", French: "fr", German: "de", Indian: "in", Indonesian: "id", Irish: "ie",
  Italian: "it", Japanese: "jp", Malaysian: "my", Mexican: "mx", Monegasque: "mc", "New Zealander": "nz",
  Polish: "pl", Portuguese: "pt", Russian: "ru", Spanish: "es", Swedish: "se", Swiss: "ch",
  Thai: "th", Venezuelan: "ve", Argentinian: "ar", Estonian: "ee", Hungarian: "hu", Czech: "cz",
};

export function flagFor(nationality?: string): string | undefined {
  return nationality ? NATIONALITY[nationality] : undefined;
}

export const flagUrl = (iso2: string) => `https://flagcdn.com/w40/${iso2}.png`;
