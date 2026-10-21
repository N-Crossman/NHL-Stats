import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // "now" returns the NHL's current game day, which doesn't roll over at UTC midnight
    // like toISOString() does, so evening games stay on the right day
    const response = await fetch("https://api-web.nhle.com/v1/score/now", { cache: "no-store" });
    const data = await response.json();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const games = (data.games || []).map((game: any) => ({
      gamePk: game.id,
      gameDate: game.startTimeUTC,

      clock: {
        timeRemaining: game.clock?.timeRemaining ?? null,
        inIntermission: game.clock?.inIntermission ?? false,
      },

      period:{
         number: game.periodDescriptor?.number ?? null,
         type: game.periodDescriptor?.type ?? null,
      },

      homeTeam: {
        name: game.homeTeam.name.default,
        score: game.homeTeam.score,
        logo: game.homeTeam.logo,
        darkLogo: game.homeTeam.darkLogo,
      },
      awayTeam: {
        name: game.awayTeam.name.default,
        score: game.awayTeam.score,
        logo: game.awayTeam.logo,
        darkLogo: game.awayTeam.darkLogo,
      },
      status: game.gameState,
    }));
    
    return NextResponse.json({ date: data.currentDate ?? null, games });
  } catch {
    return NextResponse.json({ error: "Unable to fetch today's games" }, { status: 500 });
  }
}