import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePayment } from '../../contexts/PaymentContext';
import { apiService } from '../../services/api';
import { Violation, PaymentGateway } from '../../types';
import { CreditCard, Shield, CheckCircle, AlertTriangle, Clock, DollarSign } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

const PaymentPage: React.FC = () => {
  const { violationId } = useParams<{ violationId: string }>();
  const navigate = useNavigate();
  const { initiatePayment, paymentGateways } = usePayment();
  
  const [violation, setViolation] = useState<Violation | null>(null);
  const [selectedGateway, setSelectedGateway] = useState<PaymentGateway | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchViolation = async () => {
      if (!violationId) return;
      
      try {
        setLoading(true);
        const response = await apiService.getViolation(violationId);
        const violationData = response.data;
        
        if (violationData.status === 'paid') {
          setError('This violation has already been paid.');
          return;
        }
        
        setViolation(violationData);
      } catch (error: any) {
        setError(error.message || 'Failed to load violation details.');
      } finally {
        setLoading(false);
      }
    };

    fetchViolation();
  }, [violationId]);

  const handlePayment = async () => {
    if (!violation || !selectedGateway) return;

    try {
      setProcessing(true);
      setError(null);

      const payment = await initiatePayment({
        violationId: violation.id,
        paymentMethod: selectedGateway.id,
        amount: violation.totalFine,
        payerName: `${violation.driverName}`,
        payerEmail: 'driver@example.com', // This should come from user context
      });

      // Redirect to payment success page
      navigate(`/payment/success/${payment.id}`);
    } catch (error: any) {
      setError(error.message || 'Payment initiation failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="h-5 w-5 text-success-600" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-warning-600" />;
      case 'overdue':
        return <AlertTriangle className="h-5 w-5 text-danger-600" />;
      default:
        return <Clock className="h-5 w-5 text-gray-600" />;
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

  if (error && !violation) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="mx-auto h-12 w-12 text-danger-600" />
        <h3 className="mt-2 text-lg font-medium text-gray-900">Error</h3>
        <p className="mt-1 text-sm text-gray-500">{error}</p>
        <div className="mt-6">
          <Button variant="primary" onClick={() => navigate('/violations/search')}>
            Back to Search
          </Button>
        </div>
      </div>
    );
  }

  if (!violation) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="mx-auto h-12 w-12 text-gray-400" />
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
        <h1 className="text-2xl font-bold text-gray-900">Payment</h1>
        <p className="text-gray-600 mt-1">
          Complete your payment for the traffic violation.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Violation Details */}
        <Card>
          <CardHeader>
            <CardTitle>Violation Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">OVR Number:</span>
                <span className="text-sm text-gray-900">{violation.ovrNumber}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">Citation Number:</span>
                <span className="text-sm text-gray-900">{violation.citationNumber}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">Plate Number:</span>
                <span className="text-sm text-gray-900">{violation.plateNumber}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">Driver Name:</span>
                <span className="text-sm text-gray-900">{violation.driverName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">Violation Type:</span>
                <span className="text-sm text-gray-900">
                  {violation.violationType.replace('_', ' ').toUpperCase()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">Location:</span>
                <span className="text-sm text-gray-900">{violation.violationLocation}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">Date:</span>
                <span className="text-sm text-gray-900">
                  {new Date(violation.violationDate).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">Status:</span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(violation.status)}`}>
                  {getStatusIcon(violation.status)}
                  <span className="ml-1">{violation.status.toUpperCase()}</span>
                </span>
              </div>
              {violation.status === 'pending' && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500">Due Date:</span>
                  <span className="text-sm text-gray-900">
                    {new Date(violation.dueDate).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Payment Section */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Amount Summary */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-500">Base Fine:</span>
                  <span className="text-sm text-gray-900">₱{violation.baseFine.toFixed(2)}</span>
                </div>
                {violation.additionalPenalties > 0 && (
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-500">Additional Penalties:</span>
                    <span className="text-sm text-gray-900">₱{violation.additionalPenalties.toFixed(2)}</span>
                  </div>
                )}
                <div className="border-t border-gray-200 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold text-gray-900">Total Amount:</span>
                    <span className="text-lg font-bold text-primary-600">₱{violation.totalFine.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Payment Gateway Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Select Payment Method
                </label>
                <div className="space-y-3">
                  {paymentGateways.map((gateway) => (
                    <div
                      key={gateway.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                        selectedGateway?.id === gateway.id
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedGateway(gateway)}
                    >
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <input
                            type="radio"
                            name="paymentGateway"
                            checked={selectedGateway?.id === gateway.id}
                            onChange={() => setSelectedGateway(gateway)}
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                          />
                        </div>
                        <div className="ml-3 flex-1">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-900">{gateway.name}</p>
                              <p className="text-sm text-gray-500">{gateway.description}</p>
                            </div>
                            <div className="flex items-center space-x-2">
                              {gateway.icons.map((icon, index) => (
                                <div key={index} className="w-8 h-6 bg-gray-100 rounded flex items-center justify-center">
                                  <span className="text-xs text-gray-600">{icon}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Security Notice */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex">
                  <Shield className="h-5 w-5 text-blue-400 mt-0.5" />
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">Secure Payment</h3>
                    <p className="text-sm text-blue-700 mt-1">
                      Your payment information is encrypted and secure. We use industry-standard security measures to protect your data.
                    </p>
                  </div>
                </div>
              </div>

              {/* Error Display */}
              {error && (
                <div className="bg-danger-50 border border-danger-200 rounded-lg p-4">
                  <div className="flex">
                    <AlertTriangle className="h-5 w-5 text-danger-400 mt-0.5" />
                    <div className="ml-3">
                      <p className="text-sm text-danger-700">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Payment Button */}
              <Button
                variant="primary"
                size="lg"
                loading={processing}
                disabled={!selectedGateway}
                onClick={handlePayment}
                className="w-full flex items-center justify-center"
              >
                <DollarSign className="h-5 w-5 mr-2" />
                Pay ₱{violation.totalFine.toFixed(2)}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PaymentPage;
