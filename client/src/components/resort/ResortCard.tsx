import { Link } from 'react-router-dom';
import CrowdingBadge from '../resort/CrowdingBadge';

interface Resort {
  resort_id: string;
  name: string;
  current_crowding?: string;
  current_confidence?: number;
  base_cam_url: string;
}

interface ResortCardProps {
  resort: Resort;
}

export default function ResortCard({ resort }: ResortCardProps) {
  return (
    <Link to={`/resort/${resort.resort_id}`} className="block">
      <div className="bg-fresh-snow rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
        <h2 className="text-xl font-semibold text-mountain-blue mb-2">{resort.name}</h2>
        <div className="flex items-center">
          <CrowdingBadge level={resort.current_crowding || 'unknown'} />
        </div>
      </div>
    </Link>
  );
}

