"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

interface Team {
  teamId: string;
  name: string;
  points: number;
  gamesPlayed: number;
  wins: number;
  losses: number;
  otLosses: number;
  logo: string;
}

export default function Standings() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchStandings() {
      try {
        const res = await fetch("/api/standings");
        const data = await res.json();

        if (!data?.teams || !Array.isArray(data.teams)) {
          setTeams([]);
          return;
        }

        setTeams(data.teams);
      } catch (err) {
        console.error(err);
        setError("Failed to load standings");
      } finally {
        setLoading(false);
      }
    }

    fetchStandings();
  }, []);

  if (loading) {
    return <p className="text-center text-slate-400">Loading standings...</p>;
  }

  if (error) {
    return <p className="text-center text-red-500">{error}</p>;
  }

  if (teams.length === 0) {
    return <p className="text-center text-slate-400">No standings available.</p>;
  }

  return (
    <section className="mt-10 px-2 sm:px-6">
        <div className="bg-slate-900/80 backdrop-blur border border-slate-700/50 rounded-2xl shadow-2xl p-4 sm:p-6">
        <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-center bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
          League Standings
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-sm sm:text-base text-slate-200">
            <thead className="border-b border-slate-700/50">
              <tr className="text-left text-slate-400">
                <th className="py-2 pr-2">#</th>
                <th className="py-2">Team</th>
                <th className="py-2 text-center hidden sm:table-cell">GP</th>
                <th className="py-2 text-center hidden sm:table-cell">W</th>
                <th className="py-2 text-center hidden sm:table-cell">L</th>
                <th className="py-2 text-center hidden sm:table-cell">OT</th>
                <th className="py-2 text-center font-semibold">PTS</th>
              </tr>
            </thead>

            <tbody>
              {teams.map((team, index) => (
                <tr
                  key={team.teamId}
                  className="border-b border-slate-800 hover:text-blue-300 hover:bg-slate-800/40 transition"
                >
                  <td className="py-2 pr-2 text-slate-400 ">
                    {index + 1}
                  </td>

                  <td className="py-3">
                    <Link 
                      href={`/team/${team.teamId}`}
                      className="flex items-center gap-4 hover:text-blue-400 transition-colors"
                    >
                      <div className="relative w-[34px] h-[34px]">
                        <Image
                          src={team.logo}
                          alt={team.name}
                          fill
                          className="object-contain"
                        />
                      </div>
                      <span className="font-medium">{team.name}</span>
                    </Link>
                  </td>

                  <td className="py-2 text-center hidden sm:table-cell">{team.gamesPlayed}</td>
                  <td className="py-2 text-center hidden sm:table-cell">{team.wins}</td>
                  <td className="py-2 text-center hidden sm:table-cell">{team.losses}</td>
                  <td className="py-2 text-center hidden sm:table-cell">{team.otLosses}</td>
                  <td className="py-2 text-center font-bold text-white">
                    {team.points}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </section>
  );
}