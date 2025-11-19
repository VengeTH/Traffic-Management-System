import React, { useEffect, useState } from "react"
import { Link, useParams, useSearchParams } from "react-router-dom"
import { apiService } from "../../services/api"
import { Payment } from "../../types"
import {
  Calendar,
  CheckCircle,
  Download,
  FileText,
  Mail,
  Share2,
  ShieldCheck,
} from "lucide-react"
import { Card, CardContent } from "../../components/UI/Card"
import Button from "../../components/UI/Button"
import LoadingSpinner from "../../components/UI/LoadingSpinner"
import PageHeader from "../../components/Layout/PageHeader"
import PageSection from "../../components/Layout/PageSection"

const formatLabel = (value: string) => value.replace(/_/g, " ")

const PaymentSuccessPage: React.FC = () => {
  const { paymentId: paymentIdParam } = useParams<{ paymentId: string }>()
  const [searchParams] = useSearchParams()
  const paymentIdFromQuery = searchParams.get("payment_id")

  // * Get payment ID from either path parameter or query parameter
  const paymentId = paymentIdParam || paymentIdFromQuery

  const [payment, setPayment] = useState<Payment | null>(null)
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    const fetchPayment = async () => {
      if (!paymentId) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const response = await apiService.getPayment(paymentId)
        // * API returns { success: true, data: { payment: {...} } }
        const paymentData = (response.data?.payment ?? response.data) as Payment
        setPayment(paymentData)
      } catch (error) {
        console.error("Failed to load payment:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchPayment()
  }, [paymentId])

  const handleDownloadReceipt = async () => {
    if (!payment) {
      return
    }

    try {
      // * API returns a Blob (PDF file) with responseType: 'blob'
      const receiptBlob = await apiService.getPaymentReceipt(payment.id)
      const url = window.URL.createObjectURL(receiptBlob)
      const link = document.createElement("a")
      link.href = url
      link.download = `receipt-${payment.receiptNumber}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Failed to download receipt:", error)
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!payment) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 rounded-3xl border border-gray-200 bg-gray-50 px-6 py-12 text-center">
        <FileText className="h-12 w-12 text-gray-400" />
        <h2 className="text-lg font-semibold text-gray-900">
          Payment not found
        </h2>
        <p className="text-sm text-gray-600">
          We could not locate a payment with the supplied reference.
        </p>
        <Link to="/dashboard">
          <Button variant="primary">Go to dashboard</Button>
        </Link>
      </div>
    )
  }

  const displayDate = new Date(
    payment.completedAt ?? payment.initiatedAt
  ).toLocaleString()

  return (
    <div className="space-y-8 px-4 pb-12 pt-8">
      <PageHeader
        title="Payment confirmed"
        subtitle="Your traffic violation has been settled successfully. Save the digital receipt for your records."
        icon={CheckCircle}
        actions={
          <div className="rounded-full bg-success-100 px-4 py-2 text-sm font-semibold text-success-700">
            Receipt #{payment.receiptNumber}
          </div>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <PageSection title="Transaction overview">
          <div className="rounded-4xl border border-success-200 bg-gradient-to-br from-success-50 to-white p-8 shadow-2xl text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-success-500 text-white shadow-lg">
              <CheckCircle className="h-10 w-10" />
            </div>
            <h2 className="mt-6 text-3xl font-black text-gray-900">
              Payment successful
            </h2>
            <p className="mt-3 text-sm text-gray-600">
              Confirmation sent to {payment.payerEmail}. Please keep the receipt
              number for any future reference with the Las Piñas Traffic
              Management Office.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-xs font-semibold uppercase tracking-widest text-success-600">
              <div className="rounded-full bg-white/70 px-3 py-1">
                PAYMENT ID {payment.paymentId}
              </div>
              <div className="rounded-full bg-white/70 px-3 py-1">
                OVR {payment.ovrNumber}
              </div>
              <div className="rounded-full bg-white/70 px-3 py-1">
                ₱
                {Number(payment.amount).toLocaleString("en-PH", {
                  minimumFractionDigits: 2,
                })}
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <InfoTile
              label="Transaction amount"
              value={`₱${Number(payment.amount).toLocaleString("en-PH", { minimumFractionDigits: 2 })}`}
              accent="text-success-700"
            />
            <InfoTile
              label="Payment channel"
              value={formatLabel(payment.paymentMethod).toUpperCase()}
            />
            <InfoTile label="Provider" value={payment.paymentProvider} />
            <InfoTile
              label="Processed on"
              value={displayDate}
              icon={<Calendar className="h-4 w-4 text-primary-500" />}
            />
          </div>
        </PageSection>

        <PageSection
          title="Violation details"
          description="Linked traffic citation information"
        >
          <div className="space-y-4">
            <DetailRow label="Citation" value={payment.citationNumber} />
            <DetailRow label="OVR" value={payment.ovrNumber} />
            <DetailRow label="Payer" value={payment.payerName} />
            <DetailRow label="Email" value={payment.payerEmail} />
            <DetailRow
              label="Gateway reference"
              value={payment.gatewayTransactionId ?? "N/A"}
            />
          </div>
        </PageSection>
      </div>

      <PageSection
        title="Next steps"
        description="Keep your receipt safe or share it with the concerned parties."
      >
        <div className="grid gap-4 md:grid-cols-3">
          <ActionCard
            title="Download receipt"
            description="PDF copy saved to your device for archiving."
            icon={<Download className="h-5 w-5" />}
            action={
              <Button
                variant="primary"
                onClick={handleDownloadReceipt}
                className="mt-4 w-full"
              >
                Download
              </Button>
            }
          />
          <ActionCard
            title="Email copy"
            description="Send a duplicate receipt to another address."
            icon={<Mail className="h-5 w-5" />}
            action={
              <Button
                variant="outline"
                className="mt-4 w-full"
                onClick={() => {
                  /* TODO: trigger email resend */
                }}
              >
                Send email
              </Button>
            }
          />
          <ActionCard
            title="Return to dashboard"
            description="Review other violations or monitor history."
            icon={<Share2 className="h-5 w-5" />}
            action={
              <Link to="/dashboard" className="mt-4 block w-full">
                <Button variant="outline" className="w-full">
                  Go to dashboard
                </Button>
              </Link>
            }
          />
        </div>
      </PageSection>

      <PageSection
        title="Security assurance"
        className="bg-gradient-to-br from-secondary-600 via-primary-600 to-primary-700 text-white"
      >
        <div className="flex items-start gap-4">
          <div className="rounded-2xl bg-white/15 p-3">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div className="space-y-2 text-sm">
            <p className="font-semibold">Verified transaction</p>
            <p className="text-white/80">
              This payment is protected under the Las Piñas City e-governance
              program. Should you require validation, present the receipt number{" "}
              {payment.receiptNumber} along with a valid government ID at the
              Traffic Management Office.
            </p>
          </div>
        </div>
      </PageSection>
    </div>
  )
}

interface InfoTileProps {
  label: string
  value: string
  accent?: string
  icon?: React.ReactNode
}

const InfoTile: React.FC<InfoTileProps> = ({
  label,
  value,
  accent = "text-gray-700",
  icon,
}) => (
  <div className="rounded-3xl border border-gray-100 bg-white/95 p-5 shadow-md">
    <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
      {label}
    </p>
    <div className="mt-2 flex items-center gap-2 text-base font-bold">
      {icon}
      <span className={accent}>{value}</span>
    </div>
  </div>
)

interface DetailRowProps {
  label: string
  value: string
}

const DetailRow: React.FC<DetailRowProps> = ({ label, value }) => (
  <div className="rounded-2xl border border-gray-100 bg-white/90 p-4 shadow-sm">
    <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
      {label}
    </p>
    <p className="mt-2 text-sm text-gray-700">{value}</p>
  </div>
)

interface ActionCardProps {
  title: string
  description: string
  icon: React.ReactNode
  action: React.ReactNode
}

const ActionCard: React.FC<ActionCardProps> = ({
  title,
  description,
  icon,
  action,
}) => (
  <div className="rounded-3xl border border-gray-100 bg-white/95 p-6 shadow-xl">
    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-50 text-primary-600">
      {icon}
    </div>
    <h3 className="mt-4 text-base font-semibold text-gray-900">{title}</h3>
    <p className="mt-2 text-sm text-gray-600">{description}</p>
    {action}
  </div>
)

export default PaymentSuccessPage
