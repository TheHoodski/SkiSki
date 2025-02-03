import { Link } from 'react-router-dom'
import CrowdingBadge from './CrowdingBadge'

interface ResortCardProps {
  resort: {
    resort_id: string
    name: string
    current_crowding: string
  }
}

export default function ResortCard({ resort }: ResortCardProps) {
  return (
    <Link to={`/resort/${resort.resort_id}`} className="block">
      <div className="bg-fresh-snow rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
        <h2 className="text-xl font-semibold mb-2">{resort.name}</h2>
        <CrowdingBadge level={resort.current_crowding} />
      </div>
    </Link>
  )
}

