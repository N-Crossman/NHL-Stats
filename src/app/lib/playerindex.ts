export interface PlayerIndexEntry {
  id: string;
  name: string;
}

let cache: PlayerIndexEntry[] | null = null;

function deduplicate(players: PlayerIndexEntry[]) {
  const map = new Map<string, PlayerIndexEntry>();
  players.forEach(player => map.set(player.id, player));
  return Array.from(map.values());
}

export async function getPlayerIndex(): Promise<PlayerIndexEntry[]> {
  if (cache) return cache;

  const base = "https://api-web.nhle.com/v1";

  const [spotlightRes, skaterRes, goalieRes] = await Promise.all([
    fetch(`${base}/player-spotlight`, { next: { revalidate: 3600 } }),
    fetch(`${base}/skater-stats-leaders/current?limit=-1`, { next: { revalidate: 3600 } }),
    fetch(`${base}/goalie-stats-leaders/current?limit=-1`, { next: { revalidate: 3600 } })
  ]);

  const spotlight = await spotlightRes.json();
  const skaters = await skaterRes.json();
  const goalies = await goalieRes.json();

  const index: PlayerIndexEntry[] = [];

  // Spotlight players
  (spotlight ?? []).forEach((p: any) => {
    if (p.playerId && p.name?.default) {
      index.push({ id: String(p.playerId), name: p.name.default });
    }
  });

  // Skaters
  Object.values(skaters ?? {}).forEach((arr: any) => {
    (arr ?? []).forEach((p: any) => {
      if (p.id && p.firstName?.default && p.lastName?.default) {
        index.push({ id: String(p.id), name: `${p.firstName.default} ${p.lastName.default}` });
      }
    });
  });

  // Goalies
  Object.values(goalies ?? {}).forEach((arr: any) => {
    (arr ?? []).forEach((p: any) => {
      if (p.id && p.firstName?.default && p.lastName?.default) {
        index.push({ id: String(p.id), name: `${p.firstName.default} ${p.lastName.default}` });
      }
    });
  });

  cache = deduplicate(index);
  return cache;
}
