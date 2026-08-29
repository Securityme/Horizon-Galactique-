export * from "../lib/contracts";

export type UtilityId =
  | "UTL-ELE"
  | "UTL-O2"
  | "UTL-EAU"
  | "UTL-USE"
  | "UTL-CHA"
  | "UTL-CLI"
  | "UTL-H2"
  | "UTL-GAZ"
  | "UTL-DAT";

export interface GameSetup {
  systemId: string;
  planetId: string;
  archetypeId: string;
  leaderName: string;
  dynastyName: string;
  seed: number;
  starType?: string;
  asteroidDensity?: string;
  planetGravity?: string;
  planetAtmosphere?: string;
  surfaceSoil?: string;
  archeModuleFocus?: string;
  leaderPerk?: string;
}


