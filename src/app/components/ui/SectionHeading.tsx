export default function SectionHeading({
  title,
  subtitle,
  align = "center",
}: {
  title: string;
  subtitle?: string;
  align?: "center" | "left";
}) {
  return (
    <div className={`mb-4 sm:mb-6 ${align === "center" ? "text-center" : "text-left"}`}>
      <h2 className="text-2xl sm:text-3xl font-bold accent-text">{title}</h2>
      {subtitle && <p className="text-sm text-slate-400 mt-1">{subtitle}</p>}
    </div>
  );
}
