import React, { useState, useEffect } from 'react';
import { FileText, Search, CheckCircle, XCircle, Clock, AlertTriangle, Filter, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import Input from '../../components/UI/Input';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import { apiService } from '../../services/api';
import { Violation } from '../../types';
import toast from 'react-hot-toast';

const AdminViolationsPage: React.FC = () => {
  const [violations, setViolations] = useState<Violation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(10);
  const [selectedViolation, setSelectedViolation] = useState<Violation | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [disputeData, setDisputeData] = useState({
    approved: true,
    notes: '',
  });

  useEffect(() => {
    fetchViolations();
  }, [page, searchTerm, statusFilter, typeFilter]);

  const fetchViolations = async () => {
    try {
      setLoading(true);
      const params: any = {
        page,
        limit,
      };

      if (searchTerm) {
        params.search = searchTerm;
      }
      if (statusFilter) {
        params.status = statusFilter;
      }
      if (typeFilter) {
        params.violationType = typeFilter;
      }

      const response = await apiService.getAdminViolations(params);
      setViolations(response.data.violations || []);
      setTotalPages(response.data.pagination?.pages || 1);
      setTotal(response.data.pagination?.total || 0);
    } catch (error: any) {
      console.error('Failed to fetch violations:', error);
      toast.error(error.response?.data?.message || 'Failed to load violations');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (violation: Violation) => {
    setSelectedViolation(violation);
    setShowDetailsModal(true);
  };

  const handleProcessDispute = (violation: Violation) => {
    setSelectedViolation(violation);
    setDisputeData({ approved: true, notes: '' });
    setShowDisputeModal(true);
  };

  const handleSubmitDispute = async () => {
    if (!selectedViolation) return;

    try {
      await apiService.processDispute(selectedViolation.id, disputeData);
      toast.success(`Dispute ${disputeData.approved ? 'approved' : 'rejected'} successfully`);
      setShowDisputeModal(false);
      setSelectedViolation(null);
      fetchViolations();
    } catch (error: any) {
      console.error('Failed to process dispute:', error);
      toast.error(error.response?.data?.message || 'Failed to process dispute');
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
      case 'disputed':
        return <FileText className="h-5 w-5 text-blue-600" />;
      case 'dismissed':
        return <XCircle className="h-5 w-5 text-gray-600" />;
      default:
        return <FileText className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-success-100 text-success-800';
      case 'pending':
        return 'bg-warning-100 text-warning-800';
      case 'overdue':
        return 'bg-danger-100 text-danger-800';
      case 'disputed':
        return 'bg-blue-100 text-blue-800';
      case 'dismissed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
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

  const violationTypes = [
    'speeding',
    'reckless_driving',
    'illegal_parking',
    'no_license_plate',
    'expired_registration',
    'no_drivers_license',
    'driving_under_influence',
    'disregarding_traffic_signals',
    'illegal_overtaking',
    'overloading',
    'no_helmet',
    'no_seatbelt',
    'illegal_turn',
    'blocking_intersection',
    'other',
  ];

  return (
    <div className="space-y-6 pt-8 px-4 pb-8">
      <div className="bg-white rounded-xl shadow-lg border-2 border-orange-200 p-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-orange-50/30 opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
        <div className="relative flex items-center gap-3 mb-2">
          <div className="p-3 bg-orange-600 rounded-xl shadow-md border border-orange-700">
            <FileText className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">Manage Violations</h1>
            <p className="text-gray-600 mt-1 text-sm font-medium">
              View and manage all traffic violations in the system
            </p>
          </div>
        </div>
      </div>

      <Card className="shadow-lg border-2 border-gray-200 hover:border-orange-200 transition-colors">
        <CardHeader className="bg-white border-b-2 border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <CardTitle className="text-xl font-semibold text-gray-800">Violations Management</CardTitle>
            
            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  type="text"
                  placeholder="Search by OVR, citation, plate, or driver..."
                  value={searchTerm}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setSearchTerm(e.target.value);
                    setPage(1);
                  }}
                  className="pl-10"
                />
              </div>
              
              <select
                value={statusFilter}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="disputed">Disputed</option>
                <option value="overdue">Overdue</option>
                <option value="dismissed">Dismissed</option>
                <option value="cancelled">Cancelled</option>
              </select>
              
              <select
                value={typeFilter}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                  setTypeFilter(e.target.value);
                  setPage(1);
                }}
                className="rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              >
                <option value="">All Types</option>
                {violationTypes.map((type) => (
                  <option key={type} value={type}>
                    {type.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : violations.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No violations found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || statusFilter || typeFilter
                  ? 'Try adjusting your filters'
                  : 'No violations in the system yet'}
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        OVR Number
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Driver
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Violation
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Location
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fine
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {violations.map((violation) => (
                      <tr key={violation.id} className="hover:bg-orange-50 transition-colors duration-150 border-l-4 border-transparent hover:border-orange-400">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{violation.ovrNumber}</div>
                          <div className="text-sm text-gray-500">{violation.citationNumber}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">{violation.driverName}</div>
                          <div className="text-sm text-gray-500">{violation.plateNumber}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {violation.violationType.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 max-w-xs truncate">{violation.violationLocation}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {formatCurrency(parseFloat(violation.totalFine.toString()))}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(violation.status)}
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(violation.status)}`}>
                              {violation.status.charAt(0).toUpperCase() + violation.status.slice(1)}
                            </span>
                          </div>
                          {violation.isDisputed && (
                            <div className="text-xs text-blue-600 mt-1">Disputed</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(violation.violationDate)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewDetails(violation)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                            {violation.isDisputed && violation.disputeStatus === 'pending' && (
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => handleProcessDispute(violation)}
                              >
                                Process Dispute
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 mt-4">
                <div className="flex-1 flex justify-between sm:hidden">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                  >
                    Next
                  </Button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing <span className="font-medium">{(page - 1) * limit + 1}</span> to{' '}
                      <span className="font-medium">{Math.min(page * limit, total)}</span> of{' '}
                      <span className="font-medium">{total}</span> results
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                        <button
                          key={pageNum}
                          onClick={() => setPage(pageNum)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            page === pageNum
                              ? 'z-10 bg-primary-50 border-primary-500 text-primary-600'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      ))}
                      <button
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Violation Details Modal */}
      {showDetailsModal && selectedViolation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-200">
            <div className="px-6 py-5 border-b-2 border-gray-200 flex justify-between items-center bg-white sticky top-0 shadow-sm">
              <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <FileText className="h-5 w-5 text-orange-600" />
                Violation Details
              </h3>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">OVR Number</label>
                  <p className="text-sm text-gray-900">{selectedViolation.ovrNumber}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Citation Number</label>
                  <p className="text-sm text-gray-900">{selectedViolation.citationNumber}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Driver Name</label>
                  <p className="text-sm text-gray-900">{selectedViolation.driverName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Plate Number</label>
                  <p className="text-sm text-gray-900">{selectedViolation.plateNumber}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Violation Type</label>
                  <p className="text-sm text-gray-900">
                    {selectedViolation.violationType.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <p className="text-sm text-gray-900 capitalize">{selectedViolation.status}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Location</label>
                  <p className="text-sm text-gray-900">{selectedViolation.violationLocation}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Date & Time</label>
                  <p className="text-sm text-gray-900">
                    {formatDate(selectedViolation.violationDate)} {selectedViolation.violationTime}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Base Fine</label>
                  <p className="text-sm text-gray-900">
                    {formatCurrency(parseFloat(selectedViolation.baseFine.toString()))}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Total Fine</label>
                  <p className="text-sm font-bold text-gray-900">
                    {formatCurrency(parseFloat(selectedViolation.totalFine.toString()))}
                  </p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Description</label>
                <p className="text-sm text-gray-900">{selectedViolation.violationDescription}</p>
              </div>
              {selectedViolation.isDisputed && (
                <div className="border-t pt-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Dispute Information</h4>
                  <p className="text-sm text-gray-600">Reason: {selectedViolation.disputeReason}</p>
                  <p className="text-sm text-gray-600">
                    Status: {selectedViolation.disputeStatus || 'Pending'}
                  </p>
                </div>
              )}
            </div>
            <div className="px-6 py-5 border-t border-gray-200 flex justify-end bg-gray-50">
              <Button 
                variant="outline" 
                onClick={() => setShowDetailsModal(false)}
                className="shadow-sm"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Process Dispute Modal */}
      {showDisputeModal && selectedViolation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full border border-gray-200">
            <div className="px-6 py-5 border-b-2 border-gray-200 bg-white">
              <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-blue-600" />
                Process Dispute
              </h3>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  OVR Number: {selectedViolation.ovrNumber}
                </label>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Dispute Reason: {selectedViolation.disputeReason}
                </label>
              </div>
              <div>
                <label className="form-label">Decision</label>
                <select
                  value={disputeData.approved ? 'approved' : 'rejected'}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setDisputeData({ ...disputeData, approved: e.target.value === 'approved' })}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                >
                  <option value="approved">Approve (Dismiss violation)</option>
                  <option value="rejected">Reject (Violation stands)</option>
                </select>
              </div>
              <div>
                <label className="form-label">Admin Notes</label>
                <textarea
                  value={disputeData.notes}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDisputeData({ ...disputeData, notes: e.target.value })}
                  rows={4}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  placeholder="Add notes about this decision..."
                />
              </div>
            </div>
            <div className="px-6 py-5 border-t border-gray-200 flex justify-end gap-3 bg-gray-50">
              <Button
                variant="outline"
                onClick={() => {
                  setShowDisputeModal(false);
                  setSelectedViolation(null);
                }}
                className="shadow-sm"
              >
                Cancel
              </Button>
              <Button 
                variant="primary" 
                onClick={handleSubmitDispute}
                className="shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
              >
                Submit Decision
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminViolationsPage;