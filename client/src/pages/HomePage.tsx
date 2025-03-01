// client/src/pages/HomePage.tsx

import { useQuery } from 'react-query';
import ResortCard from '../components/resort/ResortCard';
import { fetchResorts } from '../utils/api';
import Loading from '../components/Loading';

export default function HomePage() {
  const { data: resorts, isLoading, error } = useQuery('resorts', fetchResorts);

  if (isLoading) return <Loading />;
  if (error) return <div className="text-alpine-red">Error fetching resorts: {(error as Error).message}</div>;
  if (!resorts || resorts.length === 0) return <div>No resorts found</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-mountain-blue">SkiCrowd Resort List</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {resorts.map((resort) => (
          <ResortCard key={resort.resort_id} resort={resort} />
        ))}
      </div>
    </div>
  );
}