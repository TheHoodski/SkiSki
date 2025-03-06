// client/src/pages/ResortPage.tsx

import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { fetchResortDetails } from '../utils/api';
import BaseCamView from '../components/resort/BaseCamView';
import CrowdingTrend from '../components/resort/CrowdingTrend';
import ResortVisualization from '../components/resort/ResortVisualization';

// Simple Loading component
const Loading = () => (
  <div className="flex justify-center items-center h-32">
    <span className="text-lg">Loading...</span>
  </div>
);

export default function ResortPage() {
  const { id } = useParams<{ id: string }>();
  
  // Properly typed useQuery
  const { 
    data: resort, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['resort', id],
    queryFn: () => fetchResortDetails(id || ''),
    enabled: !!id
  });

  if (isLoading) return <Loading />;
  if (error || !resort) return <div className="text-red-500">Error fetching resort details</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-mountain-blue">{resort.name}</h1>
      
      <div className="mb-8">
        <ResortVisualization resort={resort} />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h2 className="text-2xl font-semibold mb-4 text-mountain-blue">Live Camera Feed</h2>
          <BaseCamView url={resort.base_cam_url} />
        </div>
        <div>
          <h2 className="text-2xl font-semibold mb-4 text-mountain-blue">Crowding Trend</h2>
          {resort.crowding_history && resort.crowding_history.length > 0 ? (
            <CrowdingTrend data={resort.crowding_history} />
          ) : (
            <div className="p-4 bg-blue-100 rounded-lg">No historical data available yet</div>
          )}
        </div>
      </div>
    </div>
  );
}