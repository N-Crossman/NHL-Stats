import { NextResponse } from "next/server";
import {
  average,
  currentSeasonId,
  normalizeTeamName,
  type SpecialTeamsTeam,
} from "../../../lib/analytics";

export async function GET() {
  try {
    const seasonId = currentSeasonId();
    const [summaryResponse, standingsResponse] = await Promise.all([
      fetch(
        `https://api.nhle.com/stats/rest/en/team/summary?cayenneExp=seasonId=${seasonId}%20and%20gameTypeId=2`,
        { next: { revalidate: 900 } }
      ),
      // Standings supply abbrev, logo and conference, which the stats API doesn't
      fetch("https://api-web.nhle.com/v1/standings/now", { next: { revalidate: 900 } }),
    ]);
    if (!summaryResponse.ok) throw new Error(`Team summary request failed: ${summaryResponse.status}`);
    if (!standingsResponse.ok) throw new Error(`Standings request failed: ${standingsResponse.status}`);

    const summaryData = await summaryResponse.json();
    const standingsData = await standingsResponse.json();
    const summaries = Array.isArray(summaryData?.data) ? summaryData.data : [];
    const standings = Array.isArray(standingsData?.standings) ? standingsData.standings : [];

    // The stats API only identifies teams by numeric id and full name, so join on name
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const standingsByName = new Map<string, any>(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      standings.map((team: any) => [normalizeTeamName(team.teamName?.default ?? ""), team])
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const teams: SpecialTeamsTeam[] = summaries.flatMap((summary: any) => {
      const team = standingsByName.get(normalizeTeamName(summary.teamFullName ?? ""));
      if (!team || summary.gamesPlayed <= 0) return [];
      return [
        {
          abbrev: team.teamAbbrev?.default,
          name: team.teamName?.default,
          logo: team.teamLogoDark ?? team.teamLogo,
          conference: team.conferenceAbbrev,
          gamesPlayed: summary.gamesPlayed,
          powerPlayPct: summary.powerPlayPct ?? 0,
          penaltyKillPct: summary.penaltyKillPct ?? 0,
        },
      ];
    });

    return NextResponse.json({
      teams,
      league: {
        powerPlayPct: average(teams.map((t) => t.powerPlayPct)),
        penaltyKillPct: average(teams.map((t) => t.penaltyKillPct)),
      },
    });
  } catch (error) {
    console.error("Error fetching special teams:", error);
    return NextResponse.json({ teams: [], league: null }, { status: 502 });
  }
}
