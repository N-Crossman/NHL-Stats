"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CartesianGrid,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import Card from "../components/ui/Card";
import Pill from "../components/ui/Pill";
import { LoadingState, ErrorState, EmptyState } from "../components/ui/StateMessage";
import { formatSigned, type Conference, type SpecialTeamsTeam } from "../lib/analytics";

const LOGO_SIZE = 40;
const QUADRANT_LABEL = { fill: "#64748b", fontSize: 11, fontWeight: 600 };

type ConferenceFilter = "ALL" | Conference;

/** Plotted in percent units (21.4 rather than 0.214) so ticks land on round numbers */
type ScatterRow = SpecialTeamsTeam & { pp: number; pk: number };

/** Pads the data range and snaps it to multiples of 5 */
function paddedDomain(values: number[]): [number, number] {
  const min = Math.max(0, Math.floor((Math.min(...values) - 2) / 5) * 5);
  const max = Math.min(100, Math.ceil((Math.max(...values) + 2) / 5) * 5);
  return [min, max];
}

function ticksFor([min, max]: [number, number]): number[] {
  const step = max - min > 30 ? 10 : 5;
  const ticks: number[] = [];
  for (let v = Math.ceil(min / step) * step; v <= max; v += step) ticks.push(v);
  return ticks;
}

function LogoMarker(props: { cx?: number; cy?: number; payload?: ScatterRow; filter: ConferenceFilter }) {
  const { cx = 0, cy = 0, payload, filter } = props;
  if (!payload) return null;
  const dimmed = filter !== "ALL" && payload.conference !== filter;

  return (
    <g opacity={dimmed ? 0.15 : 1} style={{ cursor: "pointer" }}>
      {/* Larger transparent hit target than the logo itself */}
      <circle cx={cx} cy={cy} r={LOGO_SIZE / 2 + 4} fill="transparent" />
      <image
        href={payload.logo}
        x={cx - LOGO_SIZE / 2}
        y={cy - LOGO_SIZE / 2}
        width={LOGO_SIZE}
        height={LOGO_SIZE}
        aria-label={payload.name}
      />
    </g>
  );
}

function SpecialTeamsTooltip({ team, leaguePp, leaguePk }: { team: ScatterRow; leaguePp: number; leaguePk: number }) {
  return (
    <div className="rounded-xl border border-slate-700 bg-slate-950/95 px-3 py-2 text-xs shadow-xl">
      <div className="font-semibold text-slate-100 text-sm">{team.name}</div>
      <div className="text-slate-400 mb-2">{team.gamesPlayed} GP</div>
      <dl className="grid grid-cols-[auto_auto_auto] gap-x-4 gap-y-1">
        <span />
        <span className="text-right text-slate-500">Team</span>
        <span className="text-right text-slate-500">vs Avg</span>
        <dt className="text-slate-400">Power play</dt>
        <dd className="text-right font-semibold text-slate-100">{team.pp.toFixed(1)}%</dd>
        <dd className="text-right text-slate-300">{formatSigned(team.pp - leaguePp)}</dd>
        <dt className="text-slate-400">Penalty kill</dt>
        <dd className="text-right font-semibold text-slate-100">{team.pk.toFixed(1)}%</dd>
        <dd className="text-right text-slate-300">{formatSigned(team.pk - leaguePk)}</dd>
      </dl>
    </div>
  );
}

export default function SpecialTeams() {
  const [teams, setTeams] = useState<SpecialTeamsTeam[]>([]);
  const [league, setLeague] = useState<{ powerPlayPct: number; penaltyKillPct: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<ConferenceFilter>("ALL");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/analytics/special-teams");
        if (!res.ok) throw new Error("Unable to load special teams");
        const json = await res.json();
        setTeams(json.teams ?? []);
        setLeague(json.league ?? null);
        setError(null);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Unable to load special teams");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const rows: ScatterRow[] = useMemo(
    () => teams.map((t) => ({ ...t, pp: t.powerPlayPct * 100, pk: t.penaltyKillPct * 100 })),
    [teams]
  );

  const leaguePp = (league?.powerPlayPct ?? 0) * 100;
  const leaguePk = (league?.penaltyKillPct ?? 0) * 100;
  const xDomain = rows.length ? paddedDomain(rows.map((r) => r.pp)) : ([0, 40] as [number, number]);
  const yDomain = rows.length ? paddedDomain(rows.map((r) => r.pk)) : ([60, 100] as [number, number]);

  const tableRows = [...rows]
    .filter((r) => filter === "ALL" || r.conference === filter)
    .sort((a, b) => b.pk - a.pk);

  return (
    <Card className="p-5 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-5">
        <div>
          <h2 className="text-xl font-bold text-white">Special Teams</h2>
          <p className="text-sm text-slate-400 mt-1">
            Power play % vs penalty kill %. Dashed lines mark the league average
          </p>
        </div>
        <div className="flex gap-2">
          <Pill active={filter === "ALL"} onClick={() => setFilter("ALL")}>All</Pill>
          <Pill active={filter === "E"} onClick={() => setFilter("E")}>East</Pill>
          <Pill active={filter === "W"} onClick={() => setFilter("W")}>West</Pill>
        </div>
      </div>

      {loading ? (
        <LoadingState label="Loading special teams..." />
      ) : error ? (
        <ErrorState message={error} />
      ) : rows.length === 0 ? (
        <EmptyState message="No special teams data yet this season." />
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mb-4 text-xs text-slate-400">
            <span>
              League avg PP <span className="font-semibold text-slate-100">{leaguePp.toFixed(1)}%</span>
            </span>
            <span>
              League avg PK <span className="font-semibold text-slate-100">{leaguePk.toFixed(1)}%</span>
            </span>
          </div>

          <div className="text-xs text-slate-400 mb-1">↑ Penalty kill %</div>
          <div className="h-[380px] sm:h-[460px]">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 8, right: 16, bottom: 24, left: 4 }}>
                <CartesianGrid stroke="#1e293b" />
                <XAxis
                  type="number"
                  dataKey="pp"
                  name="Power play %"
                  domain={xDomain}
                  ticks={ticksFor(xDomain)}
                  tickFormatter={(v: number) => `${v}%`}
                  tick={{ fill: "#94a3b8", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  label={{ value: "Power play % →", position: "bottom", offset: 6, fill: "#94a3b8", fontSize: 12 }}
                />
                <YAxis
                  type="number"
                  dataKey="pk"
                  name="Penalty kill %"
                  domain={yDomain}
                  ticks={ticksFor(yDomain)}
                  tickFormatter={(v: number) => `${v}%`}
                  tick={{ fill: "#94a3b8", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  width={48}
                />

                {/* Quadrants split at the league average */}
                <ReferenceArea x1={leaguePp} x2={xDomain[1]} y1={leaguePk} y2={yDomain[1]} fill="transparent" label={{ ...QUADRANT_LABEL, value: "Strong both", position: "insideTopRight" }} />
                <ReferenceArea x1={xDomain[0]} x2={leaguePp} y1={leaguePk} y2={yDomain[1]} fill="transparent" label={{ ...QUADRANT_LABEL, value: "Penalty kill carries", position: "insideTopLeft" }} />
                <ReferenceArea x1={leaguePp} x2={xDomain[1]} y1={yDomain[0]} y2={leaguePk} fill="transparent" label={{ ...QUADRANT_LABEL, value: "Power play carries", position: "insideBottomRight" }} />
                <ReferenceArea x1={xDomain[0]} x2={leaguePp} y1={yDomain[0]} y2={leaguePk} fill="transparent" label={{ ...QUADRANT_LABEL, value: "Struggling both", position: "insideBottomLeft" }} />

                <ReferenceLine x={leaguePp} stroke="#64748b" strokeDasharray="4 4" />
                <ReferenceLine y={leaguePk} stroke="#64748b" strokeDasharray="4 4" />

                <Tooltip
                  cursor={{ stroke: "#475569", strokeDasharray: "3 3" }}
                  content={({ active, payload }) =>
                    active && payload?.length ? (
                      <SpecialTeamsTooltip team={payload[0].payload as ScatterRow} leaguePp={leaguePp} leaguePk={leaguePk} />
                    ) : null
                  }
                />
                <Scatter
                  data={rows}
                  isAnimationActive={false}
                  shape={(props: { cx?: number; cy?: number; payload?: ScatterRow }) => (
                    <LogoMarker {...props} filter={filter} />
                  )}
                />
              </ScatterChart>
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
                    <th className="pb-2 px-2 font-semibold">Team</th>
                    <th className="pb-2 px-2 font-semibold text-right">GP</th>
                    <th className="pb-2 px-2 font-semibold text-right">PP%</th>
                    <th className="pb-2 px-2 font-semibold text-right">PK%</th>
                  </tr>
                </thead>
                <tbody>
                  {tableRows.map((t) => (
                    <tr key={t.abbrev} className="border-b border-slate-800/60 last:border-0">
                      <td className="py-2 px-2 text-slate-100">{t.name}</td>
                      <td className="py-2 px-2 text-right text-slate-300">{t.gamesPlayed}</td>
                      <td className="py-2 px-2 text-right text-slate-300">{t.pp.toFixed(1)}</td>
                      <td className="py-2 px-2 text-right font-semibold text-slate-100">{t.pk.toFixed(1)}</td>
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
