"use client";

import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import Card from "../components/ui/Card";
import Pill from "../components/ui/Pill";
import { LoadingState, ErrorState, EmptyState } from "../components/ui/StateMessage";
import {
  formatRecord,
  formatSigned,
  pointsPct,
  type Conference,
  type PlayoffPaceTeam,
  type SplitRecord,
} from "../lib/analytics";
import { useAnalyticsStandings } from "./useAnalyticsStandings";

const HOME_COLOR = "#3987e5";
const ROAD_COLOR = "#d95926";
const CONNECTOR_COLOR = "#475569";
const SURFACE_COLOR = "#0b111b";
const ROW_HEIGHT = 28;

type SplitRow = PlayoffPaceTeam & {
  homePct: number;
  roadPct: number;
  /** [lower, higher] — drawn as the dumbbell's connector */
  range: [number, number];
  /** Home minus road points % */
  homeEdge: number;
};

const formatPct = (value: number) => `${Math.round(value * 100)}%`;

function Dumbbell(props: { x?: number; y?: number; width?: number; height?: number; payload?: SplitRow }) {
  const { x = 0, y = 0, width = 0, height = 0, payload } = props;
  if (!payload) return null;

  const cy = y + height / 2;
  const homeOnLeft = payload.homePct <= payload.roadPct;
  const homeX = homeOnLeft ? x : x + width;
  const roadX = homeOnLeft ? x + width : x;

  return (
    <g>
      <line x1={x} x2={x + width} y1={cy} y2={cy} stroke={CONNECTOR_COLOR} strokeWidth={2} />
      <circle cx={roadX} cy={cy} r={5} fill={ROAD_COLOR} stroke={SURFACE_COLOR} strokeWidth={2} />
      <circle cx={homeX} cy={cy} r={5} fill={HOME_COLOR} stroke={SURFACE_COLOR} strokeWidth={2} />
    </g>
  );
}

function SplitLine({ label, color, split }: { label: string; color: string; split: SplitRecord }) {
  return (
    <>
      <dt className="flex items-center gap-2 text-slate-400">
        <span className="h-2 w-2 rounded-full" style={{ background: color }} />
        {label}
      </dt>
      <dd className="text-right text-slate-100">{formatRecord(split)}</dd>
      <dd className="text-right text-slate-100">{formatPct(pointsPct(split) ?? 0)}</dd>
      <dd className="text-right text-slate-300">
        {split.goalsFor}–{split.goalsAgainst}
      </dd>
    </>
  );
}

function SplitTooltip({ team }: { team: SplitRow }) {
  return (
    <div className="rounded-xl border border-slate-700 bg-slate-950/95 px-3 py-2 text-xs shadow-xl">
      <div className="font-semibold text-slate-100 text-sm mb-2">{team.name}</div>
      <dl className="grid grid-cols-[auto_auto_auto_auto] gap-x-4 gap-y-1">
        <span />
        <span className="text-right text-slate-500">Record</span>
        <span className="text-right text-slate-500">Pts%</span>
        <span className="text-right text-slate-500">GF–GA</span>
        <SplitLine label="Home" color={HOME_COLOR} split={team.home} />
        <SplitLine label="Road" color={ROAD_COLOR} split={team.road} />
      </dl>
      <div className="mt-2 pt-2 border-t border-slate-800 flex justify-between gap-4">
        <span className="text-slate-400">Home edge</span>
        <span className="font-semibold text-slate-100">{formatSigned(team.homeEdge * 100, 0)}%</span>
      </div>
    </div>
  );
}

export default function HomeRoadSplits() {
  const { teams, loading, error } = useAnalyticsStandings();
  const [conference, setConference] = useState<Conference>("E");

  const { rows, hiddenCount } = useMemo(() => {
    const conferenceTeams = teams.filter((t) => t.conference === conference);
    const rows: SplitRow[] = conferenceTeams
      .flatMap((t) => {
        const homePct = pointsPct(t.home);
        const roadPct = pointsPct(t.road);
        // Need at least one game in each building to compare
        if (homePct === null || roadPct === null) return [];
        return [
          {
            ...t,
            homePct,
            roadPct,
            range: [Math.min(homePct, roadPct), Math.max(homePct, roadPct)] as [number, number],
            homeEdge: homePct - roadPct,
          },
        ];
      })
      .sort((a, b) => b.homeEdge - a.homeEdge);
    return { rows, hiddenCount: conferenceTeams.length - rows.length };
  }, [teams, conference]);

  return (
    <Card className="p-5 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-5">
        <div>
          <h2 className="text-xl font-bold text-white">Home vs. Road</h2>
          <p className="text-sm text-slate-400 mt-1">
            Points % in each building, sorted by biggest home advantage
          </p>
        </div>
        <div className="flex gap-2">
          <Pill active={conference === "E"} onClick={() => setConference("E")}>East</Pill>
          <Pill active={conference === "W"} onClick={() => setConference("W")}>West</Pill>
        </div>
      </div>

      {loading ? (
        <LoadingState label="Loading splits..." />
      ) : error ? (
        <ErrorState message={error} />
      ) : rows.length === 0 ? (
        <EmptyState message="Not enough home and road games yet." />
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mb-4 text-xs text-slate-300">
            <span className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: HOME_COLOR }} />
              Home
            </span>
            <span className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: ROAD_COLOR }} />
              Road
            </span>
            {hiddenCount > 0 && (
              <span className="text-slate-500 sm:ml-auto">
                {hiddenCount} team{hiddenCount === 1 ? "" : "s"} without both home and road games hidden
              </span>
            )}
          </div>

          <div style={{ height: rows.length * ROW_HEIGHT + 32 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={rows} layout="vertical" margin={{ top: 4, right: 16, bottom: 0, left: 0 }}>
                <CartesianGrid horizontal={false} stroke="#1e293b" />
                <XAxis
                  type="number"
                  domain={[0, 1]}
                  ticks={[0, 0.25, 0.5, 0.75, 1]}
                  tickFormatter={formatPct}
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
                    active && payload?.length ? <SplitTooltip team={payload[0].payload as SplitRow} /> : null
                  }
                />
                <Bar dataKey="range" shape={Dumbbell} isAnimationActive={false} />
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
                    <th className="pb-2 px-2 font-semibold text-right">Home</th>
                    <th className="pb-2 px-2 font-semibold text-right">Home Pts%</th>
                    <th className="pb-2 px-2 font-semibold text-right">Road</th>
                    <th className="pb-2 px-2 font-semibold text-right">Road Pts%</th>
                    <th className="pb-2 px-2 font-semibold text-right">Edge</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((t) => (
                    <tr key={t.abbrev} className="border-b border-slate-800/60 last:border-0">
                      <td className="py-2 px-2 text-slate-100">{t.name}</td>
                      <td className="py-2 px-2 text-right text-slate-300">{formatRecord(t.home)}</td>
                      <td className="py-2 px-2 text-right text-slate-300">{formatPct(t.homePct)}</td>
                      <td className="py-2 px-2 text-right text-slate-300">{formatRecord(t.road)}</td>
                      <td className="py-2 px-2 text-right text-slate-300">{formatPct(t.roadPct)}</td>
                      <td className="py-2 px-2 text-right font-semibold text-slate-100">
                        {formatSigned(t.homeEdge * 100, 0)}%
                      </td>
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
