import { NextResponse } from "next/server";
import type { GameResult, TeamGame } from "../../../../lib/analytics";

const REGULAR_SEASON = 2;
const COMPLETED_STATES = new Set(["OFF", "FINAL"]);

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ abbrev: string }> }
) {
  const { abbrev } = await params;
  const upperAbbrev = abbrev.toUpperCase();
  if (!/^[A-Z]{3}$/.test(upperAbbrev)) {
    return NextResponse.json({ error: "Invalid team" }, { status: 400 });
  }

  try {
    const response = await fetch(
      `https://api-web.nhle.com/v1/club-schedule-season/${upperAbbrev}/now`,
      { next: { revalidate: 900 } }
    );
    if (response.status === 429) {
      return NextResponse.json({ games: [], error: "NHL API is busy, try again in a minute" }, { status: 503 });
    }
    if (!response.ok) throw new Error(`Schedule request failed: ${response.status}`);

    const data = await response.json();
    const schedule = Array.isArray(data?.games) ? data.games : [];

    const games: TeamGame[] = schedule
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .filter((g: any) => g.gameType === REGULAR_SEASON && COMPLETED_STATES.has(g.gameState))
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((g: any) => {
        const isHome = g.homeTeam?.abbrev === upperAbbrev;
        const us = isHome ? g.homeTeam : g.awayTeam;
        const them = isHome ? g.awayTeam : g.homeTeam;
        const decidedIn: string = g.gameOutcome?.lastPeriodType ?? "REG";
        const result: GameResult = us.score > them.score ? "W" : decidedIn === "REG" ? "L" : "OTL";

        // Final scores include the shootout winner's goal, matching how standings count GF/GA
        return {
          gameId: g.id,
          date: g.gameDate,
          opponent: them.abbrev,
          isHome,
          goalsFor: us.score,
          goalsAgainst: them.score,
          result,
          decidedIn,
        };
      })
      .sort((a: TeamGame, b: TeamGame) => a.date.localeCompare(b.date));

    return NextResponse.json({ games });
  } catch (error) {
    console.error("Error fetching team form:", error);
    return NextResponse.json({ games: [] }, { status: 502 });
  }
}
