"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

type Player = {
    id: number;
    firstName: { default: string };
    lastName: { default: string };
    sweaterNumber: number;
    positionCode: string;
    headshot: string;
};

type RosterData = {
    forwards: Player[];
    defensemen: Player[];
    goalies: Player[];
};

type TeamInfo = {
    name: string;
    logo: string;
    wins: number;
    losses: number;
    otLosses: number;
};

type ApiResponse = {
    roster: RosterData;
    team: TeamInfo | null;
};

export default function TeamPage() {
    const params = useParams();
    const abbrev = params.abbrev as string;

    const [data, setData] = useState<ApiResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        (async () => {
            try {
                const res = await fetch(`/api/team/${abbrev}/roster`);
                if (!res.ok) throw new Error("Failed to fetch roster");
                const responseData = await res.json();
                setData(responseData);
                setError(null);
            } catch (e: any) {
                setError(e?.message || "Unable to load roster");
                setData(null);
            } finally {
                setLoading(false);
            }
        })();
    }, [abbrev]);

    if (loading) return <div className="max-w-6xl mx-auto p-4">Loading roster...</div>;

    if (error) return <div className="max-w-6xl mx-auto p-4 text-red-600">{error}</div>;

    if (!data) return <div className="max-w-6xl mx-auto p-4">No roster data available.</div>;

    const { roster, team } = data;

    const renderPlayerTable = (players: Player[], title: string) => (
        <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">{title}</h2>
            <div className="overflow-x-auto">
                <table className="w-full border-separate border-spacing-y-2">
                    <thead>
                        <tr className="border-b-2 border-gray-300 dark:border-gray-700">
                            <th className="text-left py-3 px-4">#</th>
                            <th className="text-left py-3 px-4">Player</th>
                            <th className="text-left py-3 px-4">Position</th>
                        </tr>
                    </thead>
                    <tbody>
                        {players.map((player) => (
                            <tr
                                key={player.id}
                                className="bg-black/5 dark:bg-white/5 rounded-xl shadow-sm hover:shadow-lg hover:shadow-blue-500 transition-all duration-200"
                            >
                                <td className="py-3 px-4 font-semibold">
                                    {player.sweaterNumber}
                                </td>
                                <td className="py-3 px-4">
                                    <Link 
                                        href={`/player/${player.id}`}
                                        className="flex items-center gap-3 hover:text-blue-500 transition-colors"
                                    >
                                        {player.headshot && (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img
                                                src={player.headshot}
                                                alt={`${player.firstName.default} ${player.lastName.default}`}
                                                className="w-14 h-14 rounded-full object-cover"
                                            />
                                        )}
                                        <span>
                                            {player.firstName.default} {player.lastName.default}
                                        </span>
                                    </Link>
                                </td>
                                <td className="py-3 px-4">{player.positionCode}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto p-4">
            <Link
                href="/teams"
                className="text-blue-500 hover:text-blue-400 text-sm mb-6 inline-block"
            >
                ← Back to Teams
            </Link>

            <div className="flex flex-col items-center mb-8">
                {team?.logo && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={team.logo}
                        alt={`${team.name} logo`}
                        className="h-32 w-32 object-contain mt-2"
                    />
                )}
                <h1 className="text-4xl font-bold mb-6">
                    {team?.name || abbrev.toUpperCase()}
                </h1>
                {team && (
                    <p className="text-xl text-gray-600 dark:text-gray-400">
                        {team.wins}-{team.losses}-{team.otLosses}
                    </p>
                )}
            </div>

            <div>
                {roster.forwards && roster.forwards.length > 0 &&
                    renderPlayerTable(roster.forwards, "Forwards")}

                {roster.defensemen && roster.defensemen.length > 0 &&
                    renderPlayerTable(roster.defensemen, "Defensemen")}

                {roster.goalies && roster.goalies.length > 0 &&
                    renderPlayerTable(roster.goalies, "Goalies")}
            </div>
        </div>
    );
}
