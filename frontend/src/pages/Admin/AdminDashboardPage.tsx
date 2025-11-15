import React, { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { apiService } from "../../services/api"
import { AdminStats } from "../../types"
import {
  AlertTriangle,
  BarChart3,
  Calendar,
  CheckCircle,
  Clock,
  CreditCard,
  DollarSign,
  FileText,
  MapPin,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/UI/Card"
import Button from "../../components/UI/Button"
import LoadingSpinner from "../../components/UI/LoadingSpinner"
import PageHeader from "../../components/Layout/PageHeader"
import PageSection from "../../components/Layout/PageSection"

const formatViolationLabel = (value: string) => value.replace(/_/g, " ")

const AdminDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        setLoading(true)
        const response = await apiService.getAdminDashboard()
        setStats(response.data)
      } catch (error) {
        console.error("Failed to fetch admin stats:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchAdminStats()
  }, [])

  const totals = {
    users: stats?.users.total ?? 0,
    activeUsers: stats?.users.active ?? 0,
    violations: stats?.violations.total ?? 0,
    pendingViolations: stats?.violations.pending ?? 0,
    overdueViolations: stats?.violations.overdue ?? 0,
    paidViolations: stats?.violations.paid ?? 0,
    payments: stats?.payments.total ?? 0,
    completedPayments: stats?.payments.completed ?? 0,
    revenue: stats?.payments.revenue ?? 0,
  }

  // * Prepare trend insights for leadership snapshot
  const insightCards = useMemo(() => {
    const activeRatio =
      totals.users > 0
        ? Math.round((totals.activeUsers / totals.users) * 100)
        : 0
    const clearanceRate =
      totals.violations > 0
        ? Math.round((totals.paidViolations / totals.violations) * 100)
        : 0
    const overdueShare =
      totals.violations > 0
        ? Math.round((totals.overdueViolations / totals.violations) * 100)
        : 0
    const collectionRate =
      totals.payments > 0
        ? Math.round((totals.completedPayments / totals.payments) * 100)
        : 0

    return [
      {
        label: "Active user rate",
        value: `${activeRatio}%`,
        context: `${totals.activeUsers} of ${totals.users}`,
        isPositive: activeRatio >= 75,
      },
      {
        label: "Violation clearance",
        value: `${clearanceRate}%`,
        context: `${totals.paidViolations} resolved`,
        isPositive: clearanceRate >= 60,
      },
      {
        label: "Overdue exposure",
        value: `${overdueShare}%`,
        context: `${totals.overdueViolations} overdue`,
        isPositive: overdueShare <= 12,
      },
      {
        label: "Collection efficiency",
        value: `${collectionRate}%`,
        context: `${totals.completedPayments} settled`,
        isPositive: collectionRate >= 80,
      },
    ]
  }, [
    totals.activeUsers,
    totals.completedPayments,
    totals.overdueViolations,
    totals.paidViolations,
    totals.payments,
    totals.users,
    totals.violations,
  ])

  const topViolationType = stats?.violationsByType?.[0]
  const paymentHighlights = stats?.paymentsByMethod?.slice(0, 3) ?? []

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-8 px-4 pb-12 pt-8">
      <PageHeader
        title="Command Center"
        subtitle="Monitor Las Piñas traffic enforcement, revenue, and citizen engagement in real time."
        icon={BarChart3}
        actions={
          <>
            <Link to="/admin/violations">
              <Button
                variant="outline"
                size="sm"
                className="border-primary-200 text-primary-700"
              >
                Manage Violations
              </Button>
            </Link>
            <Button variant="primary" size="sm" className="px-5">
              Send Bulk Reminders
            </Button>
          </>
        }
      />

      {/* Executive Insights */}
      <div className="grid gap-5 lg:grid-cols-4 md:grid-cols-2">
        {insightCards.map((insight) => (
          <div
            key={insight.label}
            className="relative overflow-hidden rounded-3xl border border-primary-100 bg-white/95 p-5 shadow-xl"
          >
            <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br from-primary-100 to-secondary-100 opacity-60 blur-2xl" />
            <div className="relative">
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                {insight.label}
              </p>
              <div className="mt-3 flex items-baseline gap-3">
                <span className="text-3xl font-black text-gray-900">
                  {insight.value}
                </span>
                <span className="text-xs font-semibold text-gray-400">
                  Current
                </span>
              </div>
              <p className="mt-2 text-sm font-semibold text-gray-600">
                {insight.context}
              </p>
              <div className="mt-4 flex items-center gap-2 text-xs font-semibold">
                <div
                  className={`flex h-7 w-7 items-center justify-center rounded-full ${insight.isPositive ? "bg-success-100 text-success-600" : "bg-danger-100 text-danger-600"}`}
                >
                  {insight.isPositive ? (
                    <TrendingUp className="h-4 w-4" />
                  ) : (
                    <TrendingDown className="h-4 w-4" />
                  )}
                </div>
                <span
                  className={
                    insight.isPositive ? "text-success-600" : "text-danger-600"
                  }
                >
                  {insight.isPositive ? "Healthy trend" : "Requires attention"}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Operational Snapshot */}
      <PageSection
        title="Operational snapshot"
        description="Live metrics across users, violations, and payments to guide daily decisions."
      >
        <div className="grid gap-6 lg:grid-cols-4 md:grid-cols-2">
          <Card className="border border-blue-100 bg-white/95 shadow-xl">
            <CardContent className="flex items-center justify-between p-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-blue-600">
                  Total users
                </p>
                <p className="mt-3 text-3xl font-black text-gray-900">
                  {totals.users}
                </p>
                <p className="mt-1 text-sm text-blue-600">
                  {totals.activeUsers} active now
                </p>
              </div>
              <div className="rounded-2xl bg-blue-100 p-4 text-blue-600">
                <Users className="h-8 w-8" />
              </div>
            </CardContent>
          </Card>

          <Card className="border border-orange-100 bg-white/95 shadow-xl">
            <CardContent className="flex items-center justify-between p-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-orange-600">
                  Active violations
                </p>
                <p className="mt-3 text-3xl font-black text-gray-900">
                  {totals.violations}
                </p>
                <p className="mt-1 text-sm text-orange-600">
                  {totals.pendingViolations} pending review
                </p>
              </div>
              <div className="rounded-2xl bg-orange-100 p-4 text-orange-600">
                <FileText className="h-8 w-8" />
              </div>
            </CardContent>
          </Card>

          <Card className="border border-green-100 bg-white/95 shadow-xl">
            <CardContent className="flex items-center justify-between p-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-green-600">
                  Payments processed
                </p>
                <p className="mt-3 text-3xl font-black text-gray-900">
                  {totals.payments}
                </p>
                <p className="mt-1 text-sm text-green-600">
                  {totals.completedPayments} completed
                </p>
              </div>
              <div className="rounded-2xl bg-green-100 p-4 text-green-600">
                <CreditCard className="h-8 w-8" />
              </div>
            </CardContent>
          </Card>

          <Card className="border border-emerald-100 bg-white/95 shadow-xl">
            <CardContent className="flex items-center justify-between p-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-emerald-600">
                  Total revenue
                </p>
                <p className="mt-3 text-3xl font-black text-gray-900">
                  ₱
                  {totals.revenue.toLocaleString("en-PH", {
                    minimumFractionDigits: 2,
                  })}
                </p>
                <p className="mt-1 text-sm text-emerald-600">
                  Since system launch
                </p>
              </div>
              <div className="rounded-2xl bg-emerald-100 p-4 text-emerald-600">
                <DollarSign className="h-8 w-8" />
              </div>
            </CardContent>
          </Card>
        </div>
      </PageSection>

      {/* Violation Health & Alerts */}
      <PageSection
        title="Violation health"
        description="Track how many violations are resolved, pending action, or require escalation."
      >
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="border border-green-100 bg-white">
            <CardHeader className="border-b border-green-100 bg-green-50/60">
              <CardTitle className="flex items-center gap-3 text-lg text-green-700">
                <div className="rounded-xl bg-green-100 p-2">
                  <CheckCircle className="h-5 w-5" />
                </div>
                Resolved
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-4xl font-black text-green-600">
                {totals.paidViolations}
              </p>
              <p className="mt-2 text-sm text-gray-600">
                {totals.violations > 0
                  ? ((totals.paidViolations / totals.violations) * 100).toFixed(
                      1
                    )
                  : "0.0"}
                % of the total caseload is cleared.
              </p>
            </CardContent>
          </Card>

          <Card className="border border-orange-100 bg-white">
            <CardHeader className="border-b border-orange-100 bg-orange-50/60">
              <CardTitle className="flex items-center gap-3 text-lg text-orange-700">
                <div className="rounded-xl bg-orange-100 p-2">
                  <Clock className="h-5 w-5" />
                </div>
                Pending review
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-4xl font-black text-orange-600">
                {totals.pendingViolations}
              </p>
              <p className="mt-2 text-sm text-gray-600">
                Investigators have {totals.pendingViolations} cases waiting for
                supporting evidence.
              </p>
            </CardContent>
          </Card>

          <Card className="border border-red-100 bg-white">
            <CardHeader className="border-b border-red-100 bg-red-50/60">
              <CardTitle className="flex items-center gap-3 text-lg text-red-700">
                <div className="rounded-xl bg-red-100 p-2">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                Overdue alerts
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-4xl font-black text-red-600">
                {totals.overdueViolations}
              </p>
              <p className="mt-2 text-sm text-gray-600">
                Trigger follow-up notices for overdue accounts exceeding the
                legal grace period.
              </p>
            </CardContent>
          </Card>
        </div>
      </PageSection>

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        {/* Recent activity table */}
        <PageSection
          title="Recent activity"
          description="Latest violations and payments captured within the system."
          className="h-full"
        >
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-gray-100 bg-gray-50/70 p-5">
              <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-gray-500">
                <FileText className="h-4 w-4 text-primary-600" />
                New violations
              </h3>
              <div className="mt-4 space-y-4">
                {stats?.recentViolations?.slice(0, 4).map((violation) => (
                  <div
                    key={violation.id}
                    className="rounded-2xl border border-primary-100 bg-white p-4 shadow-sm"
                  >
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-semibold text-gray-900">
                        {formatViolationLabel(violation.violationType)}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(violation.violationDate).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-gray-600">
                      {violation.driverName} • {violation.plateNumber}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-primary-700">
                      ₱{Number(violation.totalFine).toFixed(2)} •{" "}
                      {violation.status.toUpperCase()}
                    </p>
                  </div>
                ))}
                {(!stats?.recentViolations ||
                  stats.recentViolations.length === 0) && (
                  <p className="rounded-2xl border border-dashed border-gray-300 bg-white py-6 text-center text-sm text-gray-500">
                    No new violations recorded today.
                  </p>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-gray-50/70 p-5">
              <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-gray-500">
                <CreditCard className="h-4 w-4 text-success-600" />
                Recent payments
              </h3>
              <div className="mt-4 space-y-4">
                {stats?.recentPayments?.slice(0, 4).map((payment) => (
                  <div
                    key={payment.id}
                    className="rounded-2xl border border-success-100 bg-white p-4 shadow-sm"
                  >
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-semibold text-gray-900">
                        {payment.payerName}
                      </span>
                      <span className="text-xs text-gray-500">
                        {payment.paymentMethod}
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-gray-600">
                      Ref: {payment.receiptNumber} •{" "}
                      {payment.status.toUpperCase()}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-success-700">
                      ₱{Number(payment.totalAmount).toFixed(2)}
                    </p>
                  </div>
                ))}
                {(!stats?.recentPayments ||
                  stats.recentPayments.length === 0) && (
                  <p className="rounded-2xl border border-dashed border-gray-300 bg-white py-6 text-center text-sm text-gray-500">
                    No payments processed today.
                  </p>
                )}
              </div>
            </div>
          </div>
        </PageSection>

        {/* Strategy sidebar */}
        <div className="space-y-6">
          <PageSection
            title="Priority actions"
            description="AI assisted recommendations to keep the pipeline healthy."
            headerAlignment="left"
            className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white"
          >
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3 rounded-2xl bg-white/10 p-4">
                <Calendar className="mt-0.5 h-5 w-5 text-accent-300" />
                <div>
                  <p className="font-semibold">
                    Schedule monthly clearance audit
                  </p>
                  <p className="text-white/80">
                    Review pending disputes from last 30 days.
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3 rounded-2xl bg-white/10 p-4">
                <AlertTriangle className="mt-0.5 h-5 w-5 text-orange-200" />
                <div>
                  <p className="font-semibold">Escalate overdue citations</p>
                  <p className="text-white/80">
                    Prepare legal packets for {totals.overdueViolations} cases
                    beyond 60 days.
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3 rounded-2xl bg-white/10 p-4">
                <MapPin className="mt-0.5 h-5 w-5 text-secondary-200" />
                <div>
                  <p className="font-semibold">Deploy checkpoint campaigns</p>
                  <p className="text-white/80">
                    Top violation type: {topViolationType?.type ?? "N/A"} (
                    {topViolationType?.count ?? 0}).
                  </p>
                </div>
              </li>
            </ul>
          </PageSection>

          <PageSection
            title="Payment mix"
            description="Usage distribution of cashless gateways."
            headerAlignment="left"
          >
            <ul className="space-y-3 text-sm text-gray-600">
              {paymentHighlights.map((method) => (
                <li
                  key={method.method}
                  className="flex items-center justify-between rounded-xl border border-gray-100 bg-white px-4 py-3 shadow-sm"
                >
                  <div>
                    <p className="font-semibold text-gray-900 uppercase tracking-wide">
                      {method.method}
                    </p>
                    <p className="text-xs text-gray-500">
                      {method.count} transactions
                    </p>
                  </div>
                  <span className="text-sm font-bold text-primary-700">
                    ₱
                    {Number(method.totalAmount).toLocaleString("en-PH", {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </li>
              ))}
              {paymentHighlights.length === 0 && (
                <li className="rounded-xl border border-dashed border-gray-300 bg-white px-4 py-3 text-center text-xs text-gray-500">
                  No payment data recorded yet.
                </li>
              )}
            </ul>
          </PageSection>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboardPage
