import Link from 'next/link';
import { FaGithub, FaLinkedin } from 'react-icons/fa';
import { GiHockey } from 'react-icons/gi';

export default function Footer() {
  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/teams', label: 'Teams' },
    { href: '/players', label: 'Players' },
    { href: '/stats', label: 'Stats' },
  ];

  return (
    <footer className="border-t border-slate-800/80 bg-slate-950/60 px-4 py-10 mt-12">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <GiHockey className="text-red-500" size={20} />
            <h2 className="text-lg font-extrabold brand-text">Pucklytics</h2>
          </div>
          <p className="text-sm text-slate-400 max-w-xs">
            Your go-to source for comprehensive NHL statistics and information.
          </p>
        </div>

        <div className="flex flex-col items-start md:items-center gap-3">
          <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wide">Explore</h3>
          <div className="grid grid-cols-2 gap-x-8 gap-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-slate-400 hover:text-cyan-400 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex flex-col items-start md:items-end gap-2">
          <div className="flex items-center gap-4">
            <Link
              href="https://github.com/N-Crossman"
              target="_blank"
              className="text-slate-400 hover:text-cyan-400 transition-colors"
              aria-label="GitHub"
            >
              <FaGithub size={20} />
            </Link>
            <Link
              href="https://www.linkedin.com/in/noah-crossman/"
              target="_blank"
              className="text-slate-400 hover:text-cyan-400 transition-colors"
              aria-label="LinkedIn"
            >
              <FaLinkedin size={20} />
            </Link>
          </div>
          <p className="text-xs text-slate-500 mt-2">© {new Date().getFullYear()} Pucklytics</p>
          <p className="text-xs text-slate-500">Data sourced from the NHL API.</p>
        </div>
      </div>
    </footer>
  );
}
