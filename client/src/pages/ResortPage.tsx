// client/src/pages/ResortPage.tsx

import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { fetchResortDetails } from '../utils/api';
import CrowdingBadge from '../components/resort/CrowdingBadge';
import BaseCamView from '../components/resort/BaseCamView';
import CrowdingTrend from '../components/resort/CrowdingTrend';
import Loading from '../components/shared/Loading';

export default function ResortPage() {
  const { id } = useParams<{ id: string }>();
  const { data: resort, isLoading, error } = useQuery(['resort', id], () => fetchResortDetails(id as string));

  if (isLoading) return <Loading />;
  if (error) return <div className="text-alpine-red">Error fetching resort details: {(error as Error).message}</div>;
  if (!resort) return <div>Resort not found</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-mountain-blue">{resort.name}</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <div className="mb-4 flex items-center">
            <span className="mr-2">Current Status:</span>
            <CrowdingBadge level={resort.current_crowding || 'unknown'} />
            {resort.current_confidence && (
              <span className="ml-4 text-sm text-gray-600">
                Confidence: {(resort.current_confidence * 100).toFixed(0)}%
              </span>
            )}
          </div>
          <BaseCamView url={resort.base_cam_url} />
        </div>
        <div>
          <h2 className="text-2xl font-semibold mb-4 text-mountain-blue">Crowding Trend</h2>
          {resort.crowding_history && resort.crowding_history.length > 0 ? (
            <CrowdingTrend data={resort.crowding_history} />
          ) : (
            <div className="p-4 bg-ice-blue rounded-lg">No historical data available yet</div>
          )}
        </div>
      </div>
    </div>
  );
}
