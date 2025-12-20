import { NextResponse } from "next/server";

export async function GET(
    _req: Request,
    { params }: { params: { abbrev: string } }
) {
    try {
        const abbrev = params.abbrev.toUpperCase();
        const response = await fetch("https://api-web.nhle.com/v1/teams");
        const data = await response.json();
        const teams = Array.isArray(data?.teams) ? data.teams : [];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const match = teams.find((t: any) => {
            const a = (t.abbreviation ?? t.abbrev ?? "").toUpperCase();
            return a === abbrev;
        });

        if (!match) {
            return NextResponse.json({ team: null }, { status: 404 });
        }

        const team = {
            teamId: match.id,
            name: match.name?.default ?? match.name ?? abbrev,
            abbrev: match.abbreviation ?? match.abbrev ?? abbrev,
            logo: match.logo ?? null,
            darkLogo: match.darkLogo ?? null,
        };

        return NextResponse.json({ team });
    } catch {
        return NextResponse.json({ error: "Unable to fetch team" }, { status: 500 });
    }
}