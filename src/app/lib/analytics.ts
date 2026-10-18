/** Pure helpers for the Analytics page. API routes shape the data, these do the math. */

export const SEASON_GAMES = 82;

export type Conference = "E" | "W";

export type SplitRecord = {
  gamesPlayed: number;
  wins: number;
  losses: number;
  otLosses: number;
  points: number;
  goalsFor: number;
  goalsAgainst: number;
};

export type StandingsTeam = {
  abbrev: string;
  name: string;
  logo: string;
  conference: Conference;
  divisionName: string;
  divisionSequence: number;
  /** 0 = top-3 division spot, 1–2 = wild card, 3+ = outside the playoffs */
  wildcardSequence: number;
  gamesPlayed: number;
  points: number;
  wins: number;
  losses: number;
  otLosses: number;
  goalsFor: number;
  goalsAgainst: number;
  l10: { wins: number; losses: number; otLosses: number; goalDifferential: number };
  home: SplitRecord;
  road: SplitRecord;
};

export type PlayoffPaceTeam = StandingsTeam & {
  projectedPoints: number;
  /** Points ahead (+) or behind (−) the cutoff team right now */
  gapNow: number;
  /** Projected points ahead (+) or behind (−) the cutoff team's projection */
  gapPace: number;
  cutoffAbbrev: string;
  cutoffPace: number;
};

export type SpecialTeamsTeam = {
  abbrev: string;
  name: string;
  logo: string;
  conference: Conference;
  gamesPlayed: number;
  /** Fractions, e.g. 0.214 */
  powerPlayPct: number;
  penaltyKillPct: number;
};

export type GameResult = "W" | "L" | "OTL";

export type TeamGame = {
  gameId: number;
  date: string;
  opponent: string;
  isHome: boolean;
  /** Goals for/against from the final score (includes the shootout winner's goal, as standings do) */
  goalsFor: number;
  goalsAgainst: number;
  result: GameResult;
  /** "REG" | "OT" | "SO" */
  decidedIn: string;
};

export type RollingFormPoint = TeamGame & {
  game: number;
  rollingGoalsFor: number;
  rollingGoalsAgainst: number;
  goalDifferential: number;
};

/** Per-game GF/GA averaged over the previous `window` games (including this one). */
export function rollingForm(games: TeamGame[], window: number): RollingFormPoint[] {
  return games.map((g, i) => {
    const slice = games.slice(Math.max(0, i - window + 1), i + 1);
    return {
      ...g,
      game: i + 1,
      rollingGoalsFor: average(slice.map((s) => s.goalsFor)),
      rollingGoalsAgainst: average(slice.map((s) => s.goalsAgainst)),
      goalDifferential: g.goalsFor - g.goalsAgainst,
    };
  });
}

/** NHL season id for the season in progress, e.g. "20262027". Seasons roll over in October. */
export function currentSeasonId(date = new Date()): string {
  const startYear = date.getMonth() >= 9 ? date.getFullYear() : date.getFullYear() - 1;
  return `${startYear}${startYear + 1}`;
}

/** Lowercases and strips accents so "Montréal Canadiens" matches "Montreal Canadiens". */
export function normalizeTeamName(name: string): string {
  return name.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
}

export function average(values: number[]): number {
  return values.length ? values.reduce((sum, v) => sum + v, 0) / values.length : 0;
}

/** Points per game extrapolated to a full season. */
export function projectPoints(points: number, gamesPlayed: number): number {
  if (gamesPlayed <= 0) return 0;
  return (points / gamesPlayed) * SEASON_GAMES;
}

/**
 * The last playoff spot in a conference is the second wild card (wildcardSequence 2).
 * Falls back to 8th by points if the API hasn't assigned wild card positions yet.
 */
export function findCutoffTeam<T extends StandingsTeam>(conferenceTeams: T[]): T | undefined {
  return (
    conferenceTeams.find((t) => t.wildcardSequence === 2) ??
    [...conferenceTeams].sort((a, b) => b.points - a.points)[7]
  );
}

/** Adds pace and gap-to-cutoff fields, computed per conference. */
export function withPlayoffPace(teams: StandingsTeam[]): PlayoffPaceTeam[] {
  return (["E", "W"] as const).flatMap((conference) => {
    const conferenceTeams = teams.filter((t) => t.conference === conference);
    const cutoff = findCutoffTeam(conferenceTeams);
    if (!cutoff) return [];

    const cutoffPace = projectPoints(cutoff.points, cutoff.gamesPlayed);

    return conferenceTeams.map((t) => {
      const projectedPoints = projectPoints(t.points, t.gamesPlayed);
      return {
        ...t,
        projectedPoints,
        gapNow: t.points - cutoff.points,
        gapPace: projectedPoints - cutoffPace,
        cutoffAbbrev: cutoff.abbrev,
        cutoffPace,
      };
    });
  });
}

/** Points earned as a share of points available (2 per game). Null until a game is played. */
export function pointsPct(split: { points: number; gamesPlayed: number }): number | null {
  if (split.gamesPlayed <= 0) return null;
  return split.points / (split.gamesPlayed * 2);
}

/** Formats a W-L-OT record, e.g. "5-1-0" */
export function formatRecord(r: { wins: number; losses: number; otLosses: number }): string {
  return `${r.wins}-${r.losses}-${r.otLosses}`;
}

/** Playoff position, e.g. "Pacific #2", "Wild card 1", "Outside". */
export function playoffPositionLabel(t: StandingsTeam): string {
  if (t.wildcardSequence === 0) return `${t.divisionName} #${t.divisionSequence}`;
  if (t.wildcardSequence <= 2) return `Wild card ${t.wildcardSequence}`;
  return "Outside playoff spot";
}

/** Formats a signed number: +4.2 / −1.0 / 0.0 */
export function formatSigned(value: number, digits = 1): string {
  const rounded = Number(value.toFixed(digits));
  if (rounded > 0) return `+${rounded.toFixed(digits)}`;
  if (rounded < 0) return `−${Math.abs(rounded).toFixed(digits)}`;
  return (0).toFixed(digits);
}
