"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
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
  formatRecord,
  formatSigned,
  rollingForm,
  type RollingFormPoint,
  type TeamGame,
} from "../lib/analytics";
import { useAnalyticsStandings } from "./useAnalyticsStandings";

const GF_COLOR = "#3987e5";
const GA_COLOR = "#d95926";
// Same diverging pair as the Playoff Race chart: positive vs negative
const POSITIVE_COLOR = "#3987e5";
const NEGATIVE_COLOR = "#e66767";
const AXIS_TICK = { fill: "#94a3b8", fontSize: 12 };
const WINDOWS = [5, 10] as const;

type FormState = { abbrev: string; games: TeamGame[]; error: string | null };

function formatGameDate(date: string) {
  return new Date(`${date}T12:00:00`).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function GdBar(props: RectangleProps & { payload?: RollingFormPoint }) {
  const positive = (props.payload?.goalDifferential ?? 0) >= 0;
  return (
    <Rectangle
      {...props}
      fill={positive ? POSITIVE_COLOR : NEGATIVE_COLOR}
      radius={positive ? [3, 3, 0, 0] : [0, 0, 3, 3]}
    />
  );
}

function GameTooltip({ point }: { point: RollingFormPoint }) {
  const decided = point.decidedIn === "REG" ? "" : ` (${point.decidedIn})`;
  return (
    <div className="rounded-xl border border-slate-700 bg-slate-950/95 px-3 py-2 text-xs shadow-xl">
      <div className="font-semibold text-slate-100 text-sm">
        Game {point.game} · {point.isHome ? "vs" : "@"} {point.opponent}
      </div>
      <div className="text-slate-400 mb-2">
        {formatGameDate(point.date)} · {point.result}
        {decided}
      </div>
      <dl className="grid grid-cols-[auto_auto] gap-x-4 gap-y-1">
        <dt className="flex items-center gap-2 text-slate-400">
          <span className="h-2 w-2 rounded-full" style={{ background: GF_COLOR }} />
          Goals for
        </dt>
        <dd className="text-right font-semibold text-slate-100">{point.goalsFor}</dd>
        <dt className="flex items-center gap-2 text-slate-400">
          <span className="h-2 w-2 rounded-full" style={{ background: GA_COLOR }} />
          Goals against
        </dt>
        <dd className="text-right font-semibold text-slate-100">{point.goalsAgainst}</dd>
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

/** Labels only the last point of a line, so the series is named without a number on every point */
function endLabel(text: string, games: number) {
  function EndLabel(props: { x?: number | string; y?: number | string; index?: number }) {
    if (props.index !== games - 1) return null;
    return (
      <text x={Number(props.x) + 8} y={Number(props.y)} dy={4} fill="#cbd5e1" fontSize={11} fontWeight={600}>
        {text}
      </text>
    );
  }
  return EndLabel;
}

export default function RollingForm() {
  const { teams, loading: teamsLoading, error: teamsError } = useAnalyticsStandings();
  const [selected, setSelected] = useState<string | null>(null);
  const [window, setWindow] = useState<(typeof WINDOWS)[number]>(5);
  const [form, setForm] = useState<FormState | null>(null);

  const teamOptions = useMemo(() => [...teams].sort((a, b) => a.name.localeCompare(b.name)), [teams]);
  // Default to the league points leader until someone picks a team
  const leader = useMemo(() => [...teams].sort((a, b) => b.points - a.points)[0], [teams]);
  const abbrev = selected ?? leader?.abbrev ?? null;
  const team = teams.find((t) => t.abbrev === abbrev);

  useEffect(() => {
    if (!abbrev) return;
    let cancelled = false;
    fetch(`/api/analytics/team-form/${abbrev}`)
      .then(async (res) => {
        const json = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(json.error ?? "Unable to load games");
        if (!cancelled) setForm({ abbrev, games: json.games ?? [], error: null });
      })
      .catch((e) => {
        if (!cancelled) setForm({ abbrev, games: [], error: e instanceof Error ? e.message : "Unable to load games" });
      });
    return () => {
      cancelled = true;
    };
  }, [abbrev]);

  // Loading until the response for the selected team arrives
  const formLoading = !form || form.abbrev !== abbrev;
  const points = useMemo(() => (form && !formLoading ? rollingForm(form.games, window) : []), [form, formLoading, window]);
  const latest = points[points.length - 1];
  const maxGoals = Math.max(4, Math.ceil(Math.max(...points.map((p) => Math.max(p.rollingGoalsFor, p.rollingGoalsAgainst)), 0)));
  const maxGd = Math.max(3, ...points.map((p) => Math.abs(p.goalDifferential)));
  const showDots = points.length <= 20;

  const tooltip = (
    <Tooltip
      cursor={{ stroke: "#475569", strokeDasharray: "3 3", fill: "rgba(148, 163, 184, 0.08)" }}
      content={({ active, payload }) =>
        active && payload?.length ? <GameTooltip point={payload[0].payload as RollingFormPoint} /> : null
      }
    />
  );

  return (
    <Card className="p-5 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-5">
        <div>
          <h2 className="text-xl font-bold text-white">Rolling Form</h2>
          <p className="text-sm text-slate-400 mt-1">
            Goals for and against per game, averaged over a rolling window
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label htmlFor="rolling-form-team" className="sr-only">Team</label>
          <select
            id="rolling-form-team"
            value={abbrev ?? ""}
            onChange={(e) => setSelected(e.target.value)}
            disabled={teamOptions.length === 0}
            className="focus-ring h-10 rounded-full bg-slate-800/70 px-4 text-sm font-semibold text-slate-100 border border-slate-700 hover:bg-slate-700/70 transition-colors"
          >
            {teamOptions.map((t) => (
              <option key={t.abbrev} value={t.abbrev}>{t.name}</option>
            ))}
          </select>
          {WINDOWS.map((w) => (
            <Pill key={w} active={window === w} onClick={() => setWindow(w)}>Last {w}</Pill>
          ))}
        </div>
      </div>

      {teamsLoading ? (
        <LoadingState label="Loading teams..." />
      ) : teamsError ? (
        <ErrorState message={teamsError} />
      ) : !team ? (
        <EmptyState message="No teams available right now." />
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <StatTile label="Last 10 record" value={formatRecord(team.l10)} />
            <StatTile label="Last 10 goal diff" value={formatSigned(team.l10.goalDifferential, 0)} />
            <StatTile label={`GF / gm (last ${window})`} value={latest ? latest.rollingGoalsFor.toFixed(2) : "–"} />
            <StatTile label={`GA / gm (last ${window})`} value={latest ? latest.rollingGoalsAgainst.toFixed(2) : "–"} />
          </div>

          {formLoading ? (
            <LoadingState label={`Loading ${team.name} games...`} />
          ) : form?.error ? (
            <ErrorState message={form.error} />
          ) : points.length === 0 ? (
            <EmptyState message="No completed games yet this season." />
          ) : (
            <>
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mb-3 text-xs text-slate-300">
                <span className="flex items-center gap-2">
                  <span className="h-0.5 w-4 rounded-full" style={{ background: GF_COLOR }} />
                  Goals for / gm
                </span>
                <span className="flex items-center gap-2">
                  <span className="h-0.5 w-4 rounded-full" style={{ background: GA_COLOR }} />
                  Goals against / gm
                </span>
              </div>

              <div className="h-[240px] sm:h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={points} margin={{ top: 8, right: 32, bottom: 8, left: 0 }}>
                    <CartesianGrid vertical={false} stroke="#1e293b" />
                    <XAxis dataKey="game" tick={AXIS_TICK} axisLine={false} tickLine={false} hide />
                    <YAxis
                      domain={[0, maxGoals]}
                      ticks={Array.from({ length: maxGoals + 1 }, (_, i) => i)}
                      interval={0}
                      allowDecimals={false}
                      tick={AXIS_TICK}
                      axisLine={false}
                      tickLine={false}
                      width={32}
                    />
                    {tooltip}
                    <Line
                      dataKey="rollingGoalsFor"
                      stroke={GF_COLOR}
                      strokeWidth={2}
                      dot={showDots ? { r: 4, fill: GF_COLOR, stroke: "#0b111b", strokeWidth: 2 } : false}
                      activeDot={{ r: 5, stroke: "#0b111b", strokeWidth: 2 }}
                      label={endLabel("GF", points.length)}
                      isAnimationActive={false}
                    />
                    <Line
                      dataKey="rollingGoalsAgainst"
                      stroke={GA_COLOR}
                      strokeWidth={2}
                      dot={showDots ? { r: 4, fill: GA_COLOR, stroke: "#0b111b", strokeWidth: 2 } : false}
                      activeDot={{ r: 5, stroke: "#0b111b", strokeWidth: 2 }}
                      label={endLabel("GA", points.length)}
                      isAnimationActive={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-4 mb-1 text-xs text-slate-400">Goal differential by game</div>
              <div className="h-[120px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={points} margin={{ top: 4, right: 32, bottom: 0, left: 0 }}>
                    <XAxis
                      dataKey="game"
                      tick={AXIS_TICK}
                      axisLine={false}
                      tickLine={false}
                      interval="preserveStartEnd"
                      tickFormatter={(g: number) => `G${g}`}
                    />
                    <YAxis
                      domain={[-maxGd, maxGd]}
                      allowDecimals={false}
                      tickFormatter={(v: number) => formatSigned(v, 0)}
                      tick={AXIS_TICK}
                      axisLine={false}
                      tickLine={false}
                      width={32}
                    />
                    <ReferenceLine y={0} stroke="#475569" />
                    <Bar dataKey="goalDifferential" shape={GdBar} maxBarSize={24} isAnimationActive={false} />
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
                        <th className="pb-2 px-2 font-semibold">GM</th>
                        <th className="pb-2 px-2 font-semibold">Date</th>
                        <th className="pb-2 px-2 font-semibold">Opp</th>
                        <th className="pb-2 px-2 font-semibold text-right">Result</th>
                        <th className="pb-2 px-2 font-semibold text-right">GF</th>
                        <th className="pb-2 px-2 font-semibold text-right">GA</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...points].reverse().map((p) => (
                        <tr key={p.gameId} className="border-b border-slate-800/60 last:border-0">
                          <td className="py-2 px-2 text-slate-400">{p.game}</td>
                          <td className="py-2 px-2 text-slate-300">{formatGameDate(p.date)}</td>
                          <td className="py-2 px-2 text-slate-100">{p.isHome ? "vs" : "@"} {p.opponent}</td>
                          <td className="py-2 px-2 text-right text-slate-300">
                            {p.result}
                            {p.decidedIn !== "REG" ? ` (${p.decidedIn})` : ""}
                          </td>
                          <td className="py-2 px-2 text-right text-slate-100">{p.goalsFor}</td>
                          <td className="py-2 px-2 text-right text-slate-100">{p.goalsAgainst}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </details>
            </>
          )}
        </>
      )}
    </Card>
  );
}
