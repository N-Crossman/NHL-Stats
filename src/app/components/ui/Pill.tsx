export default function Pill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`focus-ring px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
        active
          ? "bg-cyan-600 text-white shadow-lg shadow-cyan-500/20"
          : "bg-slate-800/70 text-slate-300 hover:bg-slate-700/70 hover:text-white"
      }`}
    >
      {children}
    </button>
  );
}
