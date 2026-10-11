'use client';

import { useState, useEffect, ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Card from '../components/ui/Card';
import SectionHeading from '../components/ui/SectionHeading';
import Pill from '../components/ui/Pill';
import { LoadingState } from '../components/ui/StateMessage';

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

const RANK_STYLES = [
  'text-amber-400', // 1st — gold
  'text-slate-300', // 2nd — silver
  'text-orange-400', // 3rd — bronze
];

function RankBadge({ index }: { index: number }) {
  return (
    <span className={`text-sm font-bold ${RANK_STYLES[index] ?? 'text-slate-500'}`}>
      {index + 1}
    </span>
  );
}

function PlayerCell({
  playerId,
  name,
  headshot,
  teamLogo,
}: {
  playerId: number;
  name: string;
  headshot?: string;
  teamLogo?: string;
}) {
  return (
    <div className="flex items-center gap-2">
      {headshot && (
        <Image
          src={headshot}
          alt={name}
          width={36}
          height={36}
          className="rounded-full object-cover bg-slate-800 h-9 w-9"
        />
      )}
      <Link href={`/player/${playerId}`} className="hover:text-cyan-400 transition-colors font-medium">
        {name}
      </Link>
      {teamLogo && <Image src={teamLogo} alt="team" width={28} height={28} className="object-contain" />}
    </div>
  );
}

function StatTable({
  headers,
  rows,
}: {
  headers: [string, string, string];
  rows: { key: number; rank: number; cell: ReactNode; stat: ReactNode }[];
}) {
  return (
    <div className="overflow-x-auto -mx-2">
      <table className="w-full">
        <thead className="border-b border-slate-800">
          <tr className="text-left text-xs text-slate-400 uppercase tracking-wide">
            <th className="pb-3 px-2 font-semibold w-10">{headers[0]}</th>
            <th className="pb-3 px-2 font-semibold">{headers[1]}</th>
            <th className="pb-3 px-2 font-semibold text-right">{headers[2]}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.key} className="border-b border-slate-800/60 last:border-0 hover:bg-slate-800/40 transition-colors">
              <td className="py-3 px-2">
                <RankBadge index={row.rank} />
              </td>
              <td className="py-2 px-2 text-sm">{row.cell}</td>
              <td className="py-3 px-2 text-sm text-right font-semibold text-slate-100">{row.stat}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
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

  const now = new Date();
  const seasonStartYear = now.getMonth() >= 9 ? now.getFullYear() : now.getFullYear() - 1;
  const seasonLabel = `${seasonStartYear}-${seasonStartYear + 1} Season`;

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
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
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
    return b.assists - a.assists;
  });

  const sortedGoalies = [...goalies]
    .filter((g) => (goalieFilter === 'gaa' ? g.goalsAgainstAverage > 0 : true))
    .sort((a, b) => {
      if (goalieFilter === 'gaa') return a.goalsAgainstAverage - b.goalsAgainstAverage;
      if (goalieFilter === 'sv%') return b.savePctg - a.savePctg;
      return b.shutouts - a.shutouts;
    });

  const sortedDefensemen = [...defensemen].sort((a, b) => {
    if (defensemenFilter === 'points') return b.points - a.points;
    if (defensemenFilter === 'goals') return b.goals - a.goals;
    return b.assists - a.assists;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <SectionHeading title="Statistics" subtitle={seasonLabel} align="left" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-6 sm:mb-8">
        <Card className="p-5 sm:p-6">
          <h2 className="text-xl font-bold text-white mb-4">Skaters</h2>
          <div className="flex gap-2 mb-5 flex-wrap">
            <Pill active={skaterFilter === 'points'} onClick={() => setSkaterFilter('points')}>Points</Pill>
            <Pill active={skaterFilter === 'goals'} onClick={() => setSkaterFilter('goals')}>Goals</Pill>
            <Pill active={skaterFilter === 'assists'} onClick={() => setSkaterFilter('assists')}>Assists</Pill>
          </div>

          {skaterLoading ? (
            <LoadingState />
          ) : (
            <StatTable
              headers={['#', 'Player', skaterFilter === 'points' ? 'Points' : skaterFilter === 'goals' ? 'Goals' : 'Assists']}
              rows={sortedSkaters.slice(0, 10).map((player, index) => ({
                key: player.playerId,
                rank: index,
                cell: (
                  <PlayerCell
                    playerId={player.playerId}
                    name={player.skaterFullName}
                    headshot={player.headshot}
                    teamLogo={player.teamLogo}
                  />
                ),
                stat: skaterFilter === 'points' ? player.points : skaterFilter === 'goals' ? player.goals : player.assists,
              }))}
            />
          )}
        </Card>

        <Card className="p-5 sm:p-6">
          <h2 className="text-xl font-bold text-white mb-4">Goalies</h2>
          <div className="flex gap-2 mb-5 flex-wrap">
            <Pill active={goalieFilter === 'gaa'} onClick={() => setGoalieFilter('gaa')}>GAA</Pill>
            <Pill active={goalieFilter === 'sv%'} onClick={() => setGoalieFilter('sv%')}>SV%</Pill>
            <Pill active={goalieFilter === 'shutouts'} onClick={() => setGoalieFilter('shutouts')}>Shutouts</Pill>
          </div>

          {goalieLoading ? (
            <LoadingState />
          ) : (
            <StatTable
              headers={['#', 'Player', goalieFilter === 'gaa' ? 'GAA' : goalieFilter === 'sv%' ? 'SV%' : 'SO']}
              rows={sortedGoalies.slice(0, 10).map((player, index) => ({
                key: player.playerId,
                rank: index,
                cell: (
                  <PlayerCell
                    playerId={player.playerId}
                    name={player.goaltendersFullName}
                    headshot={player.headshot}
                    teamLogo={player.teamLogo}
                  />
                ),
                stat:
                  goalieFilter === 'gaa'
                    ? player.goalsAgainstAverage.toFixed(2)
                    : goalieFilter === 'sv%'
                    ? player.savePctg.toFixed(3).substring(1) + '%'
                    : player.shutouts,
              }))}
            />
          )}
        </Card>
      </div>

      <Card className="p-5 sm:p-6">
        <h2 className="text-xl font-bold text-white mb-4">Defensemen</h2>
        <div className="flex gap-2 mb-5 flex-wrap">
          <Pill active={defensemenFilter === 'points'} onClick={() => setDefensemenFilter('points')}>Points</Pill>
          <Pill active={defensemenFilter === 'goals'} onClick={() => setDefensemenFilter('goals')}>Goals</Pill>
          <Pill active={defensemenFilter === 'assists'} onClick={() => setDefensemenFilter('assists')}>Assists</Pill>
        </div>

        {defensemenLoading ? (
          <LoadingState />
        ) : (
          <StatTable
            headers={['#', 'Player', defensemenFilter === 'points' ? 'Points' : defensemenFilter === 'goals' ? 'Goals' : 'Assists']}
            rows={sortedDefensemen.slice(0, 10).map((player, index) => ({
              key: player.playerId,
              rank: index,
              cell: (
                <PlayerCell
                  playerId={player.playerId}
                  name={player.skaterFullName}
                  headshot={player.headshot}
                  teamLogo={player.teamLogo}
                />
              ),
              stat: defensemenFilter === 'points' ? player.points : defensemenFilter === 'goals' ? player.goals : player.assists,
            }))}
          />
        )}
      </Card>
    </div>
  );
}
