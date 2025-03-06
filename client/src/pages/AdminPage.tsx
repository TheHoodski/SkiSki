// client/src/pages/AdminPage.tsx

import CameraDashboard from '../components/admin/CameraDashboard';

export default function AdminPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-mountain-blue">SkiCrowd Admin</h1>
      
      <div className="mb-8">
        <CameraDashboard />
      </div>
      
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">System Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-medium text-blue-800">Backend Status</h3>
            <p className="text-blue-600">
              Processing Interval: 5 minutes
            </p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-medium text-green-800">Database</h3>
            <p className="text-green-600">
              Connected: PostgreSQL
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}