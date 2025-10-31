import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../services/api';
import { DashboardStats, Violation } from '../../types';
import {
  Search, CreditCard, FileText, AlertTriangle, CheckCircle, Clock, DollarSign,
  TrendingUp, TrendingDown, Calendar, Car, User, AlertCircle
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentViolations, setRecentViolations] = useState<Violation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [statsResponse, violationsResponse] = await Promise.all([
          apiService.getUserStatistics(),
          apiService.getUserViolations()
        ]);
        
        setStats(statsResponse.data);
        setRecentViolations(violationsResponse.data.violations || []);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="h-5 w-5 text-success-600" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-warning-600" />;
      case 'overdue':
        return <AlertTriangle className="h-5 w-5 text-danger-600" />;
      default:
        return <FileText className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'text-success-600 bg-success-50';
      case 'pending':
        return 'text-warning-600 bg-warning-50';
      case 'overdue':
        return 'text-danger-600 bg-danger-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Driver License Warning */}
      {!user?.driverLicenseNumber && (
        <div className="bg-warning-50 border-l-4 border-warning-400 p-4 rounded-lg">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-warning-600" />
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-sm font-medium text-warning-800">
                Driver's License Required
              </h3>
              <div className="mt-2 text-sm text-warning-700">
                <p>
                  To view and manage your violations, please add your driver's license number to your profile.
                </p>
              </div>
              <div className="mt-4">
                <Link to="/profile">
                  <Button variant="primary" size="sm">
                    Add Driver's License
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Welcome Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.firstName}!
        </h1>
        <p className="text-gray-600 mt-1">
          Here's what's happening with your traffic violations and payments.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Search className="h-8 w-8 text-primary-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Search Violations</h3>
                <p className="text-sm text-gray-500">Look up your traffic violations</p>
              </div>
            </div>
            <div className="mt-4">
              <Link to="/violations/search">
                <Button variant="primary" size="sm" className="w-full">
                  Search Now
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CreditCard className="h-8 w-8 text-success-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Payment History</h3>
                <p className="text-sm text-gray-500">View your payment records</p>
              </div>
            </div>
            <div className="mt-4">
              <Link to="/payments">
                <Button variant="outline" size="sm" className="w-full">
                  View History
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <User className="h-8 w-8 text-secondary-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Profile</h3>
                <p className="text-sm text-gray-500">Update your information</p>
              </div>
            </div>
            <div className="mt-4">
              <Link to="/profile">
                <Button variant="outline" size="sm" className="w-full">
                  Edit Profile
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FileText className="h-8 w-8 text-primary-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Violations</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalViolations}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CheckCircle className="h-8 w-8 text-success-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Paid Violations</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.paidViolations}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Clock className="h-8 w-8 text-warning-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Pending</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.pendingViolations}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <DollarSign className="h-8 w-8 text-success-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Paid</p>
                  <p className="text-2xl font-bold text-gray-900">₱{stats.totalAmountPaid?.toFixed(2) || '0.00'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recent Violations */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Violations</CardTitle>
        </CardHeader>
        <CardContent>
          {recentViolations.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No violations found</h3>
              <p className="mt-1 text-sm text-gray-500">
                You don't have any traffic violations on record.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Violation
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentViolations.map((violation) => (
                    <tr key={violation.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <Car className="h-10 w-10 text-gray-400" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {violation.violationType.replace('_', ' ').toUpperCase()}
                            </div>
                            <div className="text-sm text-gray-500">
                              {violation.plateNumber}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(violation.violationDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ₱{violation.totalFine.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(violation.status)}`}>
                          {getStatusIcon(violation.status)}
                          <span className="ml-1">{violation.status.toUpperCase()}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Link
                          to={`/violations/${violation.id}`}
                          className="text-primary-600 hover:text-primary-900"
                        >
                          View Details
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardPage;
