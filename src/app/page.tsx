import Scoreboard from './components/scoreboard/Scoreboard';
import Standings from './components/standings/Standings';

export default function Home () {
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

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
