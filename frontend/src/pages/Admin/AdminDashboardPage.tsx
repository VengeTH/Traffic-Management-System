import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiService } from '../../services/api';
import { AdminStats } from '../../types';
import {
  Users, FileText, CreditCard, DollarSign, TrendingUp, TrendingDown,
  AlertTriangle, CheckCircle, Clock, BarChart3, Calendar, MapPin
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

const AdminDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        setLoading(true);
        const response = await apiService.getAdminDashboard();
        setStats(response.data);
      } catch (error) {
        console.error('Failed to fetch admin stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pt-8 px-4 pb-8">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg border-2 border-primary-200 p-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary-50/30 opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
        <div className="relative flex items-center gap-3 mb-2">
          <div className="p-3 bg-primary-600 rounded-xl shadow-md border border-primary-700">
            <BarChart3 className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-1 text-sm font-medium">
              Overview of E-VioPay system performance
            </p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1">
          <CardContent className="p-6 bg-white">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0 p-3 bg-blue-100 rounded-xl">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Manage Violations</h3>
                <p className="text-sm text-gray-500">View and process violations</p>
              </div>
            </div>
            <div className="mt-4">
              <Link to="/admin/violations">
                <Button variant="primary" size="sm" className="w-full shadow-md hover:shadow-lg transition-shadow">
                  View Violations
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1">
          <CardContent className="p-6 bg-white">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0 p-3 bg-green-100 rounded-xl">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Manage Users</h3>
                <p className="text-sm text-gray-500">User management</p>
              </div>
            </div>
            <div className="mt-4">
              <Link to="/admin/users">
                <Button variant="outline" size="sm" className="w-full shadow-md hover:shadow-lg transition-shadow border-green-200 hover:border-green-300">
                  View Users
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1">
          <CardContent className="p-6 bg-white">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0 p-3 bg-purple-100 rounded-xl">
                <BarChart3 className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Reports</h3>
                <p className="text-sm text-gray-500">Generate reports</p>
              </div>
            </div>
            <div className="mt-4">
              <Link to="/admin/reports">
                <Button variant="outline" size="sm" className="w-full shadow-md hover:shadow-lg transition-shadow border-purple-200 hover:border-purple-300">
                  View Reports
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1">
          <CardContent className="p-6 bg-white">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0 p-3 bg-orange-100 rounded-xl">
                <AlertTriangle className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Send Reminders</h3>
                <p className="text-sm text-gray-500">Overdue payments</p>
              </div>
            </div>
            <div className="mt-4">
              <Button variant="outline" size="sm" className="w-full shadow-md hover:shadow-lg transition-shadow border-orange-200 hover:border-orange-300">
                Send Reminders
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Statistics Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="shadow-lg border-2 border-blue-200 hover:border-blue-300 hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1 bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 uppercase tracking-wide mb-1">Total Users</p>
                  <p className="text-3xl font-bold text-gray-900 mb-2">{stats.users.total}</p>
                  <div className="flex items-center">
                    <div className="px-2 py-1 bg-green-100 rounded-full">
                      <span className="text-xs font-semibold text-green-700">{stats.users.active} active</span>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-blue-100 rounded-xl">
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-2 border-orange-200 hover:border-orange-300 hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1 bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 uppercase tracking-wide mb-1">Total Violations</p>
                  <p className="text-3xl font-bold text-gray-900 mb-2">{stats.violations.total}</p>
                  <div className="flex items-center">
                    <div className="px-2 py-1 bg-orange-100 rounded-full">
                      <span className="text-xs font-semibold text-orange-700">{stats.violations.pending} pending</span>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-orange-100 rounded-xl">
                  <FileText className="h-8 w-8 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-2 border-green-200 hover:border-green-300 hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1 bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 uppercase tracking-wide mb-1">Total Payments</p>
                  <p className="text-3xl font-bold text-gray-900 mb-2">{stats.payments.total}</p>
                  <div className="flex items-center">
                    <div className="px-2 py-1 bg-green-100 rounded-full">
                      <span className="text-xs font-semibold text-green-700">{stats.payments.completed} completed</span>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-green-100 rounded-xl">
                  <CreditCard className="h-8 w-8 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-2 border-emerald-200 hover:border-emerald-300 hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1 bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 uppercase tracking-wide mb-1">Total Revenue</p>
                  <p className="text-3xl font-bold text-gray-900 mb-2">₱{stats.payments.revenue?.toFixed(2) || '0.00'}</p>
                  <div className="flex items-center">
                    <div className="px-2 py-1 bg-emerald-100 rounded-full">
                      <span className="text-xs font-semibold text-emerald-700">Revenue</span>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-emerald-100 rounded-xl">
                  <DollarSign className="h-8 w-8 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Status Breakdown */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="shadow-lg border-2 border-green-200 hover:border-green-300 hover:shadow-xl transition-all duration-200 bg-white">
            <CardHeader className="bg-white border-b-2 border-green-200">
              <CardTitle className="flex items-center text-lg font-semibold text-gray-800">
                <div className="p-2 bg-green-100 rounded-lg mr-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                Paid Violations
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="text-4xl font-bold text-green-600 mb-2">{stats.violations.paid}</div>
              <p className="text-sm text-gray-600 font-medium">
                {stats.violations.total > 0 ? ((stats.violations.paid / stats.violations.total) * 100).toFixed(1) : '0.0'}% of total violations
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-2 border-orange-200 hover:border-orange-300 hover:shadow-xl transition-all duration-200 bg-white">
            <CardHeader className="bg-white border-b-2 border-orange-200">
              <CardTitle className="flex items-center text-lg font-semibold text-gray-800">
                <div className="p-2 bg-orange-100 rounded-lg mr-3">
                  <Clock className="h-5 w-5 text-orange-600" />
                </div>
                Pending Violations
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="text-4xl font-bold text-orange-600 mb-2">{stats.violations.pending}</div>
              <p className="text-sm text-gray-600 font-medium">
                {stats.violations.total > 0 ? ((stats.violations.pending / stats.violations.total) * 100).toFixed(1) : '0.0'}% of total violations
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-2 border-red-200 hover:border-red-300 hover:shadow-xl transition-all duration-200 bg-white">
            <CardHeader className="bg-white border-b-2 border-red-200">
              <CardTitle className="flex items-center text-lg font-semibold text-gray-800">
                <div className="p-2 bg-red-100 rounded-lg mr-3">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                </div>
                Overdue Violations
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="text-4xl font-bold text-red-600 mb-2">{stats.violations.overdue}</div>
              <p className="text-sm text-gray-600 font-medium">
                {stats.violations.total > 0 ? ((stats.violations.overdue / stats.violations.total) * 100).toFixed(1) : '0.0'}% of total violations
              </p>
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
          <div className="space-y-4">
            {stats?.recentViolations && stats.recentViolations.length > 0 ? (
              stats.recentViolations.slice(0, 5).map((violation, index) => (
                <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0">
                    <FileText className="h-5 w-5 text-warning-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {violation.violationType} - {violation.driverName}
                    </p>
                    <p className="text-sm text-gray-500">
                      {violation.plateNumber} • ₱{violation.totalFine} • {violation.status}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <FileText className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No recent violations</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Recent violations will appear here.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Payments */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Payments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats?.recentPayments && stats.recentPayments.length > 0 ? (
              stats.recentPayments.slice(0, 5).map((payment, index) => (
                <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0">
                    <CreditCard className="h-5 w-5 text-success-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {payment.payerName} - {payment.paymentMethod}
                    </p>
                    <p className="text-sm text-gray-500">
                      ₱{payment.totalAmount} • {payment.status} • {payment.ovrNumber}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <CreditCard className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No recent payments</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Recent payments will appear here.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboardPage;
