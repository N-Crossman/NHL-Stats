import { NextResponse } from "next/server";

export async function GET() {
  try {
    const response = await fetch("https://api-web.nhle.com/v1/standings/now");
    const data = await response.json();

    const standings = Array.isArray(data?.standings)
      ? data.standings
      : [];

    const teams = standings
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((team: any) => ({
        teamId: team.teamAbbrev?.default,
        name: team.teamName?.default,
        points: team.points,
        gamesPlayed: team.gamesPlayed,
        wins: team.wins,
        losses: team.losses,
        otLosses: team.otLosses,
        logo: team.teamLogo,
      }))
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .sort((a: any, b: any) => b.points - a.points);

    return NextResponse.json({ teams });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ teams: [] });
  }
}