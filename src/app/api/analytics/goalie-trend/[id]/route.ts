import { NextResponse } from "next/server";
import { currentSeasonId, type GoalieStart } from "../../../../lib/analytics";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!/^\d+$/.test(id)) {
    return NextResponse.json({ error: "Invalid player" }, { status: 400 });
  }

  try {
    const response = await fetch(
      `https://api-web.nhle.com/v1/player/${id}/game-log/${currentSeasonId()}/2`,
      { next: { revalidate: 900 } }
    );
    if (response.status === 429) {
      return NextResponse.json({ starts: [], error: "NHL API is busy, try again in a minute" }, { status: 503 });
    }
    if (!response.ok) throw new Error(`Game log request failed: ${response.status}`);

    const data = await response.json();
    const gameLog = Array.isArray(data?.gameLog) ? data.gameLog : [];

    const starts: GoalieStart[] = gameLog
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .filter((g: any) => g.gamesStarted === 1)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((g: any) => ({
        gameId: g.gameId,
        date: g.gameDate,
        team: g.teamAbbrev,
        opponent: g.opponentAbbrev,
        isHome: g.homeRoadFlag === "H",
        shotsAgainst: g.shotsAgainst ?? 0,
        goalsAgainst: g.goalsAgainst ?? 0,
        decision: g.decision ?? "",
      }))
      // The game log is newest first; charts read oldest to newest
      .sort((a: GoalieStart, b: GoalieStart) => a.date.localeCompare(b.date));

    return NextResponse.json({ starts });
  } catch (error) {
    console.error("Error fetching goalie trend:", error);
    return NextResponse.json({ starts: [] }, { status: 502 });
  }
}
