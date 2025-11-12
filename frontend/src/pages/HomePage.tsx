import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Shield, CreditCard, Smartphone, MapPin, FileText, Car, Quote, ArrowRightCircle, Search, CheckCircle, Clock, BarChart3 } from 'lucide-react';
import Button from '../components/UI/Button';

const heroHighlights = [
  {
    icon: <Shield className="h-5 w-5" />,
    title: 'Government grade security',
    description: 'Two-factor ready with encrypted audit trails.'
  },
  {
    icon: <CreditCard className="h-5 w-5" />,
    title: 'Cashless payments',
    description: 'PayMongo, GCash, Maya, debit and credit cards.'
  },
  {
    icon: <Smartphone className="h-5 w-5" />,
    title: 'Mobile optimized',
    description: 'Responsive experience on any screen size.'
  }
];

const featureGrid = [
  {
    title: 'Smart violation lookup',
    description: 'Search by OVR number, plate number, or driver’s license within seconds.',
    icon: <Search className="h-6 w-6 text-primary-600" />
  },
  {
    title: 'Instant settlement',
    description: 'Settle traffic fines online and receive verified digital receipts immediately.',
    icon: <CheckCircle className="h-6 w-6 text-success-600" />
  },
  {
    title: 'Real-time updates',
    description: 'Get SMS and email alerts on outstanding dues, due dates, and payment status.',
    icon: <Clock className="h-6 w-6 text-warning-600" />
  },
  {
    title: 'Verified checkpoints',
    description: 'Locate where citations were issued with precision using geotagged records.',
    icon: <MapPin className="h-6 w-6 text-secondary-600" />
  }
];

const partnerMethods = ['GCash', 'Maya', 'PayMongo', 'Visa', 'Mastercard', 'DragonPay'];

const communityStats = [
  { value: '12,480+', label: 'Violations processed' },
  { value: '₱3.1M', label: 'Total payments collected' },
  { value: '24/7', label: 'Availability' },
  { value: '4.9/5', label: 'Citizen satisfaction' }
];

const HomePage: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-secondary-50 overflow-x-hidden w-full" style={{maxWidth: '100vw'}}>
      {/* Hero */}
      <section className="relative pt-16 pb-12 sm:pt-20 sm:pb-16 vignette w-full">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-secondary-50 mesh-bg" />
        <div className="grid-overlay" />
        <div className="relative mx-auto flex max-w-7xl flex-col gap-6 sm:gap-8 lg:gap-14 px-3 sm:px-4 md:px-6 lg:grid lg:grid-cols-[1.15fr_0.9fr] lg:px-8 w-full">
          <div className="space-y-5 sm:space-y-6 md:space-y-8 hero-orbit w-full min-w-0">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full">
              <span className="badge-pill text-[10px] sm:text-xs break-words max-w-full flex-shrink">
                <span className="whitespace-nowrap">EV Insights</span>
                <span className="h-1.5 w-1.5 rounded-full bg-success-500 inline-block mx-1"></span>
                <span className="break-words">Las Piñas official traffic payments</span>
              </span>
              <span className="badge-pill border-secondary-300 text-secondary-700 text-[10px] sm:text-xs break-words max-w-full flex-shrink" style={{borderColor: 'rgba(2,132,199,0.35)'}}>
                Trusted by Las Piñas Traffic Management Office
              </span>
            </div>
            <div className="space-y-3 sm:space-y-4 w-full min-w-0">
              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl 2xl:text-6xl font-black text-gray-900 leading-tight break-words hyphens-auto" style={{wordBreak: 'break-word', overflowWrap: 'break-word'}}>
                E-VioPay — settle traffic fines without lining up in city hall.
              </h1>
              <p className="text-xs sm:text-sm md:text-base lg:text-lg text-gray-600 break-words" style={{wordBreak: 'break-word', overflowWrap: 'break-word'}}>
                Search, verify, and pay violations anytime. Our digital desk synchronizes with the Las Piñas Traffic Management Office so you always see accurate dues and receipts.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              {!isAuthenticated ? (
                <>
                  <Link to="/register" className="w-full sm:w-auto">
                    <Button variant="accent" size="lg" className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg shadow-xl btn-glow">
                      Get started free
                    </Button>
                  </Link>
                  <Link to="/login" className="w-full sm:w-auto">
                    <Button variant="outline" size="lg" className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg">
                      Sign in
                    </Button>
                  </Link>
                </>
              ) : (
                <Link to="/dashboard" className="w-full sm:w-auto">
                  <Button variant="accent" size="lg" className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg shadow-xl btn-glow">
                    Open dashboard
                  </Button>
                </Link>
              )}
            </div>
            <div className="grid gap-4 sm:gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {heroHighlights.map((item) => (
                <div key={item.title} className="lux-card animated-gradient-border highlight-card tilt-on-hover p-4 sm:p-6">
                  <div className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-xl bg-primary-50 text-primary-600 shadow">
                    {item.icon}
                  </div>
                  <h3 className="mt-3 text-sm sm:text-base font-semibold text-gray-900">{item.title}</h3>
                  <p className="mt-2 text-xs sm:text-sm text-gray-600">{item.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative mt-8 lg:mt-0">
            <div className="rounded-2xl sm:rounded-[32px] lux-card animated-gradient-border quick-action-card tilt-on-hover p-5 sm:p-6 lg:p-8">
              <div className="flex items-start sm:items-center gap-3">
                <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl sm:rounded-2xl bg-primary-100 text-primary-700 flex-shrink-0">
                  <FileText className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-semibold uppercase tracking-[0.1em] sm:tracking-[0.2em] md:tracking-[0.3em] text-primary-600 break-words">Quick action</p>
                  <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 break-words mt-1">Resolve a citation in three steps</h3>
                </div>
              </div>
              <ol className="mt-4 sm:mt-6 space-y-3 sm:space-y-4 text-xs sm:text-sm text-gray-600">
                <li className="rounded-xl sm:rounded-2xl border border-primary-100 bg-primary-50/60 p-3 sm:p-4 tilt-on-hover">
                  <span className="font-semibold text-primary-700 block mb-1">1 · Search</span>
                  <p className="mt-1 break-words">Enter your OVR number, plate number, or driver's license to pull up records instantly.</p>
                </li>
                <li className="rounded-xl sm:rounded-2xl border border-secondary-100 bg-secondary-50/60 p-3 sm:p-4 tilt-on-hover">
                  <span className="font-semibold text-secondary-700 block mb-1">2 · Review</span>
                  <p className="mt-1 break-words">Check violation details, location map pin, penalties, and official due dates.</p>
                </li>
                <li className="rounded-xl sm:rounded-2xl border border-success-100 bg-success-50/70 p-3 sm:p-4 tilt-on-hover">
                  <span className="font-semibold text-success-700 block mb-1">3 · Pay & receive</span>
                  <p className="mt-1 break-words">Choose a partner gateway and get an emailed PDF receipt plus SMS confirmation.</p>
                </li>
              </ol>
              {/* Demo credentials removed per request */}
            </div>
          </div>
        </div>
      </section>

      <div className="section-divider mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" />

      {/* Road showcase */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-12 sm:py-16 lg:px-8">
        <div className="text-center mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">A smoother journey</h2>
          <p className="mt-2 text-sm sm:text-base text-gray-600">Visualize payments on the road—safe, fast, and verified.</p>
        </div>
        <div className="road h-32 sm:h-40 md:h-48 tilt-on-hover">
          <div className="road-edge top"></div>
          <div className="road-edge bottom"></div>
          {/* Vehicles */}
          <div className="vehicle drive-right" style={{ top: '38%' }}>
            <Car className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
          <div className="vehicle drive-left" style={{ top: '62%' }}>
            <Smartphone className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
        </div>
      </section>

      {/* Community stats */}
      <section className="border-y border-white/60 bg-white/80 py-8 sm:py-12 backdrop-blur-sm">
        <div className="mx-auto grid max-w-6xl gap-4 sm:gap-6 px-4 sm:px-6 grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 lg:px-8">
          {communityStats.map((stat) => (
            <div key={stat.label} className="lux-card animated-gradient-border tilt-on-hover p-4 sm:p-6 text-center">
              <div className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">{stat.value}</div>
              <p className="mt-2 text-xs sm:text-sm font-semibold text-gray-600">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-12 sm:py-16 lg:px-8">
        <div className="flex flex-col gap-4 sm:gap-6 text-center">
          <div className="mx-auto flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl sm:rounded-2xl bg-primary-100 text-primary-700">
            <BarChart3 className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 break-words px-2">Why drivers trust E-VioPay</h2>
            <p className="mx-auto max-w-3xl text-xs sm:text-sm md:text-base lg:text-lg text-gray-600 px-4 break-words">
              Built with the Las Piñas Traffic Management Office, E-VioPay streamlines violation settlement while following the city's design system.
            </p>
        </div>
        <div className="mt-8 sm:mt-12 grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2">
          {featureGrid.map((feature) => (
            <div key={feature.title} className="group lux-card animated-gradient-border tilt-on-hover p-5 sm:p-6 transition">
              <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl sm:rounded-2xl bg-primary-50 text-primary-600">
                {feature.icon}
              </div>
              <h3 className="mt-3 sm:mt-4 text-lg sm:text-xl font-semibold text-gray-900">{feature.title}</h3>
              <p className="mt-2 text-xs sm:text-sm text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Partners */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 pb-12 sm:pb-20 lg:px-8">
        <div className="rounded-2xl sm:rounded-3xl border border-secondary-200 bg-secondary-50/60 p-5 sm:p-6 lg:p-8 shadow-xl">
          <div className="flex flex-col gap-3 sm:gap-4 text-center">
            <p className="text-xs sm:text-sm font-semibold uppercase tracking-[0.1em] sm:tracking-[0.2em] md:tracking-[0.3em] text-secondary-600 break-words">Payment partners</p>
            <h3 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 break-words px-2">Trusted gateways with instant confirmation</h3>
            <p className="text-xs sm:text-sm text-gray-600 px-2 break-words">
              Choose from leading Philippine payment providers and grab an official receipt automatically.
            </p>
          </div>
          <div className="mt-6 sm:mt-8 grid gap-3 sm:gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
            {partnerMethods.map((method) => (
              <div key={method} className="lux-card animated-gradient-border tilt-on-hover py-3 sm:py-4 text-center text-xs sm:text-sm font-semibold text-gray-700">
                {method}
              </div>
            ))}
          </div>
          {/* marquee row */}
          <div className="mt-6 sm:mt-8 marquee">
            <div className="marquee-track">
              {partnerMethods.concat(partnerMethods).map((method, i) => (
                <div key={`mq-${i}`} className="lux-card py-2 px-3 sm:px-4 text-[10px] sm:text-xs font-semibold text-gray-700">{method}</div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How it works timeline */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 py-12 sm:py-16 lg:px-8">
        <div className="text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">How E‑VioPay works</h2>
          <p className="mt-2 text-sm sm:text-base text-gray-600">A clear path from citation to confirmation.</p>
        </div>
        <div className="mt-8 sm:mt-10 grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-3">
          <div className="lux-card animated-gradient-border timeline-card p-5 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-lg sm:rounded-xl bg-primary-50 text-primary-600">
                <Search className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <p className="text-sm sm:text-base font-semibold text-gray-900">Find your record</p>
            </div>
            <p className="mt-3 text-xs sm:text-sm text-gray-600">Search by OVR, plate number, or license to load citations instantly.</p>
          </div>
          <div className="lux-card animated-gradient-border timeline-card p-5 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-lg sm:rounded-xl bg-secondary-50 text-secondary-700">
                <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <p className="text-sm sm:text-base font-semibold text-gray-900">Review and verify</p>
            </div>
            <p className="mt-3 text-xs sm:text-sm text-gray-600">See details, penalties, location, and official due dates before paying.</p>
          </div>
          <div className="lux-card animated-gradient-border timeline-card p-5 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-lg sm:rounded-xl bg-success-50 text-success-700">
                <CreditCard className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <p className="text-sm sm:text-base font-semibold text-gray-900">Pay and receive</p>
            </div>
            <p className="mt-3 text-xs sm:text-sm text-gray-600">Complete payment through partners and get a verified PDF receipt.</p>
          </div>
        </div>
      </section>

      {/* Testimonial banner */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 pb-12 sm:pb-16 lg:px-8">
        <div className="lux-card animated-gradient-border testimonial-card p-5 sm:p-6 lg:p-8 tilt-on-hover">
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-lg sm:rounded-xl bg-primary-50 text-primary-700 flex-shrink-0">
              <Quote className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div>
              <p className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 break-words">"E‑VioPay made handling my citation painless. Minutes to search, seconds to pay, and the receipt was instant."</p>
              <p className="mt-2 text-xs sm:text-sm text-gray-600 break-words">— Resident, Las Piñas City</p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA band */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 pb-12 sm:pb-20 lg:px-8">
        <div className="rounded-2xl sm:rounded-3xl bg-gradient-to-r from-primary-600 via-primary-700 to-primary-800 p-5 sm:p-6 lg:p-8 text-white shadow-2xl tilt-on-hover">
          <div className="flex flex-col items-start gap-4 sm:gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold break-words">Ready to resolve a citation today?</h3>
              <p className="mt-1 text-xs sm:text-sm md:text-base text-white/85 break-words">Search, verify, and pay with official confirmation—anytime.</p>
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
                <Button variant="accent" size="lg" className="w-full sm:w-auto btn-glow px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg">
                  Create account
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
      {/* Footer - Bottom */}
      <footer className="border-t border-white/60 bg-white/80 py-6 sm:py-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 sm:px-6 text-xs sm:text-sm text-gray-600 md:flex-row lg:px-8">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-xl sm:rounded-2xl bg-primary-600 text-white shadow text-xs sm:text-sm font-bold">
              EV
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-sm sm:text-base">E-VioPay</p>
              <p className="text-[10px] sm:text-xs">Las Piñas Online Traffic Payments</p>
            </div>
          </div>
          <div className="text-center md:text-right">
            <span className="text-gray-500">Designed & engineered by </span>
            <a
              href="https://vengeth.github.io/The-Heedful"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-gray-800 underline decoration-gray-400 underline-offset-4 hover:text-gray-900"
            >
              The Heedful
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;