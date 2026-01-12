import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await fetch(
      'https://api-web.nhle.com/v1/goalie-stats-leaders/current?limit=-1',
      { next: { revalidate: 3600 } }
    );
    const data = await response.json();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const playerMap = new Map<number, any>();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Object.entries(data).forEach(([category, players]: [string, any]) => {
      if (Array.isArray(players)) {
        
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        players.forEach((player: any) => {
          const playerId = player.id;

          if (!playerMap.has(playerId)) {
            playerMap.set(playerId, {
              playerId,
              goaltendersFullName: `${player.firstName?.default || ''} ${player.lastName?.default || ''}`.trim(),
              goalsAgainstAverage: 0,
              savePctg: 0,
              shutouts: 0,
              wins: 0,
              headshot: player.headshot || '',
              teamLogo: player.teamLogo || '',
            });
          }

          const currentPlayer = playerMap.get(playerId);
          if (category === 'goalsAgainstAverage') currentPlayer.goalsAgainstAverage = player.value || 0;
          if (category === 'savePctg') currentPlayer.savePctg = player.value || 0;
          if (category === 'shutouts') currentPlayer.shutouts = player.value || 0;
          if (category === 'wins') currentPlayer.wins = player.value || 0;
        });
      }
    });

    // Filter out goalies with 0 wins (inactive/no games played)
    const goalies = Array.from(playerMap.values()).filter((g) => g.wins > 0);

    return NextResponse.json({ goalies });
  } catch (error) {
    console.error('Error fetching goalie stats:', error);
    return NextResponse.json({ goalies: [] });
  }
}
