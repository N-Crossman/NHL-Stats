import Scoreboard from './components/scoreboard/Scoreboard';

export default function Home () {
  return (
    <main className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">NHL Stats</h1>
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">Todays Scoreboard</h2>
        <Scoreboard />
      </section>
      </main>
  );
}