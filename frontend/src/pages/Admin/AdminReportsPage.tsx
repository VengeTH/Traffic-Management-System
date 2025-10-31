import React, { useState } from 'react';
import { BarChart3, Download, FileText, Calendar, DollarSign, TrendingUp } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import Input from '../../components/UI/Input';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import { apiService } from '../../services/api';
import toast from 'react-hot-toast';

const AdminReportsPage: React.FC = () => {
  const [reportType, setReportType] = useState<'violations' | 'payments'>('violations');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<any>(null);

  // * Set default date range to last 30 days
  React.useEffect(() => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 30);
    
    setEndDate(end.toISOString().split('T')[0]);
    setStartDate(start.toISOString().split('T')[0]);
  }, []);

  const generateReport = async () => {
    if (!startDate || !endDate) {
      toast.error('Please select both start and end dates');
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      toast.error('Start date must be before end date');
      return;
    }

    try {
      setLoading(true);
      let response;
      
      if (reportType === 'violations') {
        response = await apiService.getViolationReport({
          startDate,
          endDate,
          format: 'json',
        });
      } else {
        response = await apiService.getPaymentReport({
          startDate,
          endDate,
          format: 'json',
        });
      }

      setReportData(response.data);
      toast.success('Report generated successfully');
    } catch (error: any) {
      console.error('Failed to generate report:', error);
      toast.error(error.response?.data?.message || 'Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const downloadCSV = async () => {
    if (!startDate || !endDate) {
      toast.error('Please select both start and end dates');
      return;
    }

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/admin/reports/${reportType}?startDate=${startDate}&endDate=${endDate}&format=csv`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to download CSV');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${reportType}-${startDate}-to-${endDate}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('CSV downloaded successfully');
    } catch (error: any) {
      console.error('Failed to download CSV:', error);
      toast.error('Failed to download CSV');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-PH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
        <p className="text-gray-600 mt-1">
          Generate reports and view system analytics.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Generate Report</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Report Type Selection */}
            <div>
              <label className="form-label">Report Type</label>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <button
                  onClick={() => setReportType('violations')}
                  className={`p-4 rounded-lg border-2 transition-colors ${
                    reportType === 'violations'
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <FileText className="h-6 w-6 mx-auto mb-2 text-primary-600" />
                  <div className="text-sm font-medium text-gray-900">Violations Report</div>
                  <div className="text-xs text-gray-500">View all violations</div>
                </button>
                <button
                  onClick={() => setReportType('payments')}
                  className={`p-4 rounded-lg border-2 transition-colors ${
                    reportType === 'payments'
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <DollarSign className="h-6 w-6 mx-auto mb-2 text-success-600" />
                  <div className="text-sm font-medium text-gray-900">Payments Report</div>
                  <div className="text-xs text-gray-500">View all payments</div>
                </button>
              </div>
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Input
                  label="Start Date"
                  type="date"
                  value={startDate}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setStartDate(e.target.value)}
                  required
                />
              </div>
              <div>
                <Input
                  label="End Date"
                  type="date"
                  value={endDate}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEndDate(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                variant="primary"
                onClick={generateReport}
                loading={loading}
                disabled={!startDate || !endDate}
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Generate Report
              </Button>
              {reportData && (
                <Button
                  variant="outline"
                  onClick={downloadCSV}
                  disabled={!startDate || !endDate}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download CSV
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Results */}
      {loading ? (
        <Card>
          <CardContent>
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          </CardContent>
        </Card>
      ) : reportData ? (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {reportType === 'violations' && reportData.summary ? (
              <>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <FileText className="h-8 w-8 text-primary-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-500">Total Violations</p>
                        <p className="text-2xl font-semibold text-gray-900">{reportData.summary.total}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <Calendar className="h-8 w-8 text-warning-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-500">Pending</p>
                        <p className="text-2xl font-semibold text-gray-900">{reportData.summary.pending}</p>
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
                        <p className="text-sm font-medium text-gray-500">Paid</p>
                        <p className="text-2xl font-semibold text-gray-900">{reportData.summary.paid}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <TrendingUp className="h-8 w-8 text-secondary-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-500">Total Fines</p>
                        <p className="text-2xl font-semibold text-gray-900">
                          {formatCurrency(reportData.summary.totalFines)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : reportType === 'payments' && reportData.summary ? (
              <>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <FileText className="h-8 w-8 text-primary-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-500">Total Payments</p>
                        <p className="text-2xl font-semibold text-gray-900">{reportData.summary.total}</p>
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
                        <p className="text-sm font-medium text-gray-500">Completed</p>
                        <p className="text-2xl font-semibold text-gray-900">{reportData.summary.completed}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <Calendar className="h-8 w-8 text-danger-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-500">Failed</p>
                        <p className="text-2xl font-semibold text-gray-900">{reportData.summary.failed}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <TrendingUp className="h-8 w-8 text-secondary-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                        <p className="text-2xl font-semibold text-gray-900">
                          {formatCurrency(reportData.summary.totalRevenue)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : null}
          </div>

          {/* Data Table */}
          <Card>
            <CardHeader>
              <CardTitle>
                {reportType === 'violations' ? 'Violations' : 'Payments'} Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {reportType === 'violations' ? (
                        <>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            OVR Number
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Driver
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Type
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Fine
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Date
                          </th>
                        </>
                      ) : (
                        <>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Payment ID
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            OVR Number
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Payer
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Amount
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Method
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Date
                          </th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {reportType === 'violations'
                      ? reportData.violations?.slice(0, 50).map((violation: any) => (
                          <tr key={violation.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {violation.ovrNumber}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {violation.driverName}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {violation.violationType.replace(/_/g, ' ')}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {formatCurrency(parseFloat(violation.totalFine))}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800 capitalize">
                                {violation.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatDate(violation.violationDate)}
                            </td>
                          </tr>
                        ))
                      : reportData.payments?.slice(0, 50).map((payment: any) => (
                          <tr key={payment.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {payment.paymentId}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {payment.ovrNumber}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {payment.payerName}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {formatCurrency(parseFloat(payment.totalAmount))}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                              {payment.paymentMethod?.replace(/_/g, ' ')}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800 capitalize">
                                {payment.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatDate(payment.initiatedAt)}
                            </td>
                          </tr>
                        ))}
                  </tbody>
                </table>
              </div>
              {(reportData.violations?.length > 50 || reportData.payments?.length > 50) && (
                <div className="mt-4 text-sm text-gray-500 text-center">
                  Showing first 50 records. Download CSV for complete report.
                </div>
              )}
            </CardContent>
          </Card>
        </>
      ) : (
        <Card>
          <CardContent>
            <div className="text-center py-12">
              <BarChart3 className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No report generated</h3>
              <p className="mt-1 text-sm text-gray-500">
                Select a date range and click "Generate Report" to view analytics.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminReportsPage;