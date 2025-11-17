import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  Eye,
  FileText,
  Filter,
  Search,
  XCircle
} from 'lucide-react';
import { Card, CardContent } from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import Input from '../../components/UI/Input';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import PageHeader from '../../components/Layout/PageHeader';
import PageSection from '../../components/Layout/PageSection';
import { apiService, unwrapApiResponse } from '../../services/api';
import { Violation } from '../../types';
import toast from 'react-hot-toast';

type InputChangeEvent = React.ChangeEvent<HTMLInputElement>;
type SelectChangeEvent = React.ChangeEvent<HTMLSelectElement>;
type TextAreaChangeEvent = React.ChangeEvent<HTMLTextAreaElement>;

const formatViolationLabel = (value: string | undefined | null) => {
  if (!value) return "Unknown violation";
  return value.replace(/_/g, " ");
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
  'other'
];

const AdminViolationsPage: React.FC = () => {
  const [violations, setViolations] = useState<Violation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [total, setTotal] = useState<number>(0);
  const [selectedViolation, setSelectedViolation] = useState<Violation | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState<boolean>(false);
  const [showDisputeModal, setShowDisputeModal] = useState<boolean>(false);
  const [disputeData, setDisputeData] = useState<{ approved: boolean; notes: string }>({
    approved: true,
    notes: ''
  });

  const limit = 10;

  const fetchViolations = useCallback(async () => {
    try {
      setLoading(true);
      const params: Record<string, string | number> = {
        page,
        limit
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
      const payload = unwrapApiResponse<
        { violations?: Violation[]; pagination?: { pages?: number; total?: number } } | Violation[]
      >(response);

      const violationList = Array.isArray(payload) ? payload : payload?.violations ?? [];
      const paginationData = !Array.isArray(payload) ? payload?.pagination : undefined;
      const pagination = paginationData ?? { pages: 1, total: violationList.length };

      setViolations(violationList);
      setTotalPages(pagination.pages ?? 1);
      setTotal(pagination.total ?? violationList.length);
    } catch (error) {
      console.error('Failed to fetch violations:', error);
      toast.error('Failed to load violations');
    } finally {
      setLoading(false);
    }
  }, [limit, page, searchTerm, statusFilter, typeFilter]);

  useEffect(() => {
    fetchViolations();
  }, [fetchViolations]);

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
    if (!selectedViolation) {
      return;
    }

    try {
      await apiService.processDispute(selectedViolation.id, disputeData);
      toast.success(`Dispute ${disputeData.approved ? 'approved' : 'rejected'} successfully`);
      setShowDisputeModal(false);
      setSelectedViolation(null);
      fetchViolations();
    } catch (error) {
      console.error('Failed to process dispute:', error);
      toast.error('Failed to process dispute');
    }
  };

  const statusMeta = useMemo(() => ({
    paid: {
      icon: <CheckCircle className="h-5 w-5 text-success-600" />,
      badge: 'bg-success-100 text-success-800'
    },
    pending: {
      icon: <Clock className="h-5 w-5 text-warning-600" />,
      badge: 'bg-warning-100 text-warning-800'
    },
    overdue: {
      icon: <AlertTriangle className="h-5 w-5 text-danger-600" />,
      badge: 'bg-danger-100 text-danger-800'
    },
    disputed: {
      icon: <FileText className="h-5 w-5 text-blue-600" />,
      badge: 'bg-blue-100 text-blue-800'
    },
    dismissed: {
      icon: <XCircle className="h-5 w-5 text-gray-600" />,
      badge: 'bg-gray-100 text-gray-700'
    }
  }), []);

  const renderStatus = (status: string, isDisputed: boolean) => {
    const meta = statusMeta[status as keyof typeof statusMeta] ?? statusMeta.pending;
    return (
      <div className="flex flex-col gap-1">
        <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${meta.badge}`}>
          {meta.icon}
          {formatViolationLabel(status).toUpperCase()}
        </span>
        {isDisputed && <span className="text-xs font-semibold text-blue-600">Disputed</span>}
      </div>
    );
  };

  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP'
  }).format(amount);

  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('en-PH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  const handlePageChange = (nextPage: number) => {
    setPage(Math.min(Math.max(nextPage, 1), totalPages));
  };

  return (
    <div className="space-y-8 px-4 pb-12 pt-8">
      <PageHeader
        title="Violation Intelligence"
        subtitle="Investigate active citations, disputes, and overdue penalties across the city."
        icon={FileText}
        actions={(
          <div className="flex items-center gap-2 rounded-full bg-primary-50 px-4 py-2 text-sm font-semibold text-primary-700">
            <Filter className="h-4 w-4" />
            Adaptive filters active
          </div>
        )}
      />

      <PageSection title="Search & filters">
        <div className="grid gap-4 lg:grid-cols-[2fr_1fr_1fr]">
          <div className="relative">
            <Input
              name="violationSearch"
              placeholder="Search OVR, citation, plate, or driver"
              value={searchTerm}
              onChange={(event: InputChangeEvent) => {
                setSearchTerm(event.target.value);
                setPage(1);
              }}
              startIcon={<Search className="h-5 w-5" />}
            />
          </div>
          <div>
            <label className="form-label">Status</label>
            <select
              value={statusFilter}
              onChange={(event: SelectChangeEvent) => {
                setStatusFilter(event.target.value);
                setPage(1);
              }}
              className="block w-full rounded-lg border-gray-200 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            >
              <option value="">All status</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="disputed">Disputed</option>
              <option value="overdue">Overdue</option>
              <option value="dismissed">Dismissed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div>
            <label className="form-label">Violation type</label>
            <select
              value={typeFilter}
              onChange={(event: SelectChangeEvent) => {
                setTypeFilter(event.target.value);
                setPage(1);
              }}
              className="block w-full rounded-lg border-gray-200 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            >
              <option value="">All types</option>
              {violationTypes.map((type) => (
                <option key={type} value={type}>
                  {formatViolationLabel(type).replace(/\b\w/g, (letter: string) => letter.toUpperCase())}
                </option>
              ))}
            </select>
          </div>
        </div>
      </PageSection>

      <PageSection
        title="Active caseload"
        description={`Displaying ${violations.length} of ${total} violations`}
      >
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <LoadingSpinner size="lg" />
          </div>
        ) : violations.length === 0 ? (
          <Card className="border border-dashed border-gray-300 bg-gray-50 py-12 text-center">
            <CardContent>
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-semibold text-gray-900">No records found</h3>
              <p className="mt-2 text-sm text-gray-600">Adjust your search or filters to surface more cases.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            <div className="overflow-hidden rounded-3xl border border-gray-100">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-primary-50 to-white">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-600">OVR details</th>
                    <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-600">Driver</th>
                    <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-600">Violation</th>
                    <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-600">Fine</th>
                    <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-600">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-600">Date</th>
                    <th className="px-6 py-3 text-right text-xs font-bold uppercase tracking-wider text-gray-600">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {violations.map((violation) => (
                    <tr key={violation.id} className="transition-colors duration-150 hover:bg-primary-50/50">
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <p className="font-semibold">{violation.ovrNumber}</p>
                        <p className="text-xs text-gray-500">Citation: {violation.citationNumber}</p>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        <p className="font-semibold text-gray-900">{violation.driverName}</p>
                        <p className="text-xs text-gray-500">{violation.plateNumber}</p>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        <p className="font-semibold text-gray-900">{formatViolationLabel(violation.violationType)}</p>
                        <p className="text-xs text-gray-500">{violation.violationLocation}</p>
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                        {formatCurrency(Number.parseFloat(violation.totalFine.toString()))}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {renderStatus(violation.status, violation.isDisputed)}
                      </td>
                      <td className="px-6 py-4 text-xs font-semibold text-gray-600">
                        {formatDate(violation.violationDate)}
                      </td>
                      <td className="px-6 py-4 text-right text-sm">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleViewDetails(violation)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View
                          </Button>
                          {violation.isDisputed && violation.disputeStatus === 'pending' && (
                            <Button variant="primary" size="sm" onClick={() => handleProcessDispute(violation)}>
                              Process dispute
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-4 rounded-3xl border border-gray-100 bg-white px-4 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-gray-600">
                Showing <span className="font-semibold text-gray-900">{(page - 1) * limit + 1}</span> to{' '}
                <span className="font-semibold text-gray-900">{Math.min(page * limit, total)}</span> of{' '}
                <span className="font-semibold text-gray-900">{total}</span> entries
              </p>
              <div className="flex items-center gap-1 self-end sm:self-auto">
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                  className="rounded-l-full border border-gray-200 bg-white px-2 py-2 text-sm text-gray-500 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
                  <button
                    key={pageNumber}
                    onClick={() => handlePageChange(pageNumber)}
                    className={`border px-3 py-2 text-sm font-semibold ${
                      pageNumber === page
                        ? 'border-primary-500 bg-primary-50 text-primary-600'
                        : 'border-gray-200 bg-white text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    {pageNumber}
                  </button>
                ))}
                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === totalPages}
                  className="rounded-r-full border border-gray-200 bg-white px-2 py-2 text-sm text-gray-500 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </PageSection>

      {showDetailsModal && selectedViolation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-gray-200 bg-white shadow-2xl">
            <div className="sticky top-0 flex items-center justify-between border-b border-gray-100 bg-white px-6 py-5">
              <h3 className="text-lg font-bold text-gray-900">Violation details</h3>
              <button onClick={() => setShowDetailsModal(false)} className="rounded-lg p-1 text-gray-500 hover:bg-gray-100">
                <XCircle className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-6 px-6 py-6">
              <div className="grid gap-4 md:grid-cols-2">
                <DetailRow label="OVR number" value={selectedViolation.ovrNumber} />
                <DetailRow label="Citation" value={selectedViolation.citationNumber} />
                <DetailRow label="Driver" value={selectedViolation.driverName} />
                <DetailRow label="Plate" value={selectedViolation.plateNumber} />
                <DetailRow label="Violation" value={formatViolationLabel(selectedViolation.violationType)} />
                <DetailRow label="Status" value={selectedViolation.status.toUpperCase()} />
                <DetailRow label="Location" value={selectedViolation.violationLocation} />
                <DetailRow label="Date / Time" value={`${formatDate(selectedViolation.violationDate)} ${selectedViolation.violationTime}`} />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <DetailRow label="Base fine" value={formatCurrency(Number(selectedViolation.baseFine))} />
                <DetailRow label="Total fine" value={formatCurrency(Number(selectedViolation.totalFine))} emphasis />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">Description</p>
                <p className="mt-2 text-sm text-gray-700">{selectedViolation.violationDescription}</p>
              </div>
              {selectedViolation.isDisputed && (
                <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-4">
                  <p className="text-xs font-semibold uppercase tracking-widest text-blue-600">Dispute</p>
                  <p className="mt-2 text-sm text-blue-700">Reason: {selectedViolation.disputeReason}</p>
                  <p className="mt-1 text-xs text-blue-600">Status: {selectedViolation.disputeStatus ?? 'PENDING'}</p>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-3 border-t border-gray-100 bg-gray-50 px-6 py-4">
              <Button variant="outline" onClick={() => setShowDetailsModal(false)}>
                Close
              </Button>
              {selectedViolation.isDisputed && selectedViolation.disputeStatus === 'pending' && (
                <Button variant="primary" onClick={() => handleProcessDispute(selectedViolation)}>
                  Process dispute
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {showDisputeModal && selectedViolation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-3xl border border-gray-200 bg-white shadow-2xl">
            <div className="border-b border-gray-100 px-6 py-5">
              <h3 className="text-lg font-bold text-gray-900">Process dispute</h3>
            </div>
            <div className="space-y-4 px-6 py-5 text-sm text-gray-700">
              <DetailRow label="OVR" value={selectedViolation.ovrNumber} />
              <DetailRow label="Reason" value={selectedViolation.disputeReason ?? 'N/A'} />
              <div>
                <label className="form-label">Decision</label>
                <select
                  value={disputeData.approved ? 'approved' : 'rejected'}
                  onChange={(event: SelectChangeEvent) => setDisputeData({ ...disputeData, approved: event.target.value === 'approved' })}
                  className="block w-full rounded-lg border-gray-200 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                >
                  <option value="approved">Approve (dismiss violation)</option>
                  <option value="rejected">Reject (violation stands)</option>
                </select>
              </div>
              <div>
                <label className="form-label">Admin notes</label>
                <textarea
                  value={disputeData.notes}
                  onChange={(event: TextAreaChangeEvent) => setDisputeData({ ...disputeData, notes: event.target.value })}
                  rows={4}
                  className="block w-full rounded-lg border-gray-200 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  placeholder="Outline rationale and next steps"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 border-t border-gray-100 bg-gray-50 px-6 py-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowDisputeModal(false);
                  setSelectedViolation(null);
                }}
              >
                Cancel
              </Button>
              <Button variant="primary" onClick={handleSubmitDispute}>
                Submit decision
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface DetailRowProps {
  label: string;
  value: string;
  emphasis?: boolean;
}

const DetailRow: React.FC<DetailRowProps> = ({ label, value, emphasis = false }) => (
  <div>
    <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">{label}</p>
    <p className={`mt-1 text-sm ${emphasis ? 'font-bold text-primary-700' : 'text-gray-700'}`}>{value}</p>
  </div>
);

export default AdminViolationsPage;