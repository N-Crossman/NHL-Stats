"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import Card from "../components/ui/Card";
import Pill from "../components/ui/Pill";
import { LoadingState, ErrorState, EmptyState } from "../components/ui/StateMessage";
import {
  formatSavePct,
  rollingSavePct,
  savePct,
  type GoalieStart,
  type GoalieTrendPoint,
} from "../lib/analytics";

const ROLLING_COLOR = "#3987e5";
const LEAGUE_COLOR = "#64748b";
const SURFACE_COLOR = "#0b111b";
const AXIS_TICK = { fill: "#94a3b8", fontSize: 12 };
const WINDOWS = [5, 10] as const;

type GoalieOption = {
  playerId: number;
  name: string;
  lastName: string;
  team: string;
  gamesStarted: number;
  savePct: number;
};

type TrendState = { playerId: number; starts: GoalieStart[]; error: string | null };

const DECISION_LABELS: Record<string, string> = { W: "W", L: "L", O: "OTL" };

function formatGameDate(date: string) {
  return new Date(`${date}T12:00:00`).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function formatRecord(starts: GoalieStart[]) {
  const count = (d: string) => starts.filter((s) => s.decision === d).length;
  return `${count("W")}-${count("L")}-${count("O")}`;
}

/** Pads the data range and snaps it to multiples of .025 */
function savePctDomain(values: number[]): [number, number] {
  const min = Math.floor((Math.min(...values) - 0.005) / 0.025) * 0.025;
  const max = Math.ceil((Math.max(...values) + 0.005) / 0.025) * 0.025;
  return [Math.max(0, Number(min.toFixed(3))), Math.min(1, Number(max.toFixed(3)))];
}

function savePctTicks([min, max]: [number, number]): number[] {
  const step = max - min > 0.15 ? 0.05 : 0.025;
  const ticks: number[] = [];
  for (let v = Math.ceil(min / step) * step; v <= max + 1e-9; v += step) ticks.push(Number(v.toFixed(3)));
  return ticks;
}

function StartTooltip({ point }: { point: GoalieTrendPoint }) {
  return (
    <div className="rounded-xl border border-slate-700 bg-slate-950/95 px-3 py-2 text-xs shadow-xl">
      <div className="font-semibold text-slate-100 text-sm">
        Start {point.start} · {point.isHome ? "vs" : "@"} {point.opponent}
      </div>
      <div className="text-slate-400 mb-2">
        {formatGameDate(point.date)} · {DECISION_LABELS[point.decision] ?? "No decision"}
      </div>
      <dl className="grid grid-cols-[auto_auto] gap-x-4 gap-y-1">
        <dt className="text-slate-400">Saves</dt>
        <dd className="text-right font-semibold text-slate-100">
          {point.shotsAgainst - point.goalsAgainst} / {point.shotsAgainst}
        </dd>
        <dt className="text-slate-400">Goals against</dt>
        <dd className="text-right font-semibold text-slate-100">{point.goalsAgainst}</dd>
        <dt className="text-slate-400">Save %</dt>
        <dd className="text-right font-semibold text-slate-100">{formatSavePct(point.savePct)}</dd>
      </dl>
    </div>
  );
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/40 px-4 py-3">
      <div className="text-xs text-slate-400">{label}</div>
      <div className="text-2xl font-bold text-slate-100 mt-1 tabular-nums">{value}</div>
    </div>
  );
}

export default function GoalieTrends() {
  const [goalies, setGoalies] = useState<GoalieOption[]>([]);
  const [leagueSavePct, setLeagueSavePct] = useState<number | null>(null);
  const [goaliesLoading, setGoaliesLoading] = useState(true);
  const [goaliesError, setGoaliesError] = useState<string | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [window, setWindow] = useState<(typeof WINDOWS)[number]>(5);
  const [trend, setTrend] = useState<TrendState | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/analytics/goalies");
        if (!res.ok) throw new Error("Unable to load goalies");
        const json = await res.json();
        setGoalies(json.goalies ?? []);
        setLeagueSavePct(json.leagueSavePct ?? null);
        setGoaliesError(null);
      } catch (e) {
        setGoaliesError(e instanceof Error ? e.message : "Unable to load goalies");
      } finally {
        setGoaliesLoading(false);
      }
    })();
  }, []);

  const goalieOptions = useMemo(() => [...goalies].sort((a, b) => a.lastName.localeCompare(b.lastName)), [goalies]);
  // Default to the goalie with the most starts until someone picks one
  const workhorse = useMemo(
    () => [...goalies].sort((a, b) => b.gamesStarted - a.gamesStarted || b.savePct - a.savePct)[0],
    [goalies]
  );
  const playerId = selected ?? workhorse?.playerId ?? null;
  const goalie = goalies.find((g) => g.playerId === playerId);

  useEffect(() => {
    if (!playerId) return;
    let cancelled = false;
    fetch(`/api/analytics/goalie-trend/${playerId}`)
      .then(async (res) => {
        const json = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(json.error ?? "Unable to load starts");
        if (!cancelled) setTrend({ playerId, starts: json.starts ?? [], error: null });
      })
      .catch((e) => {
        if (!cancelled) setTrend({ playerId, starts: [], error: e instanceof Error ? e.message : "Unable to load starts" });
      });
    return () => {
      cancelled = true;
    };
  }, [playerId]);

  // Loading until the response for the selected goalie arrives
  const trendLoading = !trend || trend.playerId !== playerId;
  const starts = useMemo(() => (trend && !trendLoading ? trend.starts : []), [trend, trendLoading]);
  const points = useMemo(() => rollingSavePct(starts, window), [starts, window]);
  const recentStarts = starts.slice(-window);
  const showDots = points.length <= 30;

  const domain = savePctDomain([
    ...points.map((p) => p.rollingSavePct),
    ...(leagueSavePct !== null ? [leagueSavePct] : []),
    0.9,
  ]);

  return (
    <Card className="p-5 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-5">
        <div>
          <h2 className="text-xl font-bold text-white">Goalie Trends</h2>
          <p className="text-sm text-slate-400 mt-1">
            Rolling save % over recent starts, weighted by shots faced
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label htmlFor="goalie-trends-goalie" className="sr-only">Goalie</label>
          <select
            id="goalie-trends-goalie"
            value={playerId ?? ""}
            onChange={(e) => setSelected(Number(e.target.value))}
            disabled={goalieOptions.length === 0}
            className="focus-ring h-10 rounded-full bg-slate-800/70 px-4 text-sm font-semibold text-slate-100 border border-slate-700 hover:bg-slate-700/70 transition-colors"
          >
            {goalieOptions.map((g) => (
              <option key={g.playerId} value={g.playerId}>
                {g.name} ({g.team})
              </option>
            ))}
          </select>
          {WINDOWS.map((w) => (
            <Pill key={w} active={window === w} onClick={() => setWindow(w)}>Last {w}</Pill>
          ))}
        </div>
      </div>

      {goaliesLoading ? (
        <LoadingState label="Loading goalies..." />
      ) : goaliesError ? (
        <ErrorState message={goaliesError} />
      ) : !goalie ? (
        <EmptyState message="No goalies with 3+ starts yet this season." />
      ) : trendLoading ? (
        <LoadingState label={`Loading ${goalie.name} starts...`} />
      ) : trend?.error ? (
        <ErrorState message={trend.error} />
      ) : points.length === 0 ? (
        <EmptyState message="No starts yet this season." />
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {/* Official season figure, which also counts relief appearances */}
            <StatTile label="Season SV%" value={formatSavePct(goalie.savePct)} />
            <StatTile label={`SV% (last ${Math.min(window, starts.length)} starts)`} value={formatSavePct(savePct(recentStarts))} />
            <StatTile label="Record in starts" value={formatRecord(starts)} />
            <StatTile label="Starts" value={String(starts.length)} />
          </div>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mb-3 text-xs text-slate-300">
            <span className="flex items-center gap-2">
              <span className="h-0.5 w-4 rounded-full" style={{ background: ROLLING_COLOR }} />
              Rolling SV% (last {window})
            </span>
            {leagueSavePct !== null && (
              <span className="flex items-center gap-2">
                <span className="w-4 border-t border-dashed" style={{ borderColor: LEAGUE_COLOR }} />
                League avg {formatSavePct(leagueSavePct)}
              </span>
            )}
          </div>

          <div className="h-[260px] sm:h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={points} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
                <CartesianGrid vertical={false} stroke="#1e293b" />
                <XAxis
                  dataKey="start"
                  tick={AXIS_TICK}
                  axisLine={false}
                  tickLine={false}
                  interval="preserveStartEnd"
                  tickFormatter={(s: number) => `S${s}`}
                />
                <YAxis
                  domain={domain}
                  ticks={savePctTicks(domain)}
                  interval={0}
                  tickFormatter={formatSavePct}
                  tick={AXIS_TICK}
                  axisLine={false}
                  tickLine={false}
                  width={44}
                />
                {leagueSavePct !== null && (
                  <ReferenceLine y={leagueSavePct} stroke={LEAGUE_COLOR} strokeDasharray="4 4" />
                )}
                <Tooltip
                  cursor={{ stroke: "#475569", strokeDasharray: "3 3" }}
                  content={({ active, payload }) =>
                    active && payload?.length ? <StartTooltip point={payload[0].payload as GoalieTrendPoint} /> : null
                  }
                />
                <Line
                  dataKey="rollingSavePct"
                  stroke={ROLLING_COLOR}
                  strokeWidth={2}
                  dot={showDots ? { r: 4, fill: ROLLING_COLOR, stroke: SURFACE_COLOR, strokeWidth: 2 } : false}
                  activeDot={{ r: 5, stroke: SURFACE_COLOR, strokeWidth: 2 }}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <details className="mt-4 text-sm">
            <summary className="cursor-pointer text-slate-400 hover:text-slate-200 transition-colors">
              View as table
            </summary>
            <div className="overflow-x-auto mt-3">
              <table className="w-full">
                <thead className="border-b border-slate-800">
                  <tr className="text-left text-xs text-slate-400 uppercase tracking-wide">
                    <th className="pb-2 px-2 font-semibold">Start</th>
                    <th className="pb-2 px-2 font-semibold">Date</th>
                    <th className="pb-2 px-2 font-semibold">Opp</th>
                    <th className="pb-2 px-2 font-semibold text-right">Dec</th>
                    <th className="pb-2 px-2 font-semibold text-right">SA</th>
                    <th className="pb-2 px-2 font-semibold text-right">GA</th>
                    <th className="pb-2 px-2 font-semibold text-right">SV%</th>
                  </tr>
                </thead>
                <tbody>
                  {[...points].reverse().map((p) => (
                    <tr key={p.gameId} className="border-b border-slate-800/60 last:border-0">
                      <td className="py-2 px-2 text-slate-400">{p.start}</td>
                      <td className="py-2 px-2 text-slate-300">{formatGameDate(p.date)}</td>
                      <td className="py-2 px-2 text-slate-100">{p.isHome ? "vs" : "@"} {p.opponent}</td>
                      <td className="py-2 px-2 text-right text-slate-300">{DECISION_LABELS[p.decision] ?? "ND"}</td>
                      <td className="py-2 px-2 text-right text-slate-300">{p.shotsAgainst}</td>
                      <td className="py-2 px-2 text-right text-slate-300">{p.goalsAgainst}</td>
                      <td className="py-2 px-2 text-right font-semibold text-slate-100">{formatSavePct(p.savePct)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
        </>
      )}
    </Card>
  );
}
