import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Derive active teams from standings
    const standingsRes = await fetch("https://api-web.nhle.com/v1/standings/now");
    if (standingsRes.ok) {
      const standingsData = await standingsRes.json();
      const standings = Array.isArray(standingsData?.standings) ? standingsData.standings : [];
      const teamsFromStandings = standings.map((t: any) => ({
        teamId: t.teamAbbrev?.default ?? t.teamAbbrev,
        name: t.teamName?.default ?? t.teamName,
        abbrev: t.teamAbbrev?.default ?? t.teamAbbrev,
        logo: t.teamLogo ?? null,
        darkLogo: null,
      }));
      return NextResponse.json({ teams: teamsFromStandings });
    }

    return NextResponse.json({ teams: [] });
  } catch {
    console.error("/api/teams error");
    return NextResponse.json({ teams: [] });
  }
}
