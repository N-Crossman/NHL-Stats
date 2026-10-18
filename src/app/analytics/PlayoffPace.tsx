"use client";

import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Rectangle,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type RectangleProps,
} from "recharts";
import Card from "../components/ui/Card";
import Pill from "../components/ui/Pill";
import { LoadingState, ErrorState, EmptyState } from "../components/ui/StateMessage";
import {
  formatSigned,
  playoffPositionLabel,
  type Conference,
  type PlayoffPaceTeam,
} from "../lib/analytics";
import { useAnalyticsStandings } from "./useAnalyticsStandings";

const ABOVE_COLOR = "#3987e5";
const BELOW_COLOR = "#e66767";
const ROW_HEIGHT = 28;

function PaceBar(props: RectangleProps & { payload?: PlayoffPaceTeam }) {
  const above = (props.payload?.gapPace ?? 0) >= 0;
  return (
    <Rectangle
      {...props}
      fill={above ? ABOVE_COLOR : BELOW_COLOR}
      // Round only the data end, keep the end on the cutoff line square
      radius={above ? [0, 4, 4, 0] : [4, 0, 0, 4]}
    />
  );
}

function PaceTooltip({ team }: { team: PlayoffPaceTeam }) {
  return (
    <div className="rounded-xl border border-slate-700 bg-slate-950/95 px-3 py-2 text-xs shadow-xl">
      <div className="font-semibold text-slate-100 text-sm">{team.name}</div>
      <div className="text-slate-400 mb-2">{playoffPositionLabel(team)}</div>
      <dl className="grid grid-cols-[auto_auto] gap-x-4 gap-y-1">
        <dt className="text-slate-400">Points</dt>
        <dd className="text-right text-slate-100">
          {team.points} in {team.gamesPlayed} GP
        </dd>
        <dt className="text-slate-400">82-game pace</dt>
        <dd className="text-right text-slate-100">{team.projectedPoints.toFixed(1)}</dd>
        <dt className="text-slate-400">Pace vs cutoff</dt>
        <dd className="text-right font-semibold text-slate-100">{formatSigned(team.gapPace)}</dd>
        <dt className="text-slate-400">Points vs cutoff</dt>
        <dd className="text-right text-slate-100">{formatSigned(team.gapNow, 0)}</dd>
      </dl>
    </div>
  );
}

export default function PlayoffPace() {
  const { teams, loading, error } = useAnalyticsStandings();
  const [conference, setConference] = useState<Conference>("E");

  const rows = useMemo(
    () => teams.filter((t) => t.conference === conference).sort((a, b) => b.gapPace - a.gapPace),
    [teams, conference]
  );

  const cutoff = rows.find((t) => t.abbrev === t.cutoffAbbrev);
  const maxGap = Math.max(10, Math.ceil(Math.max(...rows.map((t) => Math.abs(t.gapPace)), 0) / 10) * 10);
  const ticks = [-maxGap, -maxGap / 2, 0, maxGap / 2, maxGap];

  return (
    <Card className="p-5 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-5">
        <div>
          <h2 className="text-xl font-bold text-white">Playoff Race</h2>
          <p className="text-sm text-slate-400 mt-1">
            82-game points pace compared to the second wild card team&apos;s pace
          </p>
        </div>
        <div className="flex gap-2">
          <Pill active={conference === "E"} onClick={() => setConference("E")}>East</Pill>
          <Pill active={conference === "W"} onClick={() => setConference("W")}>West</Pill>
        </div>
      </div>

      {loading ? (
        <LoadingState label="Loading playoff race..." />
      ) : error ? (
        <ErrorState message={error} />
      ) : rows.length === 0 ? (
        <EmptyState message="No standings available right now." />
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mb-4 text-xs text-slate-300">
            <span className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-sm" style={{ background: ABOVE_COLOR }} />
              Ahead of cutoff pace
            </span>
            <span className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-sm" style={{ background: BELOW_COLOR }} />
              Behind cutoff pace
            </span>
            {cutoff && (
              <span className="text-slate-400 sm:ml-auto">
                Cutoff: <span className="font-semibold text-slate-100">{cutoff.abbrev}</span> on pace for{" "}
                <span className="font-semibold text-slate-100">{cutoff.cutoffPace.toFixed(1)}</span> pts
              </span>
            )}
          </div>

          <div style={{ height: rows.length * ROW_HEIGHT + 48 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={rows} layout="vertical" margin={{ top: 20, right: 12, bottom: 0, left: 0 }} barCategoryGap={6}>
                <CartesianGrid horizontal={false} stroke="#1e293b" />
                <XAxis
                  type="number"
                  domain={[-maxGap, maxGap]}
                  ticks={ticks}
                  tickFormatter={(v: number) => formatSigned(v, 0)}
                  tick={{ fill: "#94a3b8", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="abbrev"
                  width={44}
                  tick={{ fill: "#cbd5e1", fontSize: 12, fontWeight: 600 }}
                  axisLine={false}
                  tickLine={false}
                  interval={0}
                />
                <Tooltip
                  cursor={{ fill: "rgba(148, 163, 184, 0.08)" }}
                  content={({ active, payload }) =>
                    active && payload?.length ? <PaceTooltip team={payload[0].payload as PlayoffPaceTeam} /> : null
                  }
                />
                <ReferenceLine
                  x={0}
                  stroke="#94a3b8"
                  label={{ value: "Wild card cutoff", position: "top", fill: "#94a3b8", fontSize: 11 }}
                />
                <Bar dataKey="gapPace" shape={PaceBar} isAnimationActive={false} />
              </BarChart>
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
                    <th className="pb-2 px-2 font-semibold text-right">PTS</th>
                    <th className="pb-2 px-2 font-semibold text-right">Pace</th>
                    <th className="pb-2 px-2 font-semibold text-right">vs Cutoff</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((t) => (
                    <tr key={t.abbrev} className="border-b border-slate-800/60 last:border-0">
                      <td className="py-2 px-2 text-slate-100">{t.name}</td>
                      <td className="py-2 px-2 text-right text-slate-300">{t.gamesPlayed}</td>
                      <td className="py-2 px-2 text-right text-slate-300">{t.points}</td>
                      <td className="py-2 px-2 text-right text-slate-300">{t.projectedPoints.toFixed(1)}</td>
                      <td className="py-2 px-2 text-right font-semibold text-slate-100">{formatSigned(t.gapPace)}</td>
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
