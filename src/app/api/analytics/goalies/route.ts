import { NextResponse } from "next/server";
import { currentSeasonId } from "../../../lib/analytics";

/** Keeps the fetch to goalies with enough starts for a trend */
const MIN_STARTS = 3;

export async function GET() {
  try {
    const response = await fetch(
      `https://api.nhle.com/stats/rest/en/goalie/summary?limit=-1&cayenneExp=seasonId=${currentSeasonId()}%20and%20gameTypeId=2`,
      { next: { revalidate: 900 } }
    );
    if (!response.ok) throw new Error(`Goalie summary request failed: ${response.status}`);

    const data = await response.json();
    const rows = Array.isArray(data?.data) ? data.data : [];

    const goalies = rows
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .filter((g: any) => g.gamesStarted >= MIN_STARTS)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((g: any) => ({
        playerId: g.playerId,
        name: g.goalieFullName,
        lastName: g.lastName,
        // Traded goalies list every team, e.g. "TOR,BOS" — show the most recent
        team: String(g.teamAbbrevs ?? "").split(",").pop() ?? "",
        gamesStarted: g.gamesStarted,
        savePct: g.savePct ?? 0,
      }));

    // League save % across every goalie: total saves / total shots
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const shots = rows.reduce((sum: number, g: any) => sum + (g.shotsAgainst ?? 0), 0);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const saves = rows.reduce((sum: number, g: any) => sum + (g.saves ?? 0), 0);

    return NextResponse.json({ goalies, leagueSavePct: shots > 0 ? saves / shots : null });
  } catch (error) {
    console.error("Error fetching goalies:", error);
    return NextResponse.json({ goalies: [], leagueSavePct: null }, { status: 502 });
  }
}
