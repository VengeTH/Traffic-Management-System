import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Search,
  CreditCard,
  Shield,
  Clock,
  CheckCircle,
  ArrowRight,
  Car,
  FileText,
  Smartphone,
} from 'lucide-react';
import Button from '../components/UI/Button';

const HomePage: React.FC = () => {
  const { isAuthenticated } = useAuth();

  const features = [
    {
      icon: Search,
      title: 'Easy Violation Search',
      description: 'Search for traffic violations using OVR number, plate number, or driver\'s license.',
    },
    {
      icon: CreditCard,
      title: 'Secure Online Payment',
      description: 'Pay fines securely using multiple payment methods including GCash, Maya, and credit cards.',
    },
    {
      icon: Shield,
      title: 'Digital Receipts',
      description: 'Receive digital receipts with QR codes for easy verification and record keeping.',
    },
    {
      icon: Clock,
      title: '24/7 Availability',
      description: 'Access the system anytime, anywhere to check violations and make payments.',
    },
    {
      icon: CheckCircle,
      title: 'Real-time Updates',
      description: 'Get instant notifications and real-time updates on violation status and payments.',
    },
    {
      icon: Smartphone,
      title: 'Mobile Friendly',
      description: 'Fully responsive design that works perfectly on all devices and screen sizes.',
    },
  ];

  const paymentMethods = [
    { name: 'GCash', logo: 'GCash' },
    { name: 'Maya', logo: 'Maya' },
    { name: 'PayMongo', logo: 'PayMongo' },
    { name: 'DragonPay', logo: 'DragonPay' },
    { name: 'Credit Cards', logo: 'Visa/Mastercard' },
    { name: 'Debit Cards', logo: 'Local Banks' },
  ];

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-primary-600 to-primary-800 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="relative z-10 pb-8 bg-gradient-to-r from-primary-600 to-primary-800 sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
            <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
              <div className="sm:text-center lg:text-left">
                <h1 className="text-4xl tracking-tight font-extrabold text-white sm:text-5xl md:text-6xl">
                  <span className="block">Las Piñas Traffic</span>
                  <span className="block text-primary-200">Payment System</span>
                </h1>
                <p className="mt-3 text-base text-primary-100 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                  Pay your traffic violations online with ease. Search, verify, and settle fines securely from anywhere, anytime.
                </p>
                <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                  {!isAuthenticated ? (
                    <>
                      <div className="rounded-md shadow">
                        <Link to="/register">
                          <Button variant="secondary" size="lg" className="w-full">
                            Get Started
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                      <div className="mt-3 sm:mt-0 sm:ml-3">
                        <Link to="/login">
                          <Button variant="outline" size="lg" className="w-full">
                            Sign In
                          </Button>
                        </Link>
                      </div>
                    </>
                  ) : (
                    <div className="rounded-md shadow">
                      <Link to="/violations/search">
                        <Button variant="secondary" size="lg" className="w-full">
                          Search Violations
                          <Search className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </main>
          </div>
        </div>
        <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
          <div className="h-56 w-full bg-gradient-to-r from-primary-400 to-primary-600 sm:h-72 md:h-96 lg:w-full lg:h-full flex items-center justify-center">
            <div className="text-center text-white">
              <Car className="mx-auto h-24 w-24 mb-4" />
              <h3 className="text-xl font-semibold">Traffic Management</h3>
              <p className="text-primary-100">Digital solutions for modern cities</p>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-primary-600 font-semibold tracking-wide uppercase">Features</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Everything you need to manage traffic violations
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              Our comprehensive system provides all the tools needed for efficient traffic violation management and payment processing.
            </p>
          </div>

          <div className="mt-10">
            <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
              {features.map((feature) => (
                <div key={feature.title} className="relative">
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white">
                    <feature.icon className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <p className="ml-16 text-lg leading-6 font-medium text-gray-900">{feature.title}</p>
                  <p className="mt-2 ml-16 text-base text-gray-500">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Payment Methods Section */}
      <div className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-primary-600 font-semibold tracking-wide uppercase">Payment Methods</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Multiple payment options available
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              Choose from a variety of secure payment methods that suit your preferences.
            </p>
          </div>

          <div className="mt-10">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
              {paymentMethods.map((method) => (
                <div
                  key={method.name}
                  className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500"
                >
                  <div className="flex-1 min-w-0">
                    <span className="absolute inset-0" aria-hidden="true" />
                    <p className="text-sm font-medium text-gray-900">{method.name}</p>
                    <p className="text-sm text-gray-500">{method.logo}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-primary-700">
        <div className="max-w-2xl mx-auto text-center py-16 px-4 sm:py-20 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            <span className="block">Ready to get started?</span>
            <span className="block">Search for your violations today.</span>
          </h2>
          <p className="mt-4 text-lg leading-6 text-primary-200">
            Join thousands of citizens who are already using our online payment system.
          </p>
          <div className="mt-8 flex justify-center">
            {!isAuthenticated ? (
              <Link to="/register">
                <Button variant="secondary" size="lg">
                  Create Account
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            ) : (
              <Link to="/violations/search">
                <Button variant="secondary" size="lg">
                  Search Violations
                  <Search className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8">
          <div className="xl:grid xl:grid-cols-3 xl:gap-8">
            <div className="space-y-8 xl:col-span-1">
              <div className="flex items-center">
                <div className="h-8 w-8 bg-primary-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">LP</span>
                </div>
                <span className="ml-2 text-xl font-bold text-gray-900">
                  Las Piñas Traffic
                </span>
              </div>
              <p className="text-gray-500 text-base">
                Modernizing traffic management through digital solutions for the City of Las Piñas.
              </p>
            </div>
            <div className="mt-12 grid grid-cols-2 gap-8 xl:mt-0 xl:col-span-2">
              <div className="md:grid md:grid-cols-2 md:gap-8">
                <div>
                  <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Services</h3>
                  <ul className="mt-4 space-y-4">
                    <li>
                      <Link to="/violations/search" className="text-base text-gray-500 hover:text-gray-900">
                        Violation Search
                      </Link>
                    </li>
                    <li>
                      <Link to="/payments" className="text-base text-gray-500 hover:text-gray-900">
                        Online Payment
                      </Link>
                    </li>
                    <li>
                      <Link to="/profile" className="text-base text-gray-500 hover:text-gray-900">
                        Account Management
                      </Link>
                    </li>
                  </ul>
                </div>
                <div className="mt-12 md:mt-0">
                  <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Support</h3>
                  <ul className="mt-4 space-y-4">
                    <li>
                      <a href="#" className="text-base text-gray-500 hover:text-gray-900">
                        Help Center
                      </a>
                    </li>
                    <li>
                      <a href="#" className="text-base text-gray-500 hover:text-gray-900">
                        Contact Us
                      </a>
                    </li>
                    <li>
                      <a href="#" className="text-base text-gray-500 hover:text-gray-900">
                        Privacy Policy
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-12 border-t border-gray-200 pt-8">
            <p className="text-base text-gray-400 xl:text-center">
              &copy; 2024 Las Piñas City Government. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;



