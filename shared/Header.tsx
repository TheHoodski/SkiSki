import { Link } from 'react-router-dom'

export default function Header() {
  return (
    <header className="bg-mountain-blue text-snow-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold">SkiCrowd</Link>
        <nav>
          <ul className="flex space-x-4">
            <li><Link to="/" className="hover:text-powder-blue">Home</Link></li>
            <li><Link to="/about" className="hover:text-powder-blue">About</Link></li>
          </ul>
        </nav>
      </div>
    </header>
  )
}

