import { ReactNode } from "react";

export default function Card({
  children,
  className = "",
  hover = false,
}: {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}) {
  return (
    <div
      className={`glass-panel ${
        hover ? "transition-all duration-300 hover:border-slate-700 hover:shadow-2xl hover:-translate-y-0.5" : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}
