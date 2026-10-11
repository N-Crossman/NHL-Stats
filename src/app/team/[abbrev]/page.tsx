"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { HiOutlineArrowLeft } from "react-icons/hi";
import Card from "../../components/ui/Card";
import { LoadingState, ErrorState } from "../../components/ui/StateMessage";

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
            } catch (e) {
                setError(e instanceof Error ? e.message : "Unable to load roster");
                setData(null);
            } finally {
                setLoading(false);
            }
        })();
    }, [abbrev]);

    const content = (() => {
        if (loading) return <LoadingState label="Loading roster..." />;
        if (error) return <ErrorState message={error} />;
        if (!data) return <ErrorState message="No roster data available." />;

        const { roster, team } = data;

        const renderPlayerTable = (players: Player[], title: string) => (
            <div className="mb-8">
                <h2 className="text-xl font-bold text-white mb-4">{title}</h2>
                <Card className="overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm sm:text-base">
                            <thead>
                                <tr className="border-b border-slate-800 text-left text-slate-400 text-xs uppercase tracking-wide">
                                    <th className="py-3 px-4">#</th>
                                    <th className="py-3 px-4">Player</th>
                                    <th className="py-3 px-4">Pos</th>
                                </tr>
                            </thead>
                            <tbody>
                                {players.map((player) => (
                                    <tr
                                        key={player.id}
                                        className="border-b border-slate-800/60 last:border-0 hover:bg-slate-800/40 transition-colors"
                                    >
                                        <td className="py-3 px-4 font-semibold text-slate-300">
                                            {player.sweaterNumber}
                                        </td>
                                        <td className="py-2 px-4">
                                            <Link
                                                href={`/player/${player.id}`}
                                                className="flex items-center gap-3 hover:text-cyan-400 transition-colors"
                                            >
                                                {player.headshot && (
                                                    <Image
                                                        src={player.headshot}
                                                        alt={`${player.firstName.default} ${player.lastName.default}`}
                                                        width={44}
                                                        height={44}
                                                        className="rounded-full object-cover bg-slate-800 h-11 w-11"
                                                    />
                                                )}
                                                <span className="font-medium text-slate-100">
                                                    {player.firstName.default} {player.lastName.default}
                                                </span>
                                            </Link>
                                        </td>
                                        <td className="py-3 px-4 text-slate-400">{player.positionCode}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
        );

        return (
            <>
                <div className="flex flex-col items-center text-center mb-10">
                    {team?.logo && (
                        <div className="relative h-28 w-28 sm:h-32 sm:w-32 mb-4">
                            <Image src={team.logo} alt={`${team.name} logo`} fill className="object-contain" />
                        </div>
                    )}
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-2">
                        {team?.name || abbrev.toUpperCase()}
                    </h1>
                    {team && (
                        <p className="text-lg text-slate-400">
                            {team.wins}-{team.losses}-{team.otLosses}
                        </p>
                    )}
                </div>

                {roster.forwards?.length > 0 && renderPlayerTable(roster.forwards, "Forwards")}
                {roster.defensemen?.length > 0 && renderPlayerTable(roster.defensemen, "Defensemen")}
                {roster.goalies?.length > 0 && renderPlayerTable(roster.goalies, "Goalies")}
            </>
        );
    })();

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
            <Link
                href="/teams"
                className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-cyan-400 transition-colors mb-6"
            >
                <HiOutlineArrowLeft /> Back to Teams
            </Link>
            {content}
        </div>
    );
}
