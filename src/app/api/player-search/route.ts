import { getPlayerIndex } from "@/app/lib/playerindex";

function normalize(value: string) {
  return value.toLowerCase().replace(/[^a-z\s]/g, "").trim();
}

export async function GET(request: Request) {
  try {
    const query = new URL(request.url).searchParams.get("q") || "";

    if (!query || query.length < 2) {
      return Response.json([]);
    }

    const players = await getPlayerIndex();
    const normalizedQuery = normalize(query);

    const results = players
      .filter(player => normalize(player.name).includes(normalizedQuery))
      .slice(0, 10);

    return Response.json(results);
  } catch (err) {
    console.error("Error in player-search route:", err);
    return new Response("Internal Server Error", { status: 500 });
  }
}
