"use client";
import { useEffect, useState } from "react";

interface TeamInfo {
  name: string;
  score: number;
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
    };
    awayTeam: {
        name: string;
        score: number;
    };
    status: string;
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
          const localTime = new Date(game.gameDate).toLocaleTimeString([], {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          });

          return {
            id: game.gamePk,
            homeTeam: {
              name: game.homeTeam.name,
              score: game.homeTeam.score,
            },
            awayTeam: {
              name: game.awayTeam.name,
              score: game.awayTeam.score,
            },
            status: game.status,
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
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4 text-center">NHL Scoreboard</h2>
      {games.length === 0 ? (
        <p className="text-center">No games scheduled for today.</p>
      ) : (
        <div className="space-y-4">
          {games.map((game, index) => (
            <div key={game.id || index} className="border rounded p-4 shadow">
              <div className="flex justify-between items-center mb-2">
                <p className="font-semibold">{game.awayTeam.name}</p>
                <p className="text-xl font-bold">{game.awayTeam.score}</p>
              </div>
              <span className="text-lg font-bold">vs</span>
              <div className="flex justify-between items-center mt-2">
                <p className="font-semibold">{game.homeTeam.name}</p>
                <p className="text-xl font-bold">{game.homeTeam.score}</p>
              </div>
              <p
                className={`text-center mt-2 italic ${
                  game.status === "In Progress" ? "text-green-600" : ""
                }`}
              >
                {game.status} • {game.localTime}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}