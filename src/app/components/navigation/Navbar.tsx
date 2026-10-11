"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { GiHockey } from "react-icons/gi";
import { HiOutlineMenu, HiOutlineX } from "react-icons/hi";

export default function Navbar() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const pathname = usePathname();

    const navLinks = [
        { href: "/", label: "Home" },
        { href: "/teams", label: "Teams" },
        { href: "/players", label: "Players" },
        { href: "/stats", label: "Stats" },
    ];

    const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname?.startsWith(href));

    return (
    <nav className="fixed top-0 w-full z-50 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2 text-xl font-extrabold text-white focus-ring rounded-lg">
          <GiHockey className="text-red-500" size={24} />
          <span className="brand-text">Pucklytics</span>
        </Link>

        <ul className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={`text-sm font-semibold transition-colors ${
                  isActive(link.href) ? "text-cyan-400" : "text-slate-300 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <button
          className="md:hidden text-2xl text-slate-200 focus-ring rounded-lg p-1"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle navigation menu"
          aria-expanded={isMobileMenuOpen}
        >
          {isMobileMenuOpen ? <HiOutlineX /> : <HiOutlineMenu />}
        </button>
      </div>

      <div
        className={`md:hidden overflow-hidden transition-[max-height] duration-300 ease-in-out border-t border-slate-800/80 ${
          isMobileMenuOpen ? "max-h-64" : "max-h-0"
        }`}
      >
        <ul className="flex flex-col px-4 py-2 bg-slate-950/95">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={`block py-3 text-base font-semibold transition-colors ${
                  isActive(link.href) ? "text-cyan-400" : "text-slate-300 hover:text-white"
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
