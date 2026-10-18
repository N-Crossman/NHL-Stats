import SectionHeading from "../components/ui/SectionHeading";
import PlayoffPace from "./PlayoffPace";
import HomeRoadSplits from "./HomeRoadSplits";
import SpecialTeams from "./SpecialTeams";

export default function AnalyticsPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <SectionHeading title="Analytics" subtitle="Projections & trends" align="left" />

      <div className="flex flex-col gap-6 sm:gap-8">
        <PlayoffPace />
        <HomeRoadSplits />
        <SpecialTeams />
      </div>
    </div>
  );
}
