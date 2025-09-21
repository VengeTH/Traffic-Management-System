import React from 'react';
import { FileText } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/UI/Card';

const AdminViolationsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900">Manage Violations</h1>
        <p className="text-gray-600 mt-1">
          View and manage all traffic violations in the system.
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Violations Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Violations Management</h3>
            <p className="mt-1 text-sm text-gray-500">
              This feature is coming soon...
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminViolationsPage;
