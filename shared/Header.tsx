// shared/Header.tsx

import { Link } from 'react-router-dom';

export default function Header() {
  return (
    <header className="bg-mountain-blue text-snow-white p-4 shadow-md">
      <div className="container mx-auto flex items-center justify-between">
        <Link to="/" className="text-2xl font-bold flex items-center">
          <span className="mr-2">❄️</span>
          <span>SkiCrowd</span>
        </Link>
        <nav>
          <ul className="flex space-x-6">
            <li>
              <Link to="/" className="hover:text-powder-blue transition-colors">Home</Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}