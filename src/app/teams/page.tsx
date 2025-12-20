"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Team = {
  teamId: string | number;
  name: string;
  abbrev: string;
  logo?: string | null;
};

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/teams");
        if (!res.ok) throw new Error("/api/teams failed");
        const json = await res.json();
        const list = json.teams ?? [];
        setTeams(list);
        setError(null);
      } catch (e: any) {
        setError(e?.message || "Unable to load teams");
        setTeams([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-4">Teams</h1>
      {loading && <div>Loading teams...</div>}
      {!loading && error && (
        <div className="text-red-600">{error}</div>
      )}
      {!loading && !error && teams.length === 0 && (
        <div>No teams available right now.</div>
      )}
      {!loading && !error && teams.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {teams.map((t) => (
            <Link
              key={t.teamId}
              href={`/team/${t.abbrev}`}
              className="bg-black dark:bg-white rounded-2xl p-4 hover:shadow-lg hover:shadow-blue-500 transition-all duration-300 transform hover:scale-105 flex flex-col items-center justify-center h-full"
            >
              <div className="flex flex-col items-center gap-3 w-full">
                {t.logo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={t.logo} alt={`${t.name} logo`} className="h-20 w-20 object-contain" />
                ) : (
                  <div className="h-20 w-20 bg-gray-800 rounded-lg" />
                )}
                <div className="text-center">
                  <div className="font-semibold text-sm text-white dark:text-black leading-tight">{t.name}</div>
                  <div className="text-xs text-gray-400 mt-1">{t.abbrev}</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}