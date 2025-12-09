"use client";
import { useState } from "react";
import Link from "next/link";

export default function Navbar() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const navLinks = [
        { href: "/", label: "Home" },
        { href: "/teams", label: "Teams" },
        { href: "/players", label: "Players" },
        { href: "/stats", label: "Stats" },
    ];

    return (
    <nav className="bg-gray-900 text-white px-4 py-3 shadow-md fixed w-full z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/" className="text-xl font-extrabold hover:text-blue-300">
          NHL Stats
        </Link>
        
        <ul className="hidden md:flex flex-1 justify-center gap-44">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="hover:text-blue-300 transition-colors font-bold"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <button
          className="md:hidden text-2xl focus:outline-none"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          ☰
        </button>
      </div>

      {isMobileMenuOpen && (
        <ul className="md:hidden absolute top-full right-0 bg-gray-900 w-48 py-2 rounded shadow-md flex flex-col gap-2 px-4">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="hover:text-blue-300 transition-colors font-bold"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </nav>
  );
}