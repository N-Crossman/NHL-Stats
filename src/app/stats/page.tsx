'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface SkaterStats {
  playerId: number;
  skaterFullName: string;
  points: number;
  goals: number;
  assists: number;
  gamesPlayed: number;
  headshot: string;
  teamLogo: string;
}

interface GoalieStats {
  playerId: number;
  goaltendersFullName: string;
  goalsAgainstAverage: number;
  savePctg: number;
  shutouts: number;
  headshot: string;
  teamLogo: string;
}

interface DefensemanStats {
  playerId: number;
  skaterFullName: string;
  points: number;
  goals: number;
  assists: number;
  gamesPlayed: number;
  headshot: string;
  teamLogo: string;
}

export default function StatsPage() {
  const [skaterFilter, setSkaterFilter] = useState<'points' | 'goals' | 'assists'>('points');
  const [skaters, setSkaters] = useState<SkaterStats[]>([]);
  const [skaterLoading, setSkaterLoading] = useState(true);

  const [goalieFilter, setGoalieFilter] = useState<'gaa' | 'sv%' | 'shutouts'>('gaa');
  const [goalies, setGoalies] = useState<GoalieStats[]>([]);
  const [goalieLoading, setGoalieLoading] = useState(true);

  const [defensemenFilter, setDefensemenFilter] = useState<'points' | 'goals' | 'assists'>('points');
  const [defensemen, setDefensemen] = useState<DefensemanStats[]>([]);
  const [defensemenLoading, setDefensemenLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [skaterRes, goalieRes, defensemenRes] = await Promise.all([
          fetch('/api/stats/skaters'),
          fetch('/api/stats/goalies'),
          fetch('/api/stats/defensemen'),
        ]);

        const skaterData = await skaterRes.json();
        const goalieData = await goalieRes.json();
        const defensemenData = await defensemenRes.json();

        setSkaters(skaterData.skaters || []);
        setGoalies(goalieData.goalies || []);
        setDefensemen(defensemenData.defensemen || []);

        setSkaterLoading(false);
        setGoalieLoading(false);
        setDefensemenLoading(false);
      } catch (error) {
        console.error('Error fetching stats:', error);
        setSkaterLoading(false);
        setGoalieLoading(false);
        setDefensemenLoading(false);
      }
    };

    fetchStats();
  }, []);

  const sortedSkaters = [...skaters].sort((a, b) => {
    if (skaterFilter === 'points') return b.points - a.points;
    if (skaterFilter === 'goals') return b.goals - a.goals;
    if (skaterFilter === 'assists') return b.assists - a.assists;
    return 0;
  });

  const sortedGoalies = [...goalies]
    .filter((g) => {
      // When filtering by GAA, exclude goalies with 0 GAA
      if (goalieFilter === 'gaa') return g.goalsAgainstAverage > 0;
      return true;
    })
    .sort((a, b) => {
      if (goalieFilter === 'gaa') return a.goalsAgainstAverage - b.goalsAgainstAverage;
      if (goalieFilter === 'sv%') return b.savePctg - a.savePctg;
      if (goalieFilter === 'shutouts') return b.shutouts - a.shutouts;
      return 0;
    });

  const sortedDefensemen = [...defensemen].sort((a, b) => {
    if (defensemenFilter === 'points') return b.points - a.points;
    if (defensemenFilter === 'goals') return b.goals - a.goals;
    if (defensemenFilter === 'assists') return b.assists - a.assists;
    return 0;
  });

  return (
    <div className="min-h-screen text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-2 mt-8">Statistics</h1>
          <p className="text-xl text-gray-400">2025-2026 Season</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4">Skaters</h2>

            <div className="flex gap-2 mb-6">
              <button
                onClick={() => setSkaterFilter('points')}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                  skaterFilter === 'points'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Points
              </button>
              <button
                onClick={() => setSkaterFilter('goals')}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                  skaterFilter === 'goals'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Goals
              </button>
              <button
                onClick={() => setSkaterFilter('assists')}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                  skaterFilter === 'assists'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Assists
              </button>
            </div>

            {skaterLoading ? (
              <p className="text-gray-400">Loading...</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-gray-700">
                    <tr className="text-left text-sm text-white">
                      <th className="pb-3 font-semibold w-12">#</th>
                      <th className="pb-3 font-semibold">Player</th>
                      <th className="pb-3 font-semibold text-right">
                        {skaterFilter === 'points' && 'Points'}
                        {skaterFilter === 'goals' && 'Goals'}
                        {skaterFilter === 'assists' && 'Assists'}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedSkaters.slice(0, 10).map((player, index) => (
                      <tr key={player.playerId} className="border-b border-gray-700 hover:bg-gray-700 transition-colors">
                        <td className="py-3 text-sm font-semibold text-white">{index + 1}</td>
                        <td className="py-3 text-sm">
                          <div className="flex items-center gap-2">
                            {player.headshot && (
                              <Image
                                src={player.headshot}
                                alt={player.skaterFullName}
                                width={36}
                                height={36}
                                className="rounded-full object-cover"
                              />
                            )}
                            <Link href={`/player/${player.playerId}`} className="hover:text-blue-400 transition-colors">
                              {player.skaterFullName}
                            </Link>
                            {player.teamLogo && (
                              <Image
                                src={player.teamLogo}
                                alt="team"
                                width={32}
                                height={32}
                                className="object-contain"
                              />
                            )}
                          </div>
                        </td>
                        <td className="py-3 text-sm text-right font-semibold">
                          {skaterFilter === 'points' && player.points}
                          {skaterFilter === 'goals' && player.goals}
                          {skaterFilter === 'assists' && player.assists}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4">Goalies</h2>

            <div className="flex gap-2 mb-6">
              <button
                onClick={() => setGoalieFilter('gaa')}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                  goalieFilter === 'gaa'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                GAA
              </button>
              <button
                onClick={() => setGoalieFilter('sv%')}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                  goalieFilter === 'sv%'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                SV%
              </button>
              <button
                onClick={() => setGoalieFilter('shutouts')}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                  goalieFilter === 'shutouts'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Shutouts
              </button>
            </div>

            {goalieLoading ? (
              <p className="text-gray-400">Loading...</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-gray-700">
                    <tr className="text-left text-sm text-white">
                      <th className="pb-3 font-semibold w-12">#</th>
                      <th className="pb-3 font-semibold">Player</th>
                      <th className="pb-3 font-semibold text-right">
                        {goalieFilter === 'gaa' && 'GAA'}
                        {goalieFilter === 'sv%' && 'SV%'}
                        {goalieFilter === 'shutouts' && 'SO'}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedGoalies.slice(0, 10).map((player, index) => (
                      <tr key={player.playerId} className="border-b border-gray-700 hover:bg-gray-700 transition-colors">
                        <td className="py-3 text-sm font-semibold text-white">{index + 1}</td>
                        <td className="py-3 text-sm">
                          <div className="flex items-center gap-2">
                            {player.headshot && (
                              <Image
                                src={player.headshot}
                                alt={player.goaltendersFullName}
                                width={36}
                                height={36}
                                className="rounded-full object-cover"
                              />
                            )}
                            <Link href={`/player/${player.playerId}`} className="hover:text-blue-400 transition-colors">
                              {player.goaltendersFullName}
                            </Link>
                            {player.teamLogo && (
                              <Image
                                src={player.teamLogo}
                                alt="team"
                                width={32}
                                height={32}
                                className="object-contain"
                              />
                            )}
                          </div>
                        </td>
                        <td className="py-3 text-sm text-right font-semibold">
                          {goalieFilter === 'gaa' && player.goalsAgainstAverage.toFixed(2)}
                          {goalieFilter === 'sv%' && player.savePctg.toFixed(3).substring(1) + '%'}
                          {goalieFilter === 'shutouts' && player.shutouts}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-4">Defensemen</h2>

          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setDefensemenFilter('points')}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                defensemenFilter === 'points'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Points
            </button>
            <button
              onClick={() => setDefensemenFilter('goals')}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                defensemenFilter === 'goals'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Goals
            </button>
            <button
              onClick={() => setDefensemenFilter('assists')}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                defensemenFilter === 'assists'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Assists
            </button>
          </div>

          {defensemenLoading ? (
            <p className="text-gray-400">Loading...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-gray-700">
                  <tr className="text-left text-sm text-white">
                    <th className="pb-3 font-semibold w-12">#</th>
                    <th className="pb-3 font-semibold">Player</th>
                    <th className="pb-3 font-semibold text-right">
                      {defensemenFilter === 'points' && 'Points'}
                      {defensemenFilter === 'goals' && 'Goals'}
                      {defensemenFilter === 'assists' && 'Assists'}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sortedDefensemen.slice(0, 10).map((player, index) => (
                    <tr key={player.playerId} className="border-b border-gray-700 hover:bg-gray-700 transition-colors">
                      <td className="py-3 text-sm font-semibold text-white">{index + 1}</td>
                      <td className="py-3 text-sm">
                        <div className="flex items-center gap-2">
                          {player.headshot && (
                            <Image
                              src={player.headshot}
                              alt={player.skaterFullName}
                              width={36}
                              height={36}
                              className="rounded-full object-cover"
                            />
                          )}
                          <Link href={`/player/${player.playerId}`} className="hover:text-blue-400 transition-colors">
                            {player.skaterFullName}
                          </Link>
                          {player.teamLogo && (
                            <Image
                              src={player.teamLogo}
                              alt="team"
                              width={32}
                              height={32}
                              className="object-contain"
                            />
                          )}
                        </div>
                      </td>
                      <td className="py-3 text-sm text-right font-semibold">
                        {defensemenFilter === 'points' && player.points}
                        {defensemenFilter === 'goals' && player.goals}
                        {defensemenFilter === 'assists' && player.assists}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}