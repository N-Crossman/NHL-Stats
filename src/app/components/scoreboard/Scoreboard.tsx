"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Card from "../ui/Card";
import SectionHeading from "../ui/SectionHeading";
import { LoadingState, ErrorState, EmptyState } from "../ui/StateMessage";

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
  clock: {
    timeRemaining: string | null;
    inIntermission: boolean;
  };
  period: {
    number: number | null;
    type: string | null;
  };
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
    clock: {
        timeRemaining: string | null;
        inIntermission: boolean;
    };
    period: number | null;
}

function formatGameStatus(status: string): string {
    const statusMap: { [key: string]: string } = {
        "FUT": "Scheduled", // The game is scheuled for a future time
        "LIVE": "In Progress", // The game is currently being played
        "OFF": "Final", // The game has ended
        "PPD": "Postponed", // The game has been postponed
        "PRE" : "Pre-Game", // The game is in pre-game status, usually 30 minutes before start
        "CRIT" : "Crunch Time", // The game is in late third period, often in the final minutes
        "FINAL" : "Final", // The game has ended
        "OVER" : "Final" // The game has ended
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
            clock: game.clock,
            period: game.period,
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

  return (
    <Card className="p-4 sm:p-6">
      <SectionHeading title="NHL Scoreboard" />

      {error ? (
        <ErrorState message={error} />
      ) : loading ? (
        <LoadingState label="Loading today's games..." />
      ) : games.length === 0 ? (
        <EmptyState message="No games scheduled for today." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {games.map((game, index) => {
            const isLive = game.status === "In Progress";
            return (
              <div
                key={game.id || index}
                className="bg-slate-800/60 backdrop-blur-md border border-slate-700/50 rounded-xl p-3 sm:p-4 shadow-lg hover:shadow-xl hover:border-slate-600 transition-all duration-300 hover:scale-[1.02]"
              >
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2 sm:gap-3 flex-1">
                    {game.awayTeam.logo && (
                      <div className="relative w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0">
                        <Image
                          src={game.awayTeam.logo}
                          alt={`${game.awayTeam.name} logo`}
                          fill
                          className="object-contain"
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
                      <div className="relative w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0">
                        <Image
                          src={game.homeTeam.logo}
                          alt={`${game.homeTeam.name} logo`}
                          fill
                          className="object-contain"
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
                <div className="border-t border-slate-700/50 pt-2 flex items-center justify-center gap-1.5">
                  {isLive && (
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse-live" />
                  )}
                  <p
                    className={`text-center text-xs sm:text-sm font-medium ${
                      isLive
                        ? "text-emerald-400"
                        : game.status === "Final"
                        ? "text-slate-400"
                        : "text-cyan-400"
                    }`}
                  >
                    {isLive
                      ? `P${game.period?.number ?? "?"}${game.period?.type === "OVERTIME" ? " OT" : game.period?.type === "SHOOTOUT" ? " SO" : ""} • ${game.clock?.timeRemaining ?? "00:00"}`
                      : `${game.status} • ${game.localTime}`}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}