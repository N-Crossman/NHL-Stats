"use client";

import { useEffect, useState } from "react";
import type { PlayoffPaceTeam } from "../lib/analytics";

const CACHE_MS = 5 * 60 * 1000;

// Shared across every section on the page so standings are fetched once
let cached: { at: number; request: Promise<PlayoffPaceTeam[]> } | null = null;

function loadStandings(): Promise<PlayoffPaceTeam[]> {
  if (cached && Date.now() - cached.at < CACHE_MS) return cached.request;

  const request = fetch("/api/analytics/standings")
    .then(async (res) => {
      if (!res.ok) throw new Error("Unable to load standings");
      const json = await res.json();
      return (json.teams ?? []) as PlayoffPaceTeam[];
    })
    .catch((e) => {
      cached = null;
      throw e;
    });

  cached = { at: Date.now(), request };
  return request;
}

export function useAnalyticsStandings() {
  const [teams, setTeams] = useState<PlayoffPaceTeam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadStandings()
      .then((t) => {
        if (!cancelled) setTeams(t);
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "Unable to load standings");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { teams, loading, error };
}
