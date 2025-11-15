import React, { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"
import { apiService } from "../../services/api"
import { Violation } from "../../types"
import {
  AlertTriangle,
  Calendar,
  Car,
  CheckCircle,
  Clock,
  DollarSign,
  FileText,
  MapPin,
} from "lucide-react"
import { Card, CardContent } from "../../components/UI/Card"
import Button from "../../components/UI/Button"
import LoadingSpinner from "../../components/UI/LoadingSpinner"
import PageHeader from "../../components/Layout/PageHeader"
import PageSection from "../../components/Layout/PageSection"

const formatViolationLabel = (value: string) => value.replace(/_/g, " ")

const ViolationDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const [violation, setViolation] = useState<Violation | null>(null)
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    const fetchViolation = async () => {
      if (!id) {
        return
      }

      try {
        setLoading(true)
        const response = await apiService.getViolation(id)
        setViolation(response.data as Violation)
      } catch (error) {
        console.error("Failed to fetch violation:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchViolation()
  }, [id])

  const renderStatusPill = (status: string) => {
    const statusMap: Record<
      string,
      { label: string; className: string; icon: JSX.Element }
    > = {
      paid: {
        label: "PAID",
        className: "bg-success-100 text-success-700",
        icon: <CheckCircle className="h-4 w-4" />,
      },
      pending: {
        label: "PENDING",
        className: "bg-warning-100 text-warning-700",
        icon: <Clock className="h-4 w-4" />,
      },
      overdue: {
        label: "OVERDUE",
        className: "bg-danger-100 text-danger-700",
        icon: <AlertTriangle className="h-4 w-4" />,
      },
    }

    const meta = statusMap[status] ?? statusMap.pending
    return (
      <span
        className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${meta.className}`}
      >
        {meta.icon}
        {meta.label}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!violation) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 rounded-3xl border border-gray-200 bg-gray-50 px-6 py-12 text-center">
        <FileText className="h-12 w-12 text-gray-400" />
        <h2 className="text-lg font-semibold text-gray-900">
          Violation not found
        </h2>
        <p className="text-sm text-gray-600">
          Return to the search page and select a valid record.
        </p>
        <Link to="/violations/search">
          <Button variant="primary">Back to search</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-8 px-4 pb-12 pt-8">
      <PageHeader
        title="Violation dossier"
        subtitle="Complete insight into the issued citation, vehicle, and financial obligations."
        icon={Car}
        actions={renderStatusPill(violation.status)}
      />

      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <PageSection
          title="Incident snapshot"
          description="Time, location, and contextual information"
        >
          <div className="grid gap-4 md:grid-cols-2">
            <DetailTile label="OVR" value={violation.ovrNumber} />
            <DetailTile label="Citation" value={violation.citationNumber} />
            <DetailTile
              label="Violation"
              value={formatViolationLabel(violation.violationType)}
            />
            <DetailTile
              label="Vehicle"
              value={`${violation.vehicleType.toUpperCase()} · ${violation.plateNumber}`}
              icon={<Car className="h-4 w-4 text-primary-500" />}
            />
            <DetailTile
              label="Date"
              value={new Date(violation.violationDate).toLocaleDateString()}
              icon={<Calendar className="h-4 w-4 text-primary-500" />}
            />
            <DetailTile label="Time" value={violation.violationTime} />
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <LocationTile
              location={violation.violationLocation}
              description={violation.violationDescription}
            />
            <OfficerTile
              enforcer={violation.enforcerName}
              status={violation.status}
            />
          </div>
        </PageSection>

        <PageSection
          title="Financial summary"
          description="Outstanding amounts and payment history"
        >
          <div className="rounded-3xl border border-gray-100 bg-white/95 p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-500">
                Base fine
              </span>
              <span className="text-sm font-bold text-gray-900">
                ₱
                {Number(violation.baseFine).toLocaleString("en-PH", {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>
            {violation.additionalPenalties > 0 && (
              <div className="mt-3 flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-500">
                  Penalties
                </span>
                <span className="text-sm font-bold text-warning-700">
                  ₱
                  {Number(violation.additionalPenalties).toLocaleString(
                    "en-PH",
                    { minimumFractionDigits: 2 }
                  )}
                </span>
              </div>
            )}
            <div className="mt-5 rounded-2xl bg-primary-50/60 p-4">
              <div className="flex items-center justify-between text-lg font-black text-primary-700">
                <span>Total payable</span>
                <span>
                  ₱
                  {Number(violation.totalFine).toLocaleString("en-PH", {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
            </div>
            <div className="mt-4 space-y-2 text-xs text-gray-600">
              {violation.status === "pending" && violation.dueDate && (
                <p>
                  <Clock className="mr-2 inline h-4 w-4 text-warning-600" />
                  Due by {new Date(violation.dueDate).toLocaleDateString()}
                </p>
              )}
              {violation.status === "paid" && violation.paymentDate && (
                <p>
                  <CheckCircle className="mr-2 inline h-4 w-4 text-success-600" />
                  Paid on {new Date(violation.paymentDate).toLocaleDateString()}
                </p>
              )}
            </div>
            <div className="mt-5 space-y-3">
              {violation.status === "pending" && (
                <Link to={`/payment/${violation.id}`}>
                  <Button variant="primary" className="w-full">
                    <DollarSign className="mr-2 h-5 w-5" />
                    Pay now
                  </Button>
                </Link>
              )}
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  /* TODO: open dispute */
                }}
              >
                <AlertTriangle className="mr-2 h-5 w-5 text-warning-600" />
                Submit dispute
              </Button>
            </div>
          </div>
        </PageSection>
      </div>
    </div>
  )
}

interface DetailTileProps {
  label: string
  value: string
  icon?: React.ReactNode
}

const DetailTile: React.FC<DetailTileProps> = ({ label, value, icon }) => (
  <div className="rounded-3xl border border-gray-100 bg-white/95 p-4 shadow-sm">
    <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
      {label}
    </p>
    <div className="mt-2 flex items-center gap-2 text-sm text-gray-700">
      {icon}
      <span>{value}</span>
    </div>
  </div>
)

interface LocationTileProps {
  location: string
  description: string
}

const LocationTile: React.FC<LocationTileProps> = ({
  location,
  description,
}) => (
  <div className="rounded-3xl border border-secondary-100 bg-secondary-50/60 p-5 shadow-sm">
    <div className="flex items-center gap-2 text-sm font-semibold text-secondary-700">
      <MapPin className="h-4 w-4" />
      Location insight
    </div>
    <p className="mt-3 text-sm text-gray-700">{location}</p>
    <p className="mt-2 text-xs text-gray-600">{description}</p>
  </div>
)

interface OfficerTileProps {
  enforcer: string
  status: string
}

const OfficerTile: React.FC<OfficerTileProps> = ({ enforcer, status }) => (
  <div className="rounded-3xl border border-primary-100 bg-primary-50/60 p-5 shadow-sm">
    <div className="flex items-center gap-2 text-sm font-semibold text-primary-700">
      <FileText className="h-4 w-4" />
      Enforcement
    </div>
    <p className="mt-3 text-sm text-gray-700">Issued by {enforcer}</p>
    <p className="mt-2 text-xs text-gray-600">
      Current status: {status.toUpperCase()}
    </p>
  </div>
)

export default ViolationDetailsPage
