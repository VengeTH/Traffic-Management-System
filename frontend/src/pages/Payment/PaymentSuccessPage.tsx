import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiService } from '../../services/api';
import { Payment } from '../../types';
import { CheckCircle, Download, Mail, FileText, DollarSign, Calendar } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

const PaymentSuccessPage: React.FC = () => {
  const { paymentId } = useParams<{ paymentId: string }>();
  const [payment, setPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayment = async () => {
      if (!paymentId) return;
      
      try {
        setLoading(true);
        const response = await apiService.getPayment(paymentId);
        setPayment(response.data);
      } catch (error) {
        console.error('Failed to load payment:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPayment();
  }, [paymentId]);

  const handleDownloadReceipt = async () => {
    if (!payment) return;
    
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

  if (!payment) {
    return (
      <div className="text-center py-12">
        <FileText className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-lg font-medium text-gray-900">Payment Not Found</h3>
        <p className="mt-1 text-sm text-gray-500">
          The payment you're looking for doesn't exist.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Success Header */}
      <div className="text-center bg-white rounded-lg shadow p-8">
        <div className="mx-auto h-16 w-16 text-success-600 mb-4">
          <CheckCircle className="h-16 w-16" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Payment Successful!
        </h1>
        <p className="text-lg text-gray-600">
          Your payment has been processed successfully. A receipt has been sent to your email.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Details */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">Receipt Number:</span>
                <span className="text-sm text-gray-900 font-mono">{payment.receiptNumber}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">Payment ID:</span>
                <span className="text-sm text-gray-900 font-mono">{payment.paymentId}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">Amount Paid:</span>
                <span className="text-lg font-bold text-success-600">₱{payment.amount.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">Payment Method:</span>
                <span className="text-sm text-gray-900 capitalize">{payment.paymentMethod}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">Payment Provider:</span>
                <span className="text-sm text-gray-900">{payment.paymentProvider}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">Status:</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-success-600 bg-success-50">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Completed
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">Date:</span>
                <span className="text-sm text-gray-900">
                  {new Date(payment.completedAt || payment.initiatedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Violation Details */}
        <Card>
          <CardHeader>
            <CardTitle>Violation Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">OVR Number:</span>
                <span className="text-sm text-gray-900">{payment.ovrNumber}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">Citation Number:</span>
                <span className="text-sm text-gray-900">{payment.citationNumber}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">Payer Name:</span>
                <span className="text-sm text-gray-900">{payment.payerName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">Payer Email:</span>
                <span className="text-sm text-gray-900">{payment.payerEmail}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Next Steps</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              variant="primary"
              onClick={handleDownloadReceipt}
              className="flex items-center justify-center"
            >
              <Download className="h-5 w-5 mr-2" />
              Download Receipt
            </Button>
            <Button
              variant="outline"
              onClick={() => {/* TODO: Implement email receipt */}}
              className="flex items-center justify-center"
            >
              <Mail className="h-5 w-5 mr-2" />
              Email Receipt
            </Button>
            <Link to="/dashboard">
              <Button
                variant="outline"
                className="w-full flex items-center justify-center"
              >
                <FileText className="h-5 w-5 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Important Information */}
      <Card>
        <CardHeader>
          <CardTitle>Important Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex">
              <CheckCircle className="h-5 w-5 text-blue-400 mt-0.5" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">Payment Confirmed</h3>
                <p className="text-sm text-blue-700 mt-1">
                  Your payment has been successfully processed and recorded in our system. 
                  Please keep your receipt number ({payment.receiptNumber}) for your records. 
                  You may be required to present this receipt if there are any questions about your payment.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentSuccessPage;
