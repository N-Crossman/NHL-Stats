"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { HiOutlineSearch } from "react-icons/hi";

interface PlayerResult {
  id: string;
  name: string;
}

export default function PlayerSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PlayerResult[]>([]);

  useEffect(() => {
    if (query.length < 2) {
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
    <div className="relative max-w-xl">
      <div className="relative">
        <HiOutlineSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search players..."
          className="focus-ring w-full rounded-xl bg-slate-900/60 border border-slate-800 pl-11 pr-4 py-3 text-slate-100 placeholder:text-slate-500 transition-colors focus-visible:border-cyan-500/50"
        />
      </div>

      {query.length >= 2 && results.length > 0 && (
        <ul className="absolute z-10 mt-2 w-full rounded-xl border border-slate-800 bg-slate-900/95 backdrop-blur-xl shadow-2xl overflow-hidden">
          {results.map(player => (
            <li key={player.id}>
              <Link
                href={`/player/${player.id}`}
                className="block px-4 py-2.5 text-sm text-slate-200 hover:bg-cyan-500/10 hover:text-cyan-400 transition-colors"
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
