import { NextResponse } from "next/server";
import { withPlayoffPace, type StandingsTeam } from "../../../lib/analytics";

export async function GET() {
  try {
    const response = await fetch("https://api-web.nhle.com/v1/standings/now", {
      next: { revalidate: 900 },
    });
    if (!response.ok) throw new Error(`Standings request failed: ${response.status}`);

    const data = await response.json();
    const standings = Array.isArray(data?.standings) ? data.standings : [];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const teams: StandingsTeam[] = standings.map((team: any) => ({
      abbrev: team.teamAbbrev?.default,
      name: team.teamName?.default,
      logo: team.teamLogo,
      conference: team.conferenceAbbrev,
      divisionName: team.divisionName,
      divisionSequence: team.divisionSequence,
      wildcardSequence: team.wildcardSequence,
      gamesPlayed: team.gamesPlayed,
      points: team.points,
      wins: team.wins,
      losses: team.losses,
      otLosses: team.otLosses,
      goalsFor: team.goalFor,
      goalsAgainst: team.goalAgainst,
      l10: {
        wins: team.l10Wins,
        losses: team.l10Losses,
        otLosses: team.l10OtLosses,
        goalDifferential: team.l10GoalDifferential,
      },
      home: {
        gamesPlayed: team.homeGamesPlayed,
        wins: team.homeWins,
        losses: team.homeLosses,
        otLosses: team.homeOtLosses,
        points: team.homePoints,
        goalsFor: team.homeGoalsFor,
        goalsAgainst: team.homeGoalsAgainst,
      },
      road: {
        gamesPlayed: team.roadGamesPlayed,
        wins: team.roadWins,
        losses: team.roadLosses,
        otLosses: team.roadOtLosses,
        points: team.roadPoints,
        goalsFor: team.roadGoalsFor,
        goalsAgainst: team.roadGoalsAgainst,
      },
    }));

    return NextResponse.json({ teams: withPlayoffPace(teams) });
  } catch (error) {
    console.error("Error fetching analytics standings:", error);
    return NextResponse.json({ teams: [] }, { status: 502 });
  }
}
