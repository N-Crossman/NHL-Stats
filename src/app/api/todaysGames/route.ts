import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const today = new Date().toISOString().split("T")[0];
    const response = await fetch(`https://api-web.nhle.com/v1/score/${today}`);
    const data = await response.json();
    const games = (data.games || []).map((game: any) => ({
      gamePk: game.id,
      gameDate: game.gameDate,
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
    
    return NextResponse.json({ games });
  } catch {
    return NextResponse.json({ error: "Unable to fetch today's games" }, { status: 500 });
  }
}