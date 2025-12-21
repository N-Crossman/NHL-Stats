import { NextResponse } from "next/server";

export async function GET(
    _req: Request,
    { params }: { params: Promise<{ abbrev: string }> }
) {
    try {
        const { abbrev } = await params;
        const upperAbbrev = abbrev.toUpperCase();

        const rosterResponse = await fetch(
            `https://api-web.nhle.com/v1/roster/${upperAbbrev}/current`
        );

        if (!rosterResponse.ok) {
            return NextResponse.json(
                { error: `Failed to fetch roster: ${rosterResponse.status}` },
                { status: rosterResponse.status }
            );
        }

        const rosterData = await rosterResponse.json();

        const standingsResponse = await fetch(
            "https://api-web.nhle.com/v1/standings/now"
        );

        let teamInfo = null;
        if (standingsResponse.ok) {
            const standingsData = await standingsResponse.json();
            const standings = Array.isArray(standingsData?.standings)
                ? standingsData.standings
                : [];
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            teamInfo = standings.find((t: any) => {
                const a = (t.teamAbbrev?.default ?? t.teamAbbrev ?? "").toUpperCase();
                return a === upperAbbrev;
            });
        }

        return NextResponse.json({
            roster: rosterData,
            team: teamInfo
                ? {
                      name: teamInfo.teamName?.default ?? teamInfo.teamName,
                      logo: teamInfo.teamLogo,
                      wins: teamInfo.wins,
                      losses: teamInfo.losses,
                      otLosses: teamInfo.otLosses,
                  }
                : null,
        });
    } catch (error) {
        return NextResponse.json(
            { error: "Unable to fetch roster" },
            { status: 500 }
        );
    }
}
