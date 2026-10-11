import Image from "next/image";
import PlayerSearch from "./PlayerSearch";
import SectionHeading from "../components/ui/SectionHeading";

interface SpotlightPlayer {
  playerId: number;
  headshot: string;
  name?: { default: string };
  fullName?: string;
  teamTriCode: string;
}

export default async function PlayersPage() {
  const res = await fetch("https://api-web.nhle.com/v1/player-spotlight", {
    next: { revalidate: 3600 },
  });
  const topPlayers: SpotlightPlayer[] = await res.json();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-10">
      <SectionHeading title="Players" subtitle="Search any player in the league" align="left" />
      <PlayerSearch />

      <div>
        <h2 className="text-xl font-bold text-white mb-4">Top Players</h2>
        <ul className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
          {topPlayers.map((p) => (
            <li
              key={p.playerId}
              className="glass-panel flex flex-col items-center p-3 gap-1 transition-all duration-300 hover:border-cyan-500/50 hover:-translate-y-1"
            >
              <div className="relative h-20 w-20 sm:h-24 sm:w-24 rounded-full overflow-hidden bg-slate-800">
                <Image
                  src={p.headshot}
                  alt={p.name?.default || p.fullName || "Player"}
                  fill
                  className="object-cover"
                />
              </div>
              <p className="font-semibold text-sm text-center text-slate-100 mt-1">
                {p.name?.default || p.fullName}
              </p>
              <p className="text-xs text-cyan-400 font-medium">{p.teamTriCode}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
