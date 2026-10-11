"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import SectionHeading from "../components/ui/SectionHeading";
import { LoadingState, ErrorState, EmptyState } from "../components/ui/StateMessage";

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
      } catch (e) {
        setError(e instanceof Error ? e.message : "Unable to load teams");
        setTeams([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <SectionHeading title="Teams" subtitle="Every club in the league" align="left" />

      {loading ? (
        <LoadingState label="Loading teams..." />
      ) : error ? (
        <ErrorState message={error} />
      ) : teams.length === 0 ? (
        <EmptyState message="No teams available right now." />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
          {teams.map((t) => (
            <Link
              key={t.teamId}
              href={`/team/${t.abbrev}`}
              className="glass-panel flex flex-col items-center justify-center gap-3 p-4 transition-all duration-300 hover:border-cyan-500/50 hover:shadow-cyan-500/10 hover:-translate-y-1"
            >
              <div className="relative h-16 w-16 sm:h-20 sm:w-20">
                {t.logo ? (
                  <Image src={t.logo} alt={`${t.name} logo`} fill className="object-contain" />
                ) : (
                  <div className="h-full w-full bg-slate-800 rounded-lg" />
                )}
              </div>
              <div className="text-center">
                <div className="font-semibold text-sm text-slate-100 leading-tight">{t.name}</div>
                <div className="text-xs text-slate-500 mt-1 tracking-wide">{t.abbrev}</div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
