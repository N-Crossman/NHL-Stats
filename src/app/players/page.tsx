import PlayerSearch from "./PlayerSearch";

export default async function PlayersPage() {
  const res = await fetch("https://api-web.nhle.com/v1/player-spotlight", {
    next: { revalidate: 3600 },
  });
  const topPlayers = await res.json();

  return (
    <section className="max-w-4xl mx-auto py-10 space-y-10">
      <PlayerSearch />

      <h2 className="text-xl font-bold">Top Players</h2>
      <ul className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4 items-center">
        {topPlayers.map((p: any) => (
          <li key={p.playerId} className="flex flex-col items-center space-py-1">
            <img
              src={p.headshot}
              alt={p.name?.default || p.fullName}
              className="w-28 h-28 rounded-full object-cover mb-2"
            />
            <p className="font-semibold text-sm text-center">{p.name?.default || p.fullName}</p>
            <p className="text-sm text-gray-400 mb-2">{p.teamTriCode}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
