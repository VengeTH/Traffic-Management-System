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
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Overview of the Las Piñas Traffic Payment System
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FileText className="h-8 w-8 text-primary-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Manage Violations</h3>
                <p className="text-sm text-gray-500">View and process violations</p>
              </div>
            </div>
            <div className="mt-4">
              <Link to="/admin/violations">
                <Button variant="primary" size="sm" className="w-full">
                  View Violations
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-8 w-8 text-success-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Manage Users</h3>
                <p className="text-sm text-gray-500">User management</p>
              </div>
            </div>
            <div className="mt-4">
              <Link to="/admin/users">
                <Button variant="outline" size="sm" className="w-full">
                  View Users
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BarChart3 className="h-8 w-8 text-secondary-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Reports</h3>
                <p className="text-sm text-gray-500">Generate reports</p>
              </div>
            </div>
            <div className="mt-4">
              <Link to="/admin/reports">
                <Button variant="outline" size="sm" className="w-full">
                  View Reports
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-8 w-8 text-warning-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Send Reminders</h3>
                <p className="text-sm text-gray-500">Overdue payments</p>
              </div>
            </div>
            <div className="mt-4">
              <Button variant="outline" size="sm" className="w-full">
                Send Reminders
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Statistics Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Users className="h-8 w-8 text-primary-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.users.total}</p>
                  <div className="flex items-center mt-1">
                    <TrendingUp className="h-4 w-4 text-success-600" />
                    <span className="text-sm text-success-600 ml-1">{stats.users.active} active</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FileText className="h-8 w-8 text-warning-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Violations</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.violations.total}</p>
                  <div className="flex items-center mt-1">
                    <TrendingUp className="h-4 w-4 text-warning-600" />
                    <span className="text-sm text-warning-600 ml-1">{stats.violations.pending} pending</span>
                  </div>
                </div>
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
                  <p className="text-sm font-medium text-gray-500">Total Payments</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.payments.total}</p>
                  <div className="flex items-center mt-1">
                    <TrendingUp className="h-4 w-4 text-success-600" />
                    <span className="text-sm text-success-600 ml-1">{stats.payments.completed} completed</span>
                  </div>
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
                  <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">₱{stats.payments.revenue?.toFixed(2) || '0.00'}</p>
                  <div className="flex items-center mt-1">
                    <TrendingUp className="h-4 w-4 text-success-600" />
                    <span className="text-sm text-success-600 ml-1">₱{stats.payments.revenue?.toFixed(2) || '0.00'}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Status Breakdown */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CheckCircle className="h-5 w-5 text-success-600 mr-2" />
                Paid Violations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-success-600">{stats.violations.paid}</div>
              <p className="text-sm text-gray-500 mt-1">
                {((stats.violations.paid / stats.violations.total) * 100).toFixed(1)}% of total violations
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="h-5 w-5 text-warning-600 mr-2" />
                Pending Violations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-warning-600">{stats.violations.pending}</div>
              <p className="text-sm text-gray-500 mt-1">
                {((stats.violations.pending / stats.violations.total) * 100).toFixed(1)}% of total violations
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="h-5 w-5 text-danger-600 mr-2" />
                Overdue Violations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-danger-600">{stats.violations.overdue}</div>
              <p className="text-sm text-gray-500 mt-1">
                {((stats.violations.overdue / stats.violations.total) * 100).toFixed(1)}% of total violations
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
