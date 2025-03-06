// client/src/components/admin/CameraDashboard.tsx

import { useState, useEffect } from 'react';
// If you get axios import errors, make sure to run:
// npm install axios --save
// in your client directory
import axios from 'axios';

interface ResortCamera {
  resortId: string;
  name: string;
  streamUrl: string;
  webcamType: 'direct_stream' | 'static_image' | 'youtube' | 'other';
  youtubeVideoId?: string;
  processingActive: boolean;
  lastProcessed?: string;
}

const API_BASE_URL = 'http://localhost:3000/api';

export default function CameraDashboard() {
  const [cameras, setCameras] = useState<ResortCamera[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCameraStatus = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/camera-control/status`);
        setCameras(response.data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch camera status');
        console.error('Error fetching camera status:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCameraStatus();
    const interval = setInterval(fetchCameraStatus, 30000); // Refresh every 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  const toggleProcessing = async (resortId: string, shouldStart: boolean) => {
    try {
      const endpoint = shouldStart ? 'start' : 'stop';
      await axios.post(`${API_BASE_URL}/camera-control/${resortId}/${endpoint}`);
      
      // Update local state to show immediate feedback
      setCameras(cameras.map(camera => 
        camera.resortId === resortId 
          ? { ...camera, processingActive: shouldStart } 
          : camera
      ));
    } catch (err) {
      setError(`Failed to ${shouldStart ? 'start' : 'stop'} processing`);
      console.error('Error toggling processing:', err);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8"><div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div></div>;
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">Resort Camera Management</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Resort</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Processed</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stream URL</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {cameras.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                  No cameras configured
                </td>
              </tr>
            ) : (
              cameras.map((camera) => (
                <tr key={camera.resortId}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{camera.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      camera.webcamType === 'direct_stream' ? 'bg-blue-100 text-blue-800' :
                      camera.webcamType === 'static_image' ? 'bg-green-100 text-green-800' :
                      camera.webcamType === 'youtube' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {camera.webcamType.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      camera.processingActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {camera.processingActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {camera.lastProcessed 
                      ? new Date(camera.lastProcessed).toLocaleString()
                      : 'Never'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 truncate max-w-xs">
                    {camera.webcamType === 'youtube' && camera.youtubeVideoId 
                      ? `YouTube ID: ${camera.youtubeVideoId}`
                      : camera.streamUrl}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {camera.webcamType === 'direct_stream' || camera.webcamType === 'static_image' ? (
                      camera.processingActive ? (
                        <button
                          className="text-red-600 hover:text-red-900"
                          onClick={() => toggleProcessing(camera.resortId, false)}
                        >
                          Stop
                        </button>
                      ) : (
                        <button
                          className="text-green-600 hover:text-green-900"
                          onClick={() => toggleProcessing(camera.resortId, true)}
                        >
                          Start
                        </button>
                      )
                    ) : (
                      <span className="text-gray-400">Not Supported</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}