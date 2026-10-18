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
