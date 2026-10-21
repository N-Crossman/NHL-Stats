import Scoreboard from './components/scoreboard/Scoreboard';
import Standings from './components/standings/Standings';

// Rebuild at most once a minute so the date isn't frozen at deploy time
export const revalidate = 60;

/** The NHL's current game day, e.g. "2026-10-20" — the same day the scoreboard shows. */
async function getGameDay(): Promise<string | null> {
  try {
    const response = await fetch('https://api-web.nhle.com/v1/score/now', { next: { revalidate: 60 } });
    if (!response.ok) return null;
    const data = await response.json();
    return data.currentDate ?? null;
  } catch {
    return null;
  }
}

function formatGameDay(gameDay: string | null): string {
  const options: Intl.DateTimeFormatOptions = { weekday: 'long', month: 'long', day: 'numeric' };
  // Noon UTC keeps the calendar day the same no matter the server's time zone
  if (gameDay) return new Date(`${gameDay}T12:00:00Z`).toLocaleDateString('en-US', { ...options, timeZone: 'UTC' });
  // Fallback: today in Eastern time, which the NHL schedule uses
  return new Date().toLocaleDateString('en-US', { ...options, timeZone: 'America/New_York' });
}

export default async function Home () {
  const today = formatGameDay(await getGameDay());

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-10 sm:space-y-14">
      <section className="text-center">
        <p className="text-xs sm:text-sm font-semibold text-cyan-400 tracking-widest uppercase mb-3">
          {today}
        </p>
        <h1 className="text-4xl sm:text-6xl font-extrabold brand-text mb-3">
          Pucklytics
        </h1>
        <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto">
          Live scores, standings, and player stats, plus in-depth analytics that go beyond the box score.
        </p>
      </section>

      <Scoreboard />
      <Standings />
    </div>
  );
}
