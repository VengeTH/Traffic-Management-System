import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/api';
import { Payment } from '../../types';
import { CreditCard, FileText, Download, Calendar, DollarSign } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

const PaymentHistoryPage: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPaymentHistory = async () => {
      try {
        setLoading(true);
        const response = await apiService.getUserPayments();
        setPayments(response.data.payments || []);
      } catch (error) {
        console.error('Failed to fetch payment history:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentHistory();
  }, []);

  const handleDownloadReceipt = async (payment: Payment) => {
    try {
      const receiptBlob = await apiService.getPaymentReceipt(payment.id);
      const url = window.URL.createObjectURL(receiptBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `receipt-${payment.receiptNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download receipt:', error);
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
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900">Payment History</h1>
        <p className="text-gray-600 mt-1">
          View your payment records and download receipts.
        </p>
      </div>

      {/* Payment History */}
      <Card>
        <CardHeader>
          <CardTitle>
            Payment Records
            {payments.length > 0 && (
              <span className="ml-2 text-sm font-normal text-gray-500">
                ({payments.length} payment{payments.length !== 1 ? 's' : ''})
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <div className="text-center py-12">
              <CreditCard className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No payments found</h3>
              <p className="mt-1 text-sm text-gray-500">
                You haven't made any payments yet.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {payments.map((payment) => (
                <div
                  key={payment.id}
                  className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="flex-shrink-0">
                          <CreditCard className="h-8 w-8 text-success-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            Payment #{payment.receiptNumber}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {payment.paymentMethod.toUpperCase()} • {payment.paymentProvider}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                        <div className="flex items-center space-x-2">
                          <DollarSign className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            <span className="font-medium">Amount:</span> ₱{payment.amount.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            <span className="font-medium">Date:</span> {new Date(payment.completedAt || payment.initiatedAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <FileText className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            <span className="font-medium">OVR:</span> {payment.ovrNumber}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-600">
                            <span className="font-medium">Status:</span> 
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-success-600 bg-success-50 ml-1">
                              Completed
                            </span>
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-500">
                          Payment ID: {payment.paymentId}
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownloadReceipt(payment)}
                          >
                            <Download className="h-4 w-4 mr-1" />
                            Download Receipt
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentHistoryPage;
