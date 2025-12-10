"use client";
import { useEffect, useState } from "react";
import Image from "next/image";

interface TeamInfo {
  name: string;
  score: number;
  logo: string;
  darkLogo: string;
}

interface GameInfo {
  id: number;
  homeTeam: TeamInfo;
  awayTeam: TeamInfo;
  status: string;
  localTime: string;
}

interface NHLApiGame {
    gamePk: number;
    gameDate: string;
    homeTeam: {
        name: string;
        score: number;
        logo?: string;
        darkLogo?: string;
    };
    awayTeam: {
        name: string;
        score: number;
        logo?: string;
        darkLogo?: string;
    };
    status: string;
}

function formatGameStatus(status: string): string {
    const statusMap: { [key: string]: string } = {
        "FUT": "Scheduled",
        "LIVE": "In Progress",
        "FINAL": "Final",
        "PPD": "Postponed",
        "Cancelled": "Cancelled",
        "PRE" : "Pre-Game"
    };
    return statusMap[status] || status;
}

export default function Scoreboard() {
  const [games, setGames] = useState<GameInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchGames() {
      try {
        const response = await fetch("/api/todaysGames");
        if (!response.ok) throw new Error("Failed to fetch NHL games");

        const data = await response.json();

        if (!data.games || data.games.length === 0) {
          setGames([]);
          return;
        }

        const parsedGames: GameInfo[] = data.games.map((game: NHLApiGame) => {
          const gameDate = new Date(game.gameDate);
          const localTime = gameDate.toLocaleTimeString('en-US', {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
            timeZoneName: "short",
          });

          return {
            id: game.gamePk,
            homeTeam: {
              name: game.homeTeam.name,
              score: game.homeTeam.score,
              logo: game.homeTeam.darkLogo || game.homeTeam.logo || '',
            },
            awayTeam: {
              name: game.awayTeam.name,
              score: game.awayTeam.score,
              logo: game.awayTeam.darkLogo || game.awayTeam.logo || '',
            },
            status: formatGameStatus(game.status),
            localTime,
          };
        });

        setGames(parsedGames);
      } catch (err) {
        console.error(err);
        setError("Unable to load scoreboard. Please try again later.");
      } finally {
        setLoading(false);
      }
    }

    fetchGames();
  }, []);

  if (error) return <p className="text-center mt-4 text-red-500">{error}</p>;
  if (loading) return <p className="text-center mt-4">Loading today&rsquo;s games...</p>;

   return (
    <div className="w-full p-4 sm:p-6">
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl shadow-2xl p-4 sm:p-6 max-w-6xl mx-auto backdrop-blur-sm border border-slate-700/50">
        <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-center bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
          NHL Scoreboard
        </h2>
        {games.length === 0 ? (
          <p className="text-center text-slate-400 py-8">No games scheduled for today.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {games.map((game, index) => (
              <div 
                key={game.id || index} 
                className="bg-slate-800/60 backdrop-blur-md border border-slate-700/50 rounded-xl p-3 sm:p-4 shadow-lg hover:shadow-xl hover:border-slate-600 transition-all duration-300 hover:scale-[1.02]"
              >
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2 sm:gap-3 flex-1">
                    {game.awayTeam.logo && (
                      <div className="w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0">
                        <Image
                          src={game.awayTeam.logo}
                          alt={`${game.awayTeam.name} logo`}
                          width={40}
                          height={40}
                          className="object-contain w-full h-full"
                        />
                      </div>
                    )}
                    <p className="font-semibold text-sm sm:text-base text-slate-100">
                      {game.awayTeam.name}
                    </p>
                  </div>
                  <p className="text-xl sm:text-2xl font-bold text-white ml-2">
                    {game.awayTeam.score}
                  </p>
                </div>
                <div className="text-center my-1 sm:my-2">
                  <span className="text-xs sm:text-sm font-semibold text-slate-500">vs</span>
                </div>
                <div className="flex justify-between items-center mb-2 sm:mb-3">
                  <div className="flex items-center gap-2 sm:gap-3 flex-1">
                    {game.homeTeam.logo && (
                      <div className="w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0">
                        <Image
                          src={game.homeTeam.logo}
                          alt={`${game.homeTeam.name} logo`}
                          width={40}
                          height={40}
                          className="object-contain w-full h-full"
                        />
                      </div>
                    )}
                    <p className="font-semibold text-sm sm:text-base text-slate-100">
                      {game.homeTeam.name}
                    </p>
                  </div>
                  <p className="text-xl sm:text-2xl font-bold text-white ml-2">
                    {game.homeTeam.score}
                  </p>
                </div>
                <div className="border-t border-slate-700/50 pt-2">
                  <p
                    className={`text-center text-xs sm:text-sm font-medium ${
                      game.status === "In Progress" 
                        ? "text-emerald-400" 
                        : game.status === "Final"
                        ? "text-slate-400"
                        : "text-cyan-400"
                    }`}
                  >
                    {game.status} • {game.localTime}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}