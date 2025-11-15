import React from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import {
  Shield,
  CreditCard,
  Smartphone,
  MapPin,
  FileText,
  Quote,
  ArrowRightCircle,
  Search,
  CheckCircle,
  Clock,
  BarChart3,
  Wallet,
  QrCode,
} from "lucide-react"
import Button from "../components/UI/Button"

const heroHighlights = [
  {
    icon: <Shield className="h-5 w-5" />,
    title: "Government grade security",
    description: "Two-factor ready with encrypted audit trails.",
  },
  {
    icon: <CreditCard className="h-5 w-5" />,
    title: "Cashless payments",
    description: "PayMongo, GCash, Maya, debit and credit cards.",
  },
  {
    icon: <Smartphone className="h-5 w-5" />,
    title: "Mobile optimized",
    description: "Responsive experience on any screen size.",
  },
]

const featureGrid = [
  {
    title: "Smart violation lookup",
    description:
      "Search by OVR number, plate number, or driver’s license within seconds.",
    icon: <Search className="h-6 w-6 text-primary-600" />,
  },
  {
    title: "Instant settlement",
    description:
      "Settle traffic fines online and receive verified digital receipts immediately.",
    icon: <CheckCircle className="h-6 w-6 text-success-600" />,
  },
  {
    title: "Real-time updates",
    description:
      "Get SMS and email alerts on outstanding dues, due dates, and payment status.",
    icon: <Clock className="h-6 w-6 text-warning-600" />,
  },
  {
    title: "Verified checkpoints",
    description:
      "Locate where citations were issued with precision using geotagged records.",
    icon: <MapPin className="h-6 w-6 text-secondary-600" />,
  },
]

const partnerMethods = [
  "GCash",
  "Maya",
  "PayMongo",
  "Visa",
  "Mastercard",
  "DragonPay",
]

const communityStats = [
  { value: "12,480+", label: "Violations processed" },
  { value: "₱3.1M", label: "Total payments collected" },
  { value: "24/7", label: "Availability" },
  { value: "4.9/5", label: "Citizen satisfaction" },
]

const HomePage: React.FC = () => {
  const { isAuthenticated } = useAuth()

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-green-50 via-white to-secondary-50 overflow-x-hidden w-full"
      style={{ maxWidth: "100vw", marginTop: "0", paddingTop: "0" }}
    >
      {/* Hero */}
      <section className="relative pt-8 pb-12 sm:pt-12 sm:pb-16 md:pt-20 md:pb-16 vignette w-full">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-secondary-50 mesh-bg z-0" />
        <div className="grid-overlay z-0" />
        <div className="relative mx-auto flex max-w-7xl flex-col gap-6 sm:gap-8 lg:gap-14 px-3 sm:px-4 md:px-6 lg:grid lg:grid-cols-[1.15fr_0.9fr] lg:px-8 w-full">
          <div className="space-y-6 sm:space-y-6 md:space-y-8 hero-orbit w-full min-w-0 p-4">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full">
              <span className="badge-pill text-sm sm:text-xs break-words max-w-full flex-shrink">
                <span className="whitespace-nowrap">EV Insights</span>
                <span className="h-1.5 w-1.5 rounded-full bg-success-500 inline-block mx-1"></span>
                <span className="break-words">
                  Las Piñas official traffic payments
                </span>
              </span>
              <span
                className="badge-pill border-secondary-300 text-secondary-700 text-sm sm:text-xs break-words max-w-full flex-shrink"
                style={{ borderColor: "rgba(2,132,199,0.35)" }}
              >
                Trusted by Las Piñas Traffic Management Office
              </span>
            </div>
            <div className="space-y-3 sm:space-y-4 w-full min-w-0 animate-fade-in-up">
              <h1
                className="text-3xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl 2xl:text-6xl font-black leading-tight break-words hyphens-auto text-gradient-premium"
                style={{ wordBreak: "break-word", overflowWrap: "break-word" }}
              >
                E-VioPay — settle traffic fines without lining up in city hall.
              </h1>
              <p
                className="text-base sm:text-sm md:text-base lg:text-lg text-gray-700 font-medium break-words leading-relaxed"
                style={{ wordBreak: "break-word", overflowWrap: "break-word" }}
              >
                Search, verify, and pay violations anytime. Our digital desk
                synchronizes with the Las Piñas Traffic Management Office so you
                always see accurate dues and receipts.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              {!isAuthenticated ? (
                <>
                  <Link to="/register" className="w-full sm:w-auto">
                    <Button
                      variant="accent"
                      size="lg"
                      className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg shadow-xl btn-glow"
                    >
                      Get started free
                    </Button>
                  </Link>
                  <Link to="/login" className="w-full sm:w-auto">
                    <Button
                      variant="outline"
                      size="lg"
                      className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg"
                    >
                      Sign in
                    </Button>
                  </Link>
                </>
              ) : (
                <Link to="/dashboard" className="w-full sm:w-auto">
                  <Button
                    variant="accent"
                    size="lg"
                    className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg shadow-xl btn-glow"
                  >
                    Open dashboard
                  </Button>
                </Link>
              )}
            </div>
          </div>

          <div
            className="relative mt-8 lg:mt-0 animate-scale-in"
            style={{ animationDelay: "0.2s" }}
          >
            <div className="rounded-2xl sm:rounded-[32px] lux-card animated-gradient-border quick-action-card hover-lift premium-glow-hover p-5 sm:p-6 lg:p-8 glassmorphism">
              <div className="flex items-start sm:items-center gap-3">
                <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl sm:rounded-2xl bg-primary-100 text-primary-700 flex-shrink-0">
                  <FileText className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm sm:text-sm font-semibold uppercase tracking-[0.1em] sm:tracking-[0.2em] md:tracking-[0.3em] text-primary-600 break-words">
                    Quick action
                  </p>
                  <h3 className="text-lg sm:text-lg md:text-xl font-bold text-gray-900 break-words mt-1">
                    Resolve a citation in three steps
                  </h3>
                </div>
              </div>
              <ol className="mt-4 sm:mt-6 space-y-3 sm:space-y-4 text-sm sm:text-sm text-gray-600">
                <li className="rounded-xl sm:rounded-2xl border border-primary-100 bg-primary-50/60 p-3 sm:p-4 tilt-on-hover">
                  <span className="font-semibold text-primary-700 block mb-1 text-base">
                    1 · Search
                  </span>
                  <p className="mt-1 break-words">
                    Enter your OVR number, plate number, or driver's license to
                    pull up records instantly.
                  </p>
                </li>
                <li className="rounded-xl sm:rounded-2xl border border-secondary-100 bg-secondary-50/60 p-3 sm:p-4 tilt-on-hover">
                  <span className="font-semibold text-secondary-700 block mb-1 text-base">
                    2 · Review
                  </span>
                  <p className="mt-1 break-words">
                    Check violation details, location map pin, penalties, and
                    official due dates.
                  </p>
                </li>
                <li className="rounded-xl sm:rounded-2xl border border-success-100 bg-success-50/70 p-3 sm:p-4 tilt-on-hover">
                  <span className="font-semibold text-success-700 block mb-1 text-base">
                    3 · Pay & receive
                  </span>
                  <p className="mt-1 break-words">
                    Choose a partner gateway and get an emailed PDF receipt plus
                    SMS confirmation.
                  </p>
                </li>
              </ol>
              {/* Demo credentials removed per request */}
            </div>
          </div>
        </div>
      </section>

      <div className="section-divider mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" />

      {/* Road showcase */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-16 sm:py-20 lg:px-8">
        <div className="text-center mb-6 sm:mb-8 md:mb-12 animate-fade-in-up">
          <h2 className="text-3xl sm:text-3xl md:text-4xl font-black text-gradient-premium">
            A smoother journey
          </h2>
          <p className="mt-2 sm:mt-3 text-base sm:text-base md:text-lg text-gray-700 font-medium">
            Visualize payments on the road—safe, fast, and verified.
          </p>
        </div>
        <div className="road h-40 sm:h-48 md:h-56 tilt-on-hover premium-glow-hover rounded-3xl overflow-hidden relative">
          <div className="road-edge top"></div>
          <div className="road-edge bottom"></div>

          {/* Payment Indicators - Floating on road - visible on all devices */}
          <div
            className="payment-indicator payment-float-1"
            style={{ top: "20%", left: "15%" }}
          >
            <div className="payment-badge">
              <CreditCard className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="text-[8px] sm:text-[10px] font-bold">Pay</span>
            </div>
          </div>
          <div
            className="payment-indicator payment-float-2"
            style={{ top: "45%", left: "55%", right: "auto" }}
          >
            <div className="payment-badge">
              <Wallet className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="text-[8px] sm:text-[10px] font-bold">GCash</span>
            </div>
          </div>
          <div
            className="payment-indicator payment-float-3"
            style={{ top: "75%", left: "35%" }}
          >
            <div className="payment-badge">
              <QrCode className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="text-[8px] sm:text-[10px] font-bold">QR</span>
            </div>
          </div>
          <div
            className="payment-indicator payment-float-4"
            style={{ top: "25%", left: "80%" }}
          >
            <div className="payment-badge">
              <Smartphone className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="text-[8px] sm:text-[10px] font-bold">Maya</span>
            </div>
          </div>

          {/* Vehicles - Top-down/Satellite view */}
          <div className="vehicle drive-right" style={{ top: "38%" }}>
            <svg
              viewBox="0 0 64 40"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-full"
            >
              {/* Car body from top view - facing right */}
              <ellipse
                cx="32"
                cy="20"
                rx="26"
                ry="14"
                fill="#2563EB"
                stroke="#1E40AF"
                strokeWidth="2"
              />
              {/* Car body highlight */}
              <ellipse
                cx="32"
                cy="18"
                rx="24"
                ry="12"
                fill="#3B82F6"
                opacity="0.3"
              />
              {/* Front windshield (right side - front of car) */}
              <ellipse
                cx="48"
                cy="20"
                rx="8"
                ry="10"
                fill="#DBEAFE"
                opacity="0.9"
              />
              <line
                x1="48"
                y1="10"
                x2="48"
                y2="30"
                stroke="#1E40AF"
                strokeWidth="1.5"
                opacity="0.7"
              />
              {/* Rear window (left side - back of car) */}
              <ellipse
                cx="16"
                cy="20"
                rx="6"
                ry="9"
                fill="#BFDBFE"
                opacity="0.7"
              />
              {/* Side windows */}
              <ellipse
                cx="32"
                cy="12"
                rx="18"
                ry="5"
                fill="#DBEAFE"
                opacity="0.6"
              />
              <ellipse
                cx="32"
                cy="28"
                rx="18"
                ry="5"
                fill="#DBEAFE"
                opacity="0.6"
              />
              {/* Door lines */}
              <line
                x1="24"
                y1="8"
                x2="24"
                y2="32"
                stroke="#1E40AF"
                strokeWidth="1"
                opacity="0.3"
              />
              <line
                x1="40"
                y1="8"
                x2="40"
                y2="32"
                stroke="#1E40AF"
                strokeWidth="1"
                opacity="0.3"
              />
              {/* Front headlight (right side - showing direction) */}
              <circle cx="56" cy="20" r="3" fill="#FEF3C7" />
              <circle cx="56" cy="20" r="1.5" fill="#FCD34D" />
              {/* Wheels from top view (4 wheels) */}
              <ellipse
                cx="18"
                cy="8"
                rx="4.5"
                ry="3"
                fill="#111827"
                stroke="#000000"
                strokeWidth="1"
              />
              <ellipse
                cx="18"
                cy="32"
                rx="4.5"
                ry="3"
                fill="#111827"
                stroke="#000000"
                strokeWidth="1"
              />
              <ellipse
                cx="46"
                cy="8"
                rx="4.5"
                ry="3"
                fill="#111827"
                stroke="#000000"
                strokeWidth="1"
              />
              <ellipse
                cx="46"
                cy="32"
                rx="4.5"
                ry="3"
                fill="#111827"
                stroke="#000000"
                strokeWidth="1"
              />
              {/* Wheel rims */}
              <ellipse cx="18" cy="8" rx="2.5" ry="1.8" fill="#374151" />
              <ellipse cx="18" cy="32" rx="2.5" ry="1.8" fill="#374151" />
              <ellipse cx="46" cy="8" rx="2.5" ry="1.8" fill="#374151" />
              <ellipse cx="46" cy="32" rx="2.5" ry="1.8" fill="#374151" />
              {/* Wheel centers */}
              <circle cx="18" cy="8" r="1" fill="#6B7280" />
              <circle cx="18" cy="32" r="1" fill="#6B7280" />
              <circle cx="46" cy="8" r="1" fill="#6B7280" />
              <circle cx="46" cy="32" r="1" fill="#6B7280" />
            </svg>
          </div>
          <div className="vehicle drive-left" style={{ top: "62%" }}>
            <svg
              viewBox="0 0 64 40"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-full"
            >
              {/* Car body from top view - facing left */}
              <ellipse
                cx="32"
                cy="20"
                rx="26"
                ry="14"
                fill="#059669"
                stroke="#047857"
                strokeWidth="2"
              />
              {/* Car body highlight */}
              <ellipse
                cx="32"
                cy="18"
                rx="24"
                ry="12"
                fill="#10B981"
                opacity="0.3"
              />
              {/* Front windshield (left side - front of car) */}
              <ellipse
                cx="16"
                cy="20"
                rx="8"
                ry="10"
                fill="#D1FAE5"
                opacity="0.9"
              />
              <line
                x1="16"
                y1="10"
                x2="16"
                y2="30"
                stroke="#047857"
                strokeWidth="1.5"
                opacity="0.7"
              />
              {/* Rear window (right side - back of car) */}
              <ellipse
                cx="48"
                cy="20"
                rx="6"
                ry="9"
                fill="#A7F3D0"
                opacity="0.7"
              />
              {/* Side windows */}
              <ellipse
                cx="32"
                cy="12"
                rx="18"
                ry="5"
                fill="#D1FAE5"
                opacity="0.6"
              />
              <ellipse
                cx="32"
                cy="28"
                rx="18"
                ry="5"
                fill="#D1FAE5"
                opacity="0.6"
              />
              {/* Door lines */}
              <line
                x1="24"
                y1="8"
                x2="24"
                y2="32"
                stroke="#047857"
                strokeWidth="1"
                opacity="0.3"
              />
              <line
                x1="40"
                y1="8"
                x2="40"
                y2="32"
                stroke="#047857"
                strokeWidth="1"
                opacity="0.3"
              />
              {/* Front headlight (left side - showing direction) */}
              <circle cx="8" cy="20" r="3" fill="#FEF3C7" />
              <circle cx="8" cy="20" r="1.5" fill="#FCD34D" />
              {/* Wheels from top view (4 wheels) */}
              <ellipse
                cx="18"
                cy="8"
                rx="4.5"
                ry="3"
                fill="#111827"
                stroke="#000000"
                strokeWidth="1"
              />
              <ellipse
                cx="18"
                cy="32"
                rx="4.5"
                ry="3"
                fill="#111827"
                stroke="#000000"
                strokeWidth="1"
              />
              <ellipse
                cx="46"
                cy="8"
                rx="4.5"
                ry="3"
                fill="#111827"
                stroke="#000000"
                strokeWidth="1"
              />
              <ellipse
                cx="46"
                cy="32"
                rx="4.5"
                ry="3"
                fill="#111827"
                stroke="#000000"
                strokeWidth="1"
              />
              {/* Wheel rims */}
              <ellipse cx="18" cy="8" rx="2.5" ry="1.8" fill="#374151" />
              <ellipse cx="18" cy="32" rx="2.5" ry="1.8" fill="#374151" />
              <ellipse cx="46" cy="8" rx="2.5" ry="1.8" fill="#374151" />
              <ellipse cx="46" cy="32" rx="2.5" ry="1.8" fill="#374151" />
              {/* Wheel centers */}
              <circle cx="18" cy="8" r="1" fill="#6B7280" />
              <circle cx="18" cy="32" r="1" fill="#6B7280" />
              <circle cx="46" cy="8" r="1" fill="#6B7280" />
              <circle cx="46" cy="32" r="1" fill="#6B7280" />
            </svg>
          </div>
        </div>
      </section>

      {/* Community stats */}
      <section className="border-y border-white/60 bg-gradient-to-br from-white via-primary-50/30 to-white py-12 sm:py-16 backdrop-blur-sm gradient-mesh">
        <div className="mx-auto grid max-w-6xl gap-4 sm:gap-6 px-4 sm:px-6 grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 lg:px-8">
          {communityStats.map((stat, index) => (
            <div
              key={stat.label}
              className="lux-card animated-gradient-border hover-lift premium-glow-hover section-glow p-6 sm:p-8 text-center shine-effect animate-fade-in-up"
              style={{ animationDelay: `${index * 0.06}s` }}
            >
              <div className="text-4xl sm:text-4xl font-black text-gradient-premium tracking-tight">
                {stat.value}
              </div>
              <p className="mt-3 text-sm sm:text-sm font-bold text-gray-700 uppercase tracking-wider">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-16 sm:py-20 lg:px-8">
        <div className="flex flex-col gap-4 sm:gap-6 text-center animate-fade-in-up">
          <div className="mx-auto flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-xl premium-glow">
            <BarChart3 className="h-6 w-6 sm:h-7 sm:w-7" />
          </div>
          <h2 className="text-3xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-gradient-premium break-words px-2">
            Why drivers trust E-VioPay
          </h2>
          <p className="mx-auto max-w-3xl text-base sm:text-base md:text-lg lg:text-xl text-gray-700 font-medium px-4 break-words leading-relaxed">
            Built with the Las Piñas Traffic Management Office, E-VioPay
            streamlines violation settlement while following the city's design
            system.
          </p>
        </div>
        <div className="mt-12 sm:mt-16 grid gap-6 sm:gap-8 grid-cols-1 md:grid-cols-2">
          {featureGrid.map((feature, index) => (
            <div
              key={feature.title}
              className="group lux-card animated-gradient-border hover-lift premium-glow-hover section-glow p-6 sm:p-8 transition shine-effect animate-fade-in-up"
              style={{ animationDelay: `${index * 0.08}s` }}
            >
              <div className="flex items-start gap-4 sm:gap-5">
                <div className="flex-shrink-0 flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-xl sm:rounded-2xl bg-gradient-to-br from-primary-100 to-primary-200 text-primary-700 shadow-lg premium-glow group-hover:scale-110 transition-transform duration-200">
                  {feature.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight">
                    {feature.title}
                  </h3>
                  <p className="mt-2 sm:mt-3 text-base sm:text-base text-gray-700 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Partners */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 pb-12 sm:pb-20 lg:px-8">
        <div className="rounded-3xl sm:rounded-[40px] border-2 border-secondary-200/50 bg-gradient-to-br from-secondary-50/80 via-white to-primary-50/40 p-6 sm:p-8 lg:p-10 shadow-2xl premium-glow glassmorphism">
          <div className="flex flex-col gap-3 sm:gap-4 text-center">
            <p className="text-sm sm:text-sm font-semibold uppercase tracking-[0.1em] sm:tracking-[0.2em] md:tracking-[0.3em] text-secondary-600 break-words">
              Payment partners
            </p>
            <h3 className="text-xl sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 break-words px-2">
              Trusted gateways with instant confirmation
            </h3>
            <p className="text-sm sm:text-sm text-gray-600 px-2 break-words">
              Choose from leading Philippine payment providers and grab an
              official receipt automatically.
            </p>
          </div>
          <div className="mt-8 sm:mt-10 grid gap-4 sm:gap-5 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
            {partnerMethods.map((method, index) => (
              <div
                key={method}
                className="lux-card animated-gradient-border hover-lift premium-glow-hover section-glow py-4 sm:py-5 text-center text-base sm:text-base font-bold text-gray-800 shine-effect animate-scale-in"
                style={{ animationDelay: `${index * 0.03}s` }}
              >
                {method}
              </div>
            ))}
          </div>
          {/* marquee row - infinite scroll */}
          <div className="mt-6 sm:mt-8 marquee">
            <div className="marquee-track">
              {/* Duplicate multiple times for seamless infinite loop */}
              {[
                ...partnerMethods,
                ...partnerMethods,
                ...partnerMethods,
                ...partnerMethods,
              ].map((method, i) => (
                <div
                  key={`mq-${i}`}
                  className="lux-card py-2 px-3 sm:px-4 text-[10px] sm:text-xs font-semibold text-gray-700 flex-shrink-0"
                >
                  {method}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How it works timeline */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 py-16 sm:py-20 lg:px-8">
        <div className="text-center animate-fade-in-up">
          <h2 className="text-3xl sm:text-3xl md:text-4xl font-black text-gradient-premium">
            How E‑VioPay works
          </h2>
          <p className="mt-3 text-base sm:text-base md:text-lg text-gray-700 font-medium">
            A clear path from citation to confirmation.
          </p>
        </div>
        <div className="mt-12 sm:mt-16 grid gap-6 sm:gap-8 grid-cols-1 md:grid-cols-3">
          <div
            className="lux-card animated-gradient-border timeline-card hover-lift premium-glow-hover section-glow p-6 sm:p-8 shine-effect animate-fade-in-up"
            style={{ animationDelay: "0s" }}
          >
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-100 to-primary-200 text-primary-700 shadow-lg premium-glow">
                <Search className="h-6 w-6 sm:h-7 sm:w-7" />
              </div>
              <p className="text-base sm:text-lg font-bold text-gray-900">
                Find your record
              </p>
            </div>
            <p className="mt-4 text-base sm:text-base text-gray-700 leading-relaxed">
              Search by OVR, plate number, or license to load citations
              instantly.
            </p>
          </div>
          <div
            className="lux-card animated-gradient-border timeline-card hover-lift premium-glow-hover section-glow p-6 sm:p-8 shine-effect animate-fade-in-up"
            style={{ animationDelay: "0.1s" }}
          >
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-secondary-100 to-secondary-200 text-secondary-700 shadow-lg premium-glow">
                <FileText className="h-6 w-6 sm:h-7 sm:w-7" />
              </div>
              <p className="text-base sm:text-lg font-bold text-gray-900">
                Review and verify
              </p>
            </div>
            <p className="mt-4 text-base sm:text-base text-gray-700 leading-relaxed">
              See details, penalties, location, and official due dates before
              paying.
            </p>
          </div>
          <div
            className="lux-card animated-gradient-border timeline-card hover-lift premium-glow-hover section-glow p-6 sm:p-8 shine-effect animate-fade-in-up"
            style={{ animationDelay: "0.2s" }}
          >
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-success-100 to-success-200 text-success-700 shadow-lg premium-glow">
                <CreditCard className="h-6 w-6 sm:h-7 sm:w-7" />
              </div>
              <p className="text-base sm:text-lg font-bold text-gray-900">
                Pay and receive
              </p>
            </div>
            <p className="mt-4 text-base sm:text-base text-gray-700 leading-relaxed">
              Complete payment through partners and get a verified PDF receipt.
            </p>
          </div>
        </div>
      </section>

      {/* Testimonial banner */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 pb-12 sm:pb-16 lg:px-8">
        <div className="lux-card animated-gradient-border testimonial-card hover-lift premium-glow-hover section-glow p-8 sm:p-10 lg:p-12 glassmorphism shine-effect">
          <div className="flex items-start gap-4 sm:gap-6">
            <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-xl premium-glow flex-shrink-0">
              <Quote className="h-6 w-6 sm:h-7 sm:w-7" />
            </div>
            <div className="flex-1">
              <p className="text-base sm:text-lg md:text-xl font-bold text-gray-900 break-words leading-relaxed">
                "E‑VioPay made handling my citation painless. Minutes to search,
                seconds to pay, and the receipt was instant."
              </p>
              <p className="mt-4 text-base sm:text-base font-semibold text-primary-700 break-words">
                — Resident, Las Piñas City
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA band */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 pb-12 sm:pb-20 lg:px-8">
        <div className="rounded-3xl sm:rounded-[40px] bg-gradient-to-r from-primary-600 via-primary-700 to-primary-800 p-8 sm:p-10 lg:p-12 text-white shadow-2xl hover-lift premium-glow-hover relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary-400/20 via-transparent to-secondary-400/20 animate-pulse"></div>
          <div className="relative z-10">
            <div className="flex flex-col items-start gap-4 sm:gap-6 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="text-xl sm:text-xl md:text-2xl font-bold break-words">
                  Ready to resolve a citation today?
                </h3>
                <p className="mt-1 text-sm sm:text-sm md:text-base text-white/85 break-words">
                  Search, verify, and pay with official confirmation—anytime.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <Link to="/violations/search" className="w-full sm:w-auto">
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full sm:w-auto border-white/70 text-white bg-white/15 hover:bg-white/25 hover:border-white shadow-lg shadow-primary-900/30 flex items-center justify-center gap-2 backdrop-blur-sm transition-all px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg"
                  >
                    <span>Start a search</span>
                    <ArrowRightCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                  </Button>
                </Link>
                <Link to="/register" className="w-full sm:w-auto">
                  <Button
                    variant="accent"
                    size="lg"
                    className="w-full sm:w-auto btn-glow px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg"
                  >
                    Create account
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Footer - Bottom */}
      <footer className="border-t border-white/60 bg-gradient-to-br from-white via-primary-50/20 to-white py-8 sm:py-12 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row md:items-start">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-600 to-primary-700 text-white shadow-xl premium-glow text-sm sm:text-base font-black">
                EV
              </div>
              <div>
                <p className="font-black text-gray-900 text-base sm:text-lg">
                  E-VioPay
                </p>
                <p className="text-[10px] sm:text-xs font-medium text-gray-600">
                  Las Piñas Online Traffic Payments
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-4 text-center md:text-right">
              {/* The Heedful */}
              <div>
                <p className="text-xs sm:text-sm text-gray-600 font-medium mb-1">
                  Designed & engineered by
                </p>
                <a
                  href="https://vengeth.github.io/The-Heedful"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-primary-700 underline decoration-primary-300 underline-offset-4 hover:text-primary-800 transition-colors text-sm sm:text-base"
                >
                  The Heedful
                </a>
              </div>

              {/* Technopreneurship Team */}
              <div className="border-t border-gray-200 pt-4 mt-2">
                <p className="text-xs sm:text-sm text-gray-600 font-medium mb-2">
                  Technopreneurship Team
                </p>
                <div className="text-[10px] sm:text-xs text-gray-600 space-y-1">
                  <p>
                    <span className="font-semibold">OFO/Leader:</span> Julianne
                    J. Cruz{" "}
                    <span className="text-primary-600">(The Heedful)</span>
                  </p>
                  <p>
                    <span className="font-semibold">CEO:</span> Jez Christian
                    Cuevas
                  </p>
                  <p>
                    <span className="font-semibold">GDM:</span> Trina C.
                    Marbella
                  </p>
                  <p>
                    <span className="font-semibold">IT SD:</span> Aljhon
                    Cipriano{" "}
                    <span className="text-primary-600">(The Heedful)</span>
                  </p>
                  <p>
                    <span className="font-semibold">TSO:</span> Prinze Mikhail
                    V. Sadsad{" "}
                    <span className="text-primary-600">(The Heedful)</span>
                  </p>
                  <p>
                    <span className="font-semibold">MCR:</span> Jerald Kyle S.
                    Ordaz{" "}
                    <span className="text-primary-600">(The Heedful)</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default HomePage
