import React, { useEffect, useMemo, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"
import { apiService } from "../../services/api"
import { DashboardStats, Violation } from "../../types"
import {
  Search,
  CreditCard,
  FileText,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  Car,
  User,
  AlertCircle,
} from "lucide-react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/UI/Card"
import Button from "../../components/UI/Button"
import LoadingSpinner from "../../components/UI/LoadingSpinner"

const formatViolationLabel = (value: string) => value.replace(/_/g, " ")

const DashboardPage: React.FC = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentViolations, setRecentViolations] = useState<Violation[]>([])
  const [loading, setLoading] = useState<boolean>(true)

  // Redirect admins and enforcers to their respective dashboards
  useEffect(() => {
    if (user?.role === "admin") {
      navigate("/admin", { replace: true })
    } else if (user?.role === "enforcer") {
      navigate("/enforcer/violations", { replace: true })
    }
  }, [user, navigate])

  const totalViolations = stats?.totalViolations ?? 0
  const paidViolations = stats?.paidViolations ?? 0
  const pendingViolations = stats?.pendingViolations ?? 0
  const overdueViolations = stats?.overdueViolations ?? 0

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        const [statsResponse, violationsResponse] = await Promise.all([
          apiService.getUserStatistics(),
          apiService.getUserViolations(),
        ])

        setStats(statsResponse.data)
        setRecentViolations(violationsResponse.data.violations || [])
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  // * Determine the nearest deadline for the hero alert
  const nextDueViolation = useMemo(() => {
    if (!recentViolations.length) {
      return null
    }

    const upcoming = [...recentViolations]
      .filter((violation) => violation.status !== "paid" && violation.dueDate)
      .sort((violationA, violationB) => {
        const firstDate = new Date(
          violationA.dueDate ?? violationA.violationDate
        ).getTime()
        const secondDate = new Date(
          violationB.dueDate ?? violationB.violationDate
        ).getTime()
        return firstDate - secondDate
      })

    return upcoming[0] ?? null
  }, [recentViolations])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "paid":
        return <CheckCircle className="h-5 w-5 text-success-600" />
      case "pending":
        return <Clock className="h-5 w-5 text-warning-600" />
      case "overdue":
        return <AlertTriangle className="h-5 w-5 text-danger-600" />
      default:
        return <FileText className="h-5 w-5 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "text-success-600 bg-success-50"
      case "pending":
        return "text-warning-600 bg-warning-50"
      case "overdue":
        return "text-danger-600 bg-danger-50"
      default:
        return "text-gray-600 bg-gray-50"
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="relative space-y-8 px-4 pb-12 pt-10">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-white via-green-50 to-white" />

      {/* Driver License Onboarding */}
      {!user?.driverLicenseNumber && (
        <div className="relative overflow-hidden rounded-3xl border border-warning-200 bg-gradient-to-r from-warning-50 via-amber-50 to-warning-50 shadow-lg">
          <div className="relative flex flex-col gap-6 px-8 py-7 sm:flex-row sm:items-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-warning-200/80">
              <AlertCircle className="h-7 w-7 text-warning-700" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-warning-900">
                Add your driver&apos;s license for personalized monitoring
              </h3>
              <p className="mt-2 text-sm text-warning-800">
                Update your profile with a license number so the dashboard can
                surface active fines and personalized reminders.
              </p>
            </div>
            <Link to="/profile" className="flex-shrink-0">
              <Button variant="accent" size="md" className="px-6">
                Complete profile
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Hero Overview */}
      <div className="relative overflow-hidden rounded-[32px] border border-primary-100 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white shadow-2xl">
        <div className="absolute inset-y-0 -left-10 hidden w-64 rotate-12 bg-white/10 blur-3xl sm:block" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(34,197,94,0.3)_0%,_rgba(22,163,74,0)_55%)]" />
        <div className="relative grid gap-10 px-10 py-10 lg:grid-cols-[1.6fr_1fr]">
          <div className="space-y-7">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 shadow-lg">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-white/70">
                  Las Piñas Traffic Insights
                </p>
                <h1 className="text-3xl font-extrabold sm:text-4xl">
                  Good day, {user?.firstName}! Track and settle with confidence.
                </h1>
              </div>
            </div>
            <p className="max-w-2xl text-base text-white/80">
              The control center visualizes everything about your violations,
              payments, and reminders. Use the shortcuts to act quickly or
              review the analytic insights below.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row">
              <Link to="/violations/search">
                <Button
                  variant="primary"
                  size="lg"
                  className="bg-white/15 px-8 py-4 text-white shadow-xl hover:bg-white/25 hover:text-white"
                >
                  <Search className="mr-2 h-5 w-5" />
                  Locate fines
                </Button>
              </Link>
              <Button
                variant="outline"
                size="lg"
                onClick={() => navigate("/payments")}
                className="border-white/40 bg-white/10 px-8 py-4 text-white hover:bg-white/20"
              >
                <CreditCard className="mr-2 h-5 w-5" />
                View payments
              </Button>
            </div>
          </div>

          <div className="grid gap-4 rounded-3xl border border-white/15 bg-black/10 p-6 backdrop-blur-md">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold text-white/70">
                  Current outstanding balance
                </p>
                <h2 className="mt-2 text-3xl font-black">
                  ₱
                  {(stats?.totalRevenue ?? 0).toLocaleString("en-PH", {
                    minimumFractionDigits: 2,
                  })}
                </h2>
              </div>
              <div className="rounded-2xl bg-white/15 p-3">
                <DollarSign className="h-5 w-5 text-white" />
              </div>
            </div>
            {nextDueViolation ? (
              <div className="rounded-2xl border border-white/20 bg-white/10 p-4 text-sm">
                <p className="flex items-center gap-2 text-white/70">
                  <Calendar className="h-4 w-4" />
                  Upcoming deadline
                </p>
                <div className="mt-2 text-lg font-semibold">
                  {new Date(
                    nextDueViolation.dueDate ?? nextDueViolation.violationDate
                  ).toLocaleDateString()}
                </div>
                <p className="mt-1 text-white/70">
                  {formatViolationLabel(nextDueViolation.violationType)} •{" "}
                  {nextDueViolation.plateNumber}
                </p>
              </div>
            ) : (
              <div className="rounded-2xl border border-white/20 bg-white/10 p-4 text-sm text-white/70">
                <p className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  No pending deadlines
                </p>
                <p className="mt-2">
                  All violations are currently cleared or awaiting assessment.
                  Stay tuned for new updates here.
                </p>
              </div>
            )}
            <div className="flex items-center gap-3 text-sm text-white/80">
              <div className="rounded-full bg-success-600/80 p-2">
                <TrendingUp className="h-4 w-4 text-white" />
              </div>
              <div>
                <span className="block font-semibold">
                  Automated reminders active
                </span>
                <span className="text-white/70">
                  SMS and email notifications are enabled for payment follow
                  ups.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Shortcut Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="relative overflow-hidden lux-card animated-gradient-border hover-lift premium-glow-hover shine-effect">
          <CardContent className="relative p-6">
            <div className="flex items-center justify-between">
              <div className="rounded-2xl bg-gradient-to-br from-secondary-500 to-secondary-600 p-3 text-white shadow-xl premium-glow">
                <Search className="h-6 w-6" />
              </div>
              <div className="text-right text-xs font-semibold uppercase tracking-widest text-secondary-600">
                Lookup
              </div>
            </div>
            <h3 className="mt-6 text-xl font-bold text-gradient-premium">
              Smart violation search
            </h3>
            <p className="mt-2 text-sm text-gray-600 font-medium">
              Search by OVR, plate, or license number and get a consolidated
              view including penalties and deadlines.
            </p>
            <Link to="/violations/search" className="mt-6 block">
              <Button
                variant="primary"
                size="sm"
                className="w-full shadow-xl btn-glow"
              >
                Start a search
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden lux-card animated-gradient-border hover-lift premium-glow-hover shine-effect">
          <CardContent className="relative p-6">
            <div className="flex items-center justify-between">
              <div className="rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 p-3 text-white shadow-xl premium-glow">
                <CreditCard className="h-6 w-6" />
              </div>
              <div className="text-right text-xs font-semibold uppercase tracking-widest text-primary-600">
                Wallet
              </div>
            </div>
            <h3 className="mt-6 text-xl font-bold text-gradient-premium">
              Centralized payment records
            </h3>
            <p className="mt-2 text-sm text-gray-600 font-medium">
              Review recent payments, download digital receipts, and check
              processing status across gateways.
            </p>
            <Link to="/payments" className="mt-6 block">
              <Button
                variant="outline"
                size="sm"
                className="w-full border-primary-200 text-primary-700 shadow-md hover:shadow-lg"
              >
                Review history
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden lux-card animated-gradient-border hover-lift premium-glow-hover shine-effect">
          <CardContent className="relative p-6">
            <div className="flex items-center justify-between">
              <div className="rounded-2xl bg-gradient-to-br from-accent-500 to-accent-600 p-3 text-white shadow-xl premium-glow">
                <User className="h-6 w-6" />
              </div>
              <div className="text-right text-xs font-semibold uppercase tracking-widest text-accent-600">
                Account
              </div>
            </div>
            <h3 className="mt-6 text-xl font-bold text-gradient-premium">
              Profile & notification rules
            </h3>
            <p className="mt-2 text-sm text-gray-600 font-medium">
              Manage contact details, two-factor security, and notification
              channels to stay informed.
            </p>
            <Link to="/profile" className="mt-6 block">
              <Button
                variant="outline"
                size="sm"
                className="w-full border-accent-200 text-accent-700 shadow-md hover:shadow-lg"
              >
                Manage profile
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Recent Violations & Timeline */}
      <div className="grid gap-6 lg:grid-cols-[1.7fr_1fr]">
        <Card className="border border-slate-200 shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
            <CardTitle className="flex items-center gap-3 text-xl font-bold text-gray-900">
              <div className="rounded-xl bg-primary-100 p-2">
                <FileText className="h-5 w-5 text-primary-700" />
              </div>
              Active violations overview
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/violations/search")}
              className="border-primary-200 text-primary-700"
            >
              View all
            </Button>
          </CardHeader>
          <CardContent className="p-6">
            {recentViolations.length === 0 ? (
              <div className="py-12 text-center">
                <div className="relative inline-block">
                  <div className="absolute inset-0 rounded-full bg-gray-100 blur-xl" />
                  <FileText className="relative mx-auto h-16 w-16 text-gray-300" />
                </div>
                <h3 className="mt-4 text-lg font-bold text-gray-900">
                  No violations found
                </h3>
                <p className="mt-2 text-sm text-gray-600">
                  You do not have any traffic violations on record. Keep up the
                  great driving!
                </p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-gray-100">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gradient-to-r from-slate-50 to-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-700">
                        Violation
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-700">
                        Date
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-700">
                        Amount
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-700">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-700">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {recentViolations.map((violation) => (
                      <tr
                        key={violation.id}
                        className="cursor-pointer transition-all duration-150 hover:bg-gradient-to-r hover:from-primary-50/40 hover:to-blue-50/20"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className="h-10 w-10">
                              <Car className="h-10 w-10 text-gray-400" />
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-gray-900">
                                {formatViolationLabel(violation.violationType)}
                              </div>
                              <div className="text-xs uppercase tracking-wide text-gray-500">
                                {violation.plateNumber}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {new Date(
                            violation.violationDate
                          ).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                          ₱{Number(violation.totalFine).toFixed(2)}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${getStatusColor(violation.status)}`}
                          >
                            {getStatusIcon(violation.status)}
                            {violation.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm font-semibold">
                          <Link
                            to={`/violations/${violation.id}`}
                            className="inline-flex items-center rounded-lg bg-primary-50 px-3 py-1.5 text-primary-700 transition-colors duration-150 hover:bg-primary-100 hover:text-primary-800"
                          >
                            View details
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border border-gray-200 shadow-xl">
          <CardHeader className="border-b border-gray-200 bg-gradient-to-r from-green-50 to-white">
            <CardTitle className="flex items-center gap-3 text-lg font-bold text-gray-900">
              <div className="rounded-xl bg-green-100 p-2">
                <Calendar className="h-5 w-5 text-success-700" />
              </div>
              Timeline & reminders
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            {recentViolations.slice(0, 4).map((violation) => (
              <div key={violation.id} className="relative pl-6">
                <div className="absolute left-0 top-2 h-full w-px bg-gradient-to-b from-primary-200 via-primary-100 to-transparent" />
                <div className="absolute left-0 top-2 -translate-x-1.5 rounded-full border-2 border-white bg-primary-500 p-1 shadow-lg">
                  <Clock className="h-3 w-3 text-white" />
                </div>
                <div className="rounded-2xl border border-primary-100 bg-primary-50/70 p-4 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-widest text-primary-600">
                    {new Date(
                      violation.paymentDeadline ??
                        violation.dueDate ??
                        violation.violationDate
                    ).toLocaleDateString()}
                  </p>
                  <p className="mt-2 text-sm font-bold text-gray-900">
                    {formatViolationLabel(violation.violationType)} • ₱
                    {Number(violation.totalFine).toLocaleString("en-PH", {
                      minimumFractionDigits: 2,
                    })}
                  </p>
                  <p className="mt-1 text-xs text-gray-600">
                    Status: {violation.status.toUpperCase()}
                  </p>
                  <div className="mt-3 flex items-center justify-between text-xs text-primary-700">
                    <span>Tap to view instructions</span>
                    <Link
                      to={`/violations/${violation.id}`}
                      className="font-semibold hover:underline"
                    >
                      Open
                    </Link>
                  </div>
                </div>
              </div>
            ))}
            {recentViolations.length === 0 && (
              <div className="rounded-2xl border border-gray-200 bg-gray-50/80 p-6 text-sm text-gray-600">
                No reminders scheduled right now. New violations will
                automatically populate here.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default DashboardPage
