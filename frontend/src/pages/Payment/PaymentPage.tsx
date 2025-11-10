import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePayment } from '../../contexts/PaymentContext';
import { apiService } from '../../services/api';
import { PaymentGateway, Violation } from '../../types';
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  CreditCard,
  DollarSign,
  Shield,
  Zap
} from 'lucide-react';
import { Card, CardContent } from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import PageHeader from '../../components/Layout/PageHeader';
import PageSection from '../../components/Layout/PageSection';

const formatViolationLabel = (value: string) => value.replace(/_/g, ' ');

const PaymentPage: React.FC = () => {
  const { violationId } = useParams<{ violationId: string }>();
  const navigate = useNavigate();
  const { initiatePayment, paymentGateways } = usePayment();

  const [violation, setViolation] = useState<Violation | null>(null);
  const [selectedGateway, setSelectedGateway] = useState<PaymentGateway | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [processing, setProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchViolation = async () => {
      if (!violationId) {
        return;
      }

      try {
        setLoading(true);
        const response = await apiService.getViolation(violationId);
        const violationData = response.data as Violation;

        if (violationData.status === 'paid') {
          setError('This violation has already been settled. No further payment is required.');
          setViolation(violationData);
          return;
        }

        setViolation(violationData);
      } catch (requestError) {
        console.error('Failed to fetch violation:', requestError);
        setError('Unable to load violation details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchViolation();
  }, [violationId]);

  const handlePayment = async () => {
    if (!violation || !selectedGateway) {
      return;
    }

    try {
      setProcessing(true);
      setError(null);

      const payment = await initiatePayment({
        violationId: violation.id,
        paymentMethod: selectedGateway.id,
        amount: violation.totalFine,
        payerName: violation.driverName,
        payerEmail: 'driver@example.com'
      });

      navigate(`/payment/success/${payment.id}`);
    } catch (paymentError) {
      console.error('Payment initiation failed:', paymentError);
      setError('Payment initiation failed. Please try again or select another gateway.');
    } finally {
      setProcessing(false);
    }
  };

  const renderStatusPill = (status: string) => {
    const statusMap: Record<string, { label: string; className: string; icon: JSX.Element }> = {
      paid: {
        label: 'PAID',
        className: 'bg-success-100 text-success-700',
        icon: <CheckCircle className="h-4 w-4" />
      },
      pending: {
        label: 'PENDING',
        className: 'bg-warning-100 text-warning-700',
        icon: <Clock className="h-4 w-4" />
      },
      overdue: {
        label: 'OVERDUE',
        className: 'bg-danger-100 text-danger-700',
        icon: <AlertTriangle className="h-4 w-4" />
      }
    };

    const meta = statusMap[status] ?? statusMap.pending;
    return (
      <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${meta.className}`}>
        {meta.icon}
        {meta.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!violation) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 rounded-3xl border border-danger-100 bg-danger-50/70 px-6 py-12 text-center">
        <AlertTriangle className="h-12 w-12 text-danger-500" />
        <h2 className="text-xl font-bold text-danger-700">Violation not found</h2>
        <p className="text-sm text-danger-600">The selected violation could not be retrieved. Return to search and choose a valid record.</p>
        <Button variant="primary" onClick={() => navigate('/violations/search')}>
          Back to search
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 px-4 pb-12 pt-8">
      <PageHeader
        title="Settle violation"
        subtitle="Review penalty details, choose a payment partner, and confirm within seconds."
        icon={CreditCard}
        actions={(
          <div className="rounded-full bg-accent-100 px-4 py-2 text-sm font-semibold text-accent-700">
            OVR #{violation.ovrNumber}
          </div>
        )}
      />

      {error && (
        <div className="flex items-start gap-3 rounded-3xl border border-danger-200 bg-danger-50/70 px-5 py-4 text-sm text-danger-700">
          <AlertTriangle className="h-5 w-5" />
          <div>
            <p className="font-semibold">Payment notice</p>
            <p>{error}</p>
          </div>
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <PageSection
          title="Violation summary"
          description="Ensure all details are accurate before proceeding with payment."
        >
          <div className="grid gap-4 md:grid-cols-2">
            <SummaryRow label="Citation" value={violation.citationNumber} />
            <SummaryRow label="Status" value={renderStatusPill(violation.status)} isNode />
            <SummaryRow label="Driver" value={violation.driverName} />
            <SummaryRow label="Plate" value={violation.plateNumber} />
            <SummaryRow label="Violation" value={formatViolationLabel(violation.violationType)} />
            <SummaryRow label="Location" value={violation.violationLocation} />
            <SummaryRow label="Issued on" value={new Date(violation.violationDate).toLocaleDateString()} />
            {violation.status === 'pending' && violation.dueDate && (
              <SummaryRow label="Due date" value={new Date(violation.dueDate).toLocaleDateString()} emphasis />
            )}
          </div>

          <div className="mt-6 grid gap-4 rounded-3xl border border-gray-100 bg-white/95 p-6 shadow-xl md:grid-cols-3">
            <AmountTile label="Base fine" value={violation.baseFine} accent="bg-primary-50 text-primary-700" />
            <AmountTile label="Penalties" value={violation.additionalPenalties} accent="bg-warning-50 text-warning-700" />
            <AmountTile label="Total" value={violation.totalFine} accent="bg-success-50 text-success-700" emphasized />
          </div>
        </PageSection>

        <PageSection
          title="Select payment partner"
          description="Certified gateways with instant confirmation and secure processing."
        >
          <div className="space-y-4">
            {paymentGateways.map((gateway) => (
              <button
                key={gateway.id}
                type="button"
                onClick={() => setSelectedGateway(gateway)}
                className={`w-full rounded-3xl border px-5 py-4 text-left transition-all ${
                  selectedGateway?.id === gateway.id
                    ? 'border-primary-500 bg-primary-50 shadow-xl'
                    : 'border-gray-200 bg-white hover:border-primary-200 hover:shadow-lg'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{gateway.displayName ?? gateway.name}</p>
                    <p className="mt-1 text-xs text-gray-600">{gateway.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {gateway.icons.map((icon, index) => (
                      <span key={index} className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
                        {icon}
                      </span>
                    ))}
                  </div>
                </div>
              </button>
            ))}

            <div className="rounded-3xl border border-blue-100 bg-blue-50/70 p-4 text-sm text-blue-700">
              <div className="flex items-start gap-3">
                <Shield className="mt-0.5 h-5 w-5" />
                <p>Transactions are protected with end-to-end encryption and meet Bangko Sentral ng Pilipinas guidelines.</p>
              </div>
            </div>

            <Button
              variant="primary"
              size="lg"
              loading={processing}
              disabled={!selectedGateway || processing || violation.status === 'paid'}
              onClick={handlePayment}
              className="flex w-full items-center justify-center gap-2"
            >
              <DollarSign className="h-5 w-5" />
              Pay ₱{violation.totalFine.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
            </Button>
          </div>
        </PageSection>
      </div>

      <PageSection title="Payment tips" headerAlignment="left" className="bg-gradient-to-br from-secondary-600 via-primary-600 to-primary-700 text-white">
        <div className="grid gap-4 md:grid-cols-3">
          <TipCard title="Instant receipts" description="Digital receipt and QR verification delivered to email instantly." />
          <TipCard title="Reversible errors" description="Wrong selection? Contact support within 24 hours to flag disputes." />
          <TipCard title="24/7 service" description="Gateways operate round the clock with automated fraud detection." />
        </div>
      </PageSection>
    </div>
  );
};

interface SummaryRowProps {
  label: string;
  value: React.ReactNode;
  emphasis?: boolean;
  isNode?: boolean;
}

const SummaryRow: React.FC<SummaryRowProps> = ({ label, value, emphasis = false, isNode = false }) => (
  <div className="rounded-2xl border border-gray-100 bg-white/90 p-4 shadow-sm">
    <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">{label}</p>
    {isNode ? (
      <div className="mt-2">{value}</div>
    ) : (
      <p className={`mt-2 text-sm ${emphasis ? 'font-bold text-primary-700' : 'text-gray-700'}`}>{value}</p>
    )}
  </div>
);

interface AmountTileProps {
  label: string;
  value: number;
  accent: string;
  emphasized?: boolean;
}

const AmountTile: React.FC<AmountTileProps> = ({ label, value, accent, emphasized = false }) => (
  <div className={`rounded-3xl border border-white/60 bg-white/95 p-5 text-sm shadow-lg ${emphasized ? 'ring-2 ring-success-300' : ''}`}>
    <p className="font-semibold text-gray-500">{label}</p>
    <p className={`mt-2 text-2xl font-black ${accent}`}>
      ₱{value.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
    </p>
  </div>
);

interface TipCardProps {
  title: string;
  description: string;
}

const TipCard: React.FC<TipCardProps> = ({ title, description }) => (
  <div className="rounded-3xl border border-white/20 bg-white/10 p-5 shadow-lg">
    <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-white">
      <Zap className="h-4 w-4" />
    </div>
    <h3 className="text-base font-semibold text-white">{title}</h3>
    <p className="mt-2 text-sm text-white/80">{description}</p>
  </div>
);

export default PaymentPage;
