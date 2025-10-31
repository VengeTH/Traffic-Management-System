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
    <div className="space-y-6 pt-8 px-4 pb-8">
      {/* Driver License Warning */}
      {!user?.driverLicenseNumber && (
        <div className="relative overflow-hidden bg-gradient-to-r from-amber-50 via-yellow-50 to-orange-50 border-l-4 border-amber-500 rounded-xl p-5 shadow-md">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-200/20 rounded-full -mr-16 -mt-16 blur-2xl"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-orange-200/20 rounded-full -ml-12 -mb-12 blur-xl"></div>
          <div className="relative flex items-start">
            <div className="flex-shrink-0 p-2 bg-amber-100 rounded-lg">
              <AlertCircle className="h-6 w-6 text-amber-700" />
            </div>
            <div className="ml-4 flex-1">
              <h3 className="text-base font-bold text-amber-900">
                Driver's License Required
              </h3>
              <div className="mt-2 text-sm text-amber-800 leading-relaxed">
                <p>
                  To view and manage your violations, please add your driver's license number to your profile.
                </p>
              </div>
              <div className="mt-4">
                <Link to="/profile">
                  <Button variant="primary" size="sm" className="shadow-lg hover:shadow-xl">
                    Add Driver's License
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Welcome Section */}
      <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-8 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-100/30 rounded-full -mr-48 -mt-48 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-blue-100/20 rounded-full -ml-36 -mb-36 blur-2xl"></div>
        <div className="relative">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl shadow-lg">
              <FileText className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-3xl font-extrabold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
              Welcome back, {user?.firstName}!
            </h1>
          </div>
          <p className="text-gray-600 mt-2 text-base font-medium">
            Here's what's happening with your traffic violations and payments.
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="group relative overflow-hidden border-2 border-transparent hover:border-primary-300 transition-all duration-300 shadow-lg hover:shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-cyan-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <CardContent className="p-6 relative">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Search className="h-6 w-6 text-white" />
              </div>
              <div className="w-12 h-12 bg-blue-200/30 rounded-full blur-2xl absolute top-0 right-0 -mr-6 -mt-6"></div>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-1">Search Violations</h3>
            <p className="text-sm text-gray-600 mb-5 leading-relaxed">Look up your traffic violations by OVR, plate number, or license</p>
            <Link to="/violations/search">
              <Button variant="primary" size="sm" className="w-full shadow-md hover:shadow-lg transition-all">
                Search Now
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="group relative overflow-hidden border-2 border-transparent hover:border-green-300 transition-all duration-300 shadow-lg hover:shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-white to-emerald-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <CardContent className="p-6 relative">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                <CreditCard className="h-6 w-6 text-white" />
              </div>
              <div className="w-12 h-12 bg-green-200/30 rounded-full blur-2xl absolute top-0 right-0 -mr-6 -mt-6"></div>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-1">Payment History</h3>
            <p className="text-sm text-gray-600 mb-5 leading-relaxed">View all your payment records and download receipts</p>
            <Link to="/payments">
              <Button variant="outline" size="sm" className="w-full border-2 hover:bg-green-50 transition-colors">
                View History
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="group relative overflow-hidden border-2 border-transparent hover:border-purple-300 transition-all duration-300 shadow-lg hover:shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-white to-pink-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <CardContent className="p-6 relative">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-purple-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300 border-2 border-purple-700">
                <User className="h-6 w-6 text-white" />
              </div>
              <div className="w-12 h-12 bg-purple-200/30 rounded-full blur-2xl absolute top-0 right-0 -mr-6 -mt-6"></div>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-1">Profile</h3>
            <p className="text-sm text-gray-600 mb-5 leading-relaxed">Manage your account information and preferences</p>
            <Link to="/profile">
              <Button variant="outline" size="sm" className="w-full border-2 hover:bg-purple-50 transition-colors">
                Edit Profile
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <Card className="relative overflow-hidden border border-slate-200 shadow-md hover:shadow-xl transition-all duration-300 group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100/40 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-blue-200/50 transition-colors"></div>
            <CardContent className="p-6 relative">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Total Violations</p>
                  <p className="text-3xl font-extrabold text-gray-900">{stats.totalViolations}</p>
                </div>
                <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl shadow-lg group-hover:scale-110 transition-transform">
                  <FileText className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border border-slate-200 shadow-md hover:shadow-xl transition-all duration-300 group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-100/40 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-green-200/50 transition-colors"></div>
            <CardContent className="p-6 relative">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Paid Violations</p>
                  <p className="text-3xl font-extrabold text-gray-900">{stats.paidViolations}</p>
                </div>
                <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-700 rounded-2xl shadow-lg group-hover:scale-110 transition-transform">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border border-slate-200 shadow-md hover:shadow-xl transition-all duration-300 group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-100/40 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-amber-200/50 transition-colors"></div>
            <CardContent className="p-6 relative">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Pending</p>
                  <p className="text-3xl font-extrabold text-gray-900">{stats.pendingViolations}</p>
                </div>
                <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-700 rounded-2xl shadow-lg group-hover:scale-110 transition-transform">
                  <Clock className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border border-slate-200 shadow-md hover:shadow-xl transition-all duration-300 group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-100/40 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-emerald-200/50 transition-colors"></div>
            <CardContent className="p-6 relative">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Total Paid</p>
                  <p className="text-2xl font-extrabold text-gray-900">₱{stats.totalAmountPaid?.toFixed(2) || '0.00'}</p>
                </div>
                <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-700 rounded-2xl shadow-lg group-hover:scale-110 transition-transform">
                  <DollarSign className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recent Violations */}
      <Card className="border border-slate-200 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-slate-50 to-white border-b border-slate-200">
          <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <div className="p-2 bg-primary-100 rounded-lg">
              <FileText className="h-5 w-5 text-primary-700" />
            </div>
            Recent Violations
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {recentViolations.length === 0 ? (
            <div className="text-center py-12">
              <div className="relative inline-block mb-4">
                <div className="absolute inset-0 bg-gray-100 rounded-full blur-xl"></div>
                <FileText className="relative mx-auto h-16 w-16 text-gray-300" />
              </div>
              <h3 className="mt-4 text-lg font-bold text-gray-900">No violations found</h3>
              <p className="mt-2 text-sm text-gray-600 max-w-sm mx-auto">
                You don't have any traffic violations on record. Keep up the great driving!
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-gray-100">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-slate-50 to-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Violation
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {recentViolations.map((violation) => (
                    <tr key={violation.id} className="hover:bg-gradient-to-r hover:from-primary-50/50 hover:to-blue-50/30 transition-all duration-150 cursor-pointer">
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
                          className="inline-flex items-center px-3 py-1.5 rounded-lg text-primary-700 bg-primary-50 hover:bg-primary-100 hover:text-primary-800 font-semibold transition-colors duration-150"
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
