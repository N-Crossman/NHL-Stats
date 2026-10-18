import SectionHeading from "../components/ui/SectionHeading";
import { EmptyState } from "../components/ui/StateMessage";

export default function AnalyticsPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <SectionHeading title="Analytics" subtitle="Projections & trends" align="left" />
      <EmptyState message="Charts coming soon." />
    </div>
  );
}
