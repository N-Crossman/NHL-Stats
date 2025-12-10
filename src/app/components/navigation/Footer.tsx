import Link from 'next/link';
import { FaGithub } from 'react-icons/fa';

export default function Footer() {
  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/teams', label: 'Teams' },
    { href: '/players', label: 'Players' },
    { href: '/stats', label: 'Stats' },
  ];

  return (
    <footer className="bg-gray-900 text-white px-4 py-8 mx-auto w-full">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <h2 className="text-lg font-bold mb-4">NHL Stats App</h2>
          <p className="text-sm">
            Your go-to source for comprehensive NHL statistics and information.
          </p>
        </div>

        <div className="flex flex-col items-center md:items-center gap-2">
          <h3 className="text-md font-semibold mb-4">Explore the Site</h3>
          <div className="grid grid-cols-2 gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="hover:text-blue-300 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
        
        <div className="flex flex-col items-center md:items-end gap-2">
          <p className="text-sm">© {new Date().getFullYear()} NHL Stats App. All rights reserved.</p>
          <p className="text-sm">Data sourced from NHL API.</p>
          <Link
            href="https://github.com/N-Crossman"
            target="_blank"
            className="hover:text-blue-300 transition-colors font-bold"
          >
            <FaGithub size={25} />
          </Link>
        </div>
      </div>
    </footer>
  );
}
            