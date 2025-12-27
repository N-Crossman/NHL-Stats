import Image from 'next/image';
import { notFound } from 'next/navigation';

interface PlayerPageProps {
  params: {
    id: string;
  };
}

export default async function PlayerPage(props: PlayerPageProps) {
    const params = await props.params;
    const { id } = params;
    const base = "https://api-web.nhle.com/v1";

    const res = await fetch(`${base}/player/${id}/landing`, {
    next: { revalidate: 3600 },
  });

  if (!res.ok) {
    return notFound();
  }
  
  const data = await res.json();

  const {
    firstName,
    lastName,
    headshot,
    heroImage,
    position,
    fullTeamName,
    sweaterNumber,
    heightInInches,
    weightInPounds,
    birthDate,
    birthCity,
    birthStateProvince,
    shootsCatches,
    featuredStats,
    careerTotals,
  } = data;

  const fullName = `${firstName.default} ${lastName.default}`;
  const teamName = fullTeamName?.default || 'Free Agent';
  const positionCode = position || 'N/A';
  const isGoalie = position === 'G';
  
  // Convert height to feet and inches
  const feet = Math.floor(heightInInches / 12);
  const inches = heightInInches % 12;
  const heightDisplay = `${feet}'${inches}"`;

  const birthDateFormatted = new Date(birthDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  const birthLocation = birthStateProvince 
    ? `${birthCity.default}, ${birthStateProvince.default}`
    : birthCity.default;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="text-center mb-8 mt-6">
        <Image
            src={headshot}
            alt={fullName}
            width={200}
            height={200}
            className="rounded-full mx-auto mb-4"
        />
        <h1 className="text-4xl font-bold mb-2">{fullName}</h1>
        <p className="text-xl text-gray-400">#{sweaterNumber} - {teamName}</p>
      </div>

      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4">Player Information</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          <InfoCard label="Position" value={positionCode} />
          <InfoCard label="Jersey Number" value={`#${sweaterNumber}`} />
          <InfoCard label="Height" value={heightDisplay} />
          <InfoCard label="Weight" value={`${weightInPounds} lbs`} />
          <InfoCard label="Shoots/Catches" value={shootsCatches} />
          <InfoCard label="Birth Date" value={birthDateFormatted} />
          <InfoCard label="Birth Place" value={birthLocation} />
        </div>
      </section>

      {heroImage && (
        <section className="mb-10">
          <div className="relative w-full h-64 sm:h-96 rounded-lg overflow-hidden">
            <Image
              src={heroImage}
              alt={`${fullName} action shot`}
              fill
              className="object-cover"
            />
          </div>
        </section>
      )}

      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4">Current Season Stats</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {featuredStats?.regularSeason?.subSeason && (
            <>
              {isGoalie ? (
                <>
                  <StatCard label="Games Played" value={featuredStats.regularSeason.subSeason.gamesPlayed} />
                  <StatCard label="Wins" value={featuredStats.regularSeason.subSeason.wins} />
                  <StatCard label="Losses" value={featuredStats.regularSeason.subSeason.losses} />
                  <StatCard label="OT Losses" value={featuredStats.regularSeason.subSeason.otLosses} />
                  <StatCard label="Save %" value={featuredStats.regularSeason.subSeason.savePctg.toFixed(3).substring(1)} />
                  <StatCard label="GAA" value={featuredStats.regularSeason.subSeason.goalsAgainstAvg.toFixed(2)} />
                  <StatCard label="Shutouts" value={featuredStats.regularSeason.subSeason.shutouts} />
                </>
              ) : (
                <>
                  <StatCard label="Games Played" value={featuredStats.regularSeason.subSeason.gamesPlayed} />
                  <StatCard label="Goals" value={featuredStats.regularSeason.subSeason.goals} />
                  <StatCard label="Assists" value={featuredStats.regularSeason.subSeason.assists} />
                  <StatCard label="Points" value={featuredStats.regularSeason.subSeason.points} />
                  <StatCard label="Plus/Minus" value={featuredStats.regularSeason.subSeason.plusMinus} />
                  <StatCard label="PPG" value={featuredStats.regularSeason.subSeason.powerPlayGoals} />
                  <StatCard label="Shots" value={featuredStats.regularSeason.subSeason.shots} />
                  <StatCard label="Shooting %" value={(featuredStats.regularSeason.subSeason.shootingPctg * 100).toFixed(1) + '%'} />
                </>
              )}
            </>
          )}
        </div>
      </section>
        
      <section>
        <h2 className="text-2xl font-semibold mb-4">Career Regular Season Totals</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {careerTotals?.regularSeason && (
            <>
              {isGoalie ? (
                <>
                  <StatCard label="Games Played" value={careerTotals.regularSeason.gamesPlayed} />
                  <StatCard label="Games Started" value={careerTotals.regularSeason.gamesStarted} />
                  <StatCard label="Wins" value={careerTotals.regularSeason.wins} />
                  <StatCard label="Losses" value={careerTotals.regularSeason.losses} />
                  <StatCard label="OT Losses" value={careerTotals.regularSeason.otLosses} />
                  <StatCard label="Save %" value={careerTotals.regularSeason.savePctg.toFixed(3).substring(1)} />
                  <StatCard label="GAA" value={careerTotals.regularSeason.goalsAgainstAvg.toFixed(2)} />
                  <StatCard label="Shutouts" value={careerTotals.regularSeason.shutouts} />
                </>
              ) : (
                <>
                  <StatCard label="Games Played" value={careerTotals.regularSeason.gamesPlayed} />
                  <StatCard label="Goals" value={careerTotals.regularSeason.goals} />
                  <StatCard label="Assists" value={careerTotals.regularSeason.assists} />
                  <StatCard label="Points" value={careerTotals.regularSeason.points} />
                  <StatCard label="Plus/Minus" value={careerTotals.regularSeason.plusMinus} />
                  <StatCard label="PPG" value={careerTotals.regularSeason.powerPlayGoals} />
                  <StatCard label="Shots" value={careerTotals.regularSeason.shots} />
                  <StatCard label="Shooting %" value={(careerTotals.regularSeason.shootingPctg * 100).toFixed(1) + '%'} />
                </>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
    return (
        <div className="rounded-lg border border-neutral-700 p-4 text-center">
            <div className="text-sm text-gray-400 mb-2">{label}</div>
            <div className="text-xl font-bold">{value}</div>
        </div>
    );  
}

function InfoCard({ label, value }: { label: string; value: string | number }) {
    return (
        <div className="rounded-lg border border-neutral-700 p-4">
            <div className="text-xs text-gray-400 mb-1">{label}</div>
            <div className="text-lg font-semibold">{value}</div>
        </div>
    );  
}
