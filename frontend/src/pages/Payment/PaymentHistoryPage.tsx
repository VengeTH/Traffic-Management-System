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
    <div className="space-y-6 pt-8 px-4 pb-8">
      {/* Header */}
      <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-8 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-green-100/30 rounded-full -mr-48 -mt-48 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-emerald-100/20 rounded-full -ml-36 -mb-36 blur-2xl"></div>
        <div className="relative flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-700 rounded-xl shadow-lg">
            <CreditCard className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
              Payment History
            </h1>
            <p className="text-gray-600 mt-2 text-base font-medium">
              View your payment records and download receipts.
            </p>
          </div>
        </div>
      </div>

      {/* Payment History */}
      <Card className="border border-slate-200 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-slate-50 to-white border-b border-slate-200">
          <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <FileText className="h-5 w-5 text-green-700" />
            </div>
            Payment Records
            {payments.length > 0 && (
              <span className="ml-2 text-sm font-normal text-gray-500">
                ({payments.length} payment{payments.length !== 1 ? 's' : ''})
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {payments.length === 0 ? (
            <div className="text-center py-16">
              <div className="relative inline-block mb-4">
                <div className="absolute inset-0 bg-green-100 rounded-full blur-xl"></div>
                <CreditCard className="relative mx-auto h-16 w-16 text-gray-300" />
              </div>
              <h3 className="mt-4 text-lg font-bold text-gray-900">No payments found</h3>
              <p className="mt-2 text-sm text-gray-600 max-w-sm mx-auto">
                You haven't made any payments yet. Payments will appear here once completed.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {payments.map((payment) => (
                <div
                  key={payment.id}
                  className="group relative overflow-hidden bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-green-300 hover:shadow-xl transition-all duration-300"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-green-50/30 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-green-100/40 transition-colors"></div>
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
                        <div className="flex space-x-2 relative z-10">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownloadReceipt(payment)}
                            className="border-2 hover:bg-green-50 transition-colors"
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
