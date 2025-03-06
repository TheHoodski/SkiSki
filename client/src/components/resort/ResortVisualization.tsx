
import MountainVisualization from './MountainVisualization';
import CrowdingBadge from './CrowdingBadge';
import { ResortDetails } from '../../types/resort';

interface ResortVisualizationProps {
  resort: ResortDetails;
}

const ResortVisualization = ({ resort }: ResortVisualizationProps) => {
  if (!resort) return null;
  
  return (
    <div className="bg-fresh-snow rounded-lg shadow-md overflow-hidden">
      <div className="p-4 bg-mountain-blue text-white">
        <h2 className="text-xl font-semibold">Mountain Visualization</h2>
      </div>
      
      <div className="p-4">
        <MountainVisualization 
          resortData={resort}
          crowdLevel={resort.current_crowding || 'low'}
        />
        
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center">
            <span className="mr-2">Current Status:</span>
            <CrowdingBadge level={resort.current_crowding || 'unknown'} />
          </div>
          
          {resort.current_confidence && (
            <span className="text-sm text-gray-600">
              Confidence: {(resort.current_confidence * 100).toFixed(0)}%
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResortVisualization;