import { NextResponse } from "next/server";

export async function GET() {
  try {
    const response = await fetch("https://api-web.nhle.com/v1/teams");
    const data = await response.json();

    const teams = (data?.teams ?? []).map((team: any) => ({
      teamId: team.id,
      name: team.name?.default ?? team.name,
      abbrev: team.abbreviation ?? team.abbrev,
      logo: team.logo ?? null,
      darkLogo: team.darkLogo ?? null,
    }));

    return NextResponse.json({ teams });
  } catch {
    return NextResponse.json(
      { error: "Unable to fetch teams" },
      { status: 500 }
    );
  }
}
