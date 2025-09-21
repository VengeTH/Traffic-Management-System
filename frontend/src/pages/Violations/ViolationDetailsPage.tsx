import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiService } from '../../services/api';
import { Violation } from '../../types';
import { Car, FileText, AlertTriangle, CheckCircle, Clock, MapPin, Calendar, DollarSign } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

const ViolationDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [violation, setViolation] = useState<Violation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchViolation = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const response = await apiService.getViolation(id);
        setViolation(response.data);
      } catch (error) {
        console.error('Failed to load violation:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchViolation();
  }, [id]);

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

  if (!violation) {
    return (
      <div className="text-center py-12">
        <FileText className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-lg font-medium text-gray-900">Violation Not Found</h3>
        <p className="mt-1 text-sm text-gray-500">
          The violation you're looking for doesn't exist or has been removed.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Violation Details</h1>
            <p className="text-gray-600 mt-1">
              Complete information about this traffic violation.
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(violation.status)}`}>
              {getStatusIcon(violation.status)}
              <span className="ml-1">{violation.status.toUpperCase()}</span>
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Violation Information */}
        <Card>
          <CardHeader>
            <CardTitle>Violation Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">OVR Number:</span>
                <span className="text-sm text-gray-900 font-mono">{violation.ovrNumber}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">Citation Number:</span>
                <span className="text-sm text-gray-900 font-mono">{violation.citationNumber}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">Violation Type:</span>
                <span className="text-sm text-gray-900">
                  {violation.violationType.replace('_', ' ').toUpperCase()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">Violation Date:</span>
                <span className="text-sm text-gray-900">
                  {new Date(violation.violationDate).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">Violation Time:</span>
                <span className="text-sm text-gray-900">
                  {violation.violationTime}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">Location:</span>
                <span className="text-sm text-gray-900">{violation.violationLocation}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">Description:</span>
                <span className="text-sm text-gray-900">{violation.violationDescription}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Vehicle and Driver Information */}
        <Card>
          <CardHeader>
            <CardTitle>Vehicle & Driver Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">Plate Number:</span>
                <span className="text-sm text-gray-900">{violation.plateNumber}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">Vehicle Type:</span>
                <span className="text-sm text-gray-900 capitalize">{violation.vehicleType}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">Driver Name:</span>
                <span className="text-sm text-gray-900">{violation.driverName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">Driver's License:</span>
                <span className="text-sm text-gray-900">
                  {violation.driverLicenseNumber || 'Not provided'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">Enforcer:</span>
                <span className="text-sm text-gray-900">{violation.enforcerName}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Information */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">Base Fine:</span>
                <span className="text-sm text-gray-900">₱{violation.baseFine.toFixed(2)}</span>
              </div>
              {violation.additionalPenalties > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500">Additional Penalties:</span>
                  <span className="text-sm text-gray-900">₱{violation.additionalPenalties.toFixed(2)}</span>
                </div>
              )}
              <div className="border-t border-gray-200 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold text-gray-900">Total Fine:</span>
                  <span className="text-lg font-bold text-primary-600">₱{violation.totalFine.toFixed(2)}</span>
                </div>
              </div>
              {violation.status === 'pending' && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500">Due Date:</span>
                  <span className="text-sm text-gray-900">
                    {new Date(violation.dueDate).toLocaleDateString()}
                  </span>
                </div>
              )}
              {violation.status === 'paid' && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500">Payment Date:</span>
                  <span className="text-sm text-gray-900">
                    {violation.paymentDate ? new Date(violation.paymentDate).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {violation.status === 'pending' && (
                <Link to={`/payment/${violation.id}`}>
                  <Button variant="primary" className="w-full">
                    <DollarSign className="h-5 w-5 mr-2" />
                    Pay Now
                  </Button>
                </Link>
              )}
              
              {violation.status === 'paid' && (
                <div className="text-center py-4">
                  <CheckCircle className="h-12 w-12 text-success-600 mx-auto mb-2" />
                  <p className="text-sm text-success-600 font-medium">Payment Completed</p>
                </div>
              )}

              <Button
                variant="outline"
                className="w-full"
                onClick={() => {/* TODO: Implement dispute submission */}}
              >
                <AlertTriangle className="h-5 w-5 mr-2" />
                Submit Dispute
              </Button>

              <Link to="/violations/search">
                <Button variant="outline" className="w-full">
                  <FileText className="h-5 w-5 mr-2" />
                  Back to Search
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ViolationDetailsPage;
