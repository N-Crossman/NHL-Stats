"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Card from "../ui/Card";
import SectionHeading from "../ui/SectionHeading";
import { LoadingState, ErrorState, EmptyState } from "../ui/StateMessage";

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

  return (
    <Card className="p-4 sm:p-6">
      <SectionHeading title="League Standings" />

      {error ? (
        <ErrorState message={error} />
      ) : loading ? (
        <LoadingState label="Loading standings..." />
      ) : teams.length === 0 ? (
        <EmptyState message="No standings available." />
      ) : (
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
                      <div className="relative w-[34px] h-[34px] flex-shrink-0">
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
      )}
    </Card>
  );
}