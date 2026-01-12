import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await fetch(
      'https://api-web.nhle.com/v1/skater-stats-leaders/current?limit=-1',
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
          // Only track defensemen
          if (player.position !== 'D') return;

          const playerId = player.id;

          if (!playerMap.has(playerId)) {
            playerMap.set(playerId, {
              playerId,
              skaterFullName: `${player.firstName?.default || ''} ${player.lastName?.default || ''}`.trim(),
              position: player.position || '',
              points: 0,
              goals: 0,
              assists: 0,
              gamesPlayed: 0,
              headshot: player.headshot || '',
              teamLogo: player.teamLogo || '',
            });
          }

          const currentPlayer = playerMap.get(playerId);
          if (category === 'points') currentPlayer.points = player.value || 0;
          if (category === 'goals') currentPlayer.goals = player.value || 0;
          if (category === 'assists') currentPlayer.assists = player.value || 0;
        });
      }
    });

    const defensemen = Array.from(playerMap.values());

    return NextResponse.json({ defensemen });
  } catch (error) {
    console.error('Error fetching defensemen stats:', error);
    return NextResponse.json({ defensemen: [] });
  }
}
