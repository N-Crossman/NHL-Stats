"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface PlayerResult {
  id: string;
  name: string;
}

export default function PlayerSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PlayerResult[]>([]);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }

    const controller = new AbortController();
    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(`/api/player-search?q=${encodeURIComponent(query)}`, {
          signal: controller.signal,
        });
        if (res.ok) setResults(await res.json());
      } catch {}
    }, 250);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [query]);

  return (
    <div className="relative max-w-xl mt-6">
        <h1 className="text-xl font-bold mb-4">Players</h1>
      <input
        type="text"
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Search players..."
        className="w-full rounded-lg border px-4 py-3"
      />

      {results.length > 0 && (
        <ul className="absolute z-10 mt-2 w-full rounded-lg border bg-white shadow-lg text-gray-800">
          {results.map(player => (
            <li key={player.id}>
              <Link
                href={`/player/${player.id}`}
                className="block px-4 py-2 hover:bg-blue-300"
              >
                {player.name}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
