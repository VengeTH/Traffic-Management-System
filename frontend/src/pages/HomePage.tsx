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
  FileText,
  Smartphone,
  Star,
  Zap,
} from 'lucide-react';
import Button from '../components/UI/Button';

const HomePage: React.FC = () => {
  const { isAuthenticated } = useAuth();

  const features = [
    {
      icon: Search,
      title: 'Easy Violation Search',
      description: 'Search for traffic violations using OVR number, plate number, or driver\'s license.',
      color: 'from-blue-500 to-blue-600',
    },
    {
      icon: CreditCard,
      title: 'Secure Online Payment',
      description: 'Pay fines securely using multiple payment methods including GCash, Maya, and credit cards.',
      color: 'from-green-500 to-green-600',
    },
    {
      icon: Shield,
      title: 'Digital Receipts',
      description: 'Receive digital receipts with QR codes for easy verification and record keeping.',
      color: 'from-purple-500 to-purple-600',
    },
    {
      icon: Clock,
      title: '24/7 Availability',
      description: 'Access the system anytime, anywhere to check violations and make payments.',
      color: 'from-orange-500 to-orange-600',
    },
    {
      icon: CheckCircle,
      title: 'Real-time Updates',
      description: 'Get instant notifications and real-time updates on violation status and payments.',
      color: 'from-teal-500 to-teal-600',
    },
    {
      icon: Smartphone,
      title: 'Mobile Friendly',
      description: 'Fully responsive design that works perfectly on all devices and screen sizes.',
      color: 'from-pink-500 to-pink-600',
    },
  ];

  const paymentMethods = [
    { name: 'GCash', logo: 'GCash', color: 'bg-blue-500' },
    { name: 'Maya', logo: 'Maya', color: 'bg-purple-500' },
    { name: 'PayMongo', logo: 'PayMongo', color: 'bg-green-500' },
    { name: 'DragonPay', logo: 'DragonPay', color: 'bg-red-500' },
    { name: 'Credit Cards', logo: 'Visa/Mastercard', color: 'bg-indigo-500' },
    { name: 'Debit Cards', logo: 'Local Banks', color: 'bg-gray-500' },
  ];

  const stats = [
    { number: '10,000+', label: 'Violations Processed', icon: FileText },
    { number: '₱2.5M+', label: 'Total Payments', icon: CreditCard },
    { number: '99.9%', label: 'Uptime', icon: Zap },
    { number: '4.8/5', label: 'User Rating', icon: Star },
  ];

  return (
    <div className="min-h-screen hero-pattern">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary-600/90 to-primary-800/90"></div>
        <div className="absolute inset-0 hero-pattern opacity-20"></div>
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-white/10 rounded-full animate-float"></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-accent-400/20 rounded-full animate-bounce-gentle"></div>
        <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-white/10 rounded-full animate-float" style={{animationDelay: '1s'}}></div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-20 md:py-32">
            <div className="text-center lg:text-left">
              <div className="max-w-4xl mx-auto lg:mx-0">
                <h1 className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight">
                  <span className="block">E-VioPay</span>
                  <span className="block bg-gradient-to-r from-accent-300 to-accent-500 bg-clip-text text-transparent">
                    Las Piñas Online Traffic Payments
                  </span>
                </h1>
                <p className="text-xl md:text-2xl text-green-100 mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                  Pay your traffic violations online with ease. Search, verify, and settle fines securely from anywhere, anytime.
                </p>
                
                {/* Feature Highlights */}
                <div className="flex flex-wrap justify-center lg:justify-start gap-4 mb-10">
                  <div className="flex items-center bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                    <CheckCircle className="h-5 w-5 text-accent-300 mr-2" />
                    <span className="text-white font-medium">Secure Payments</span>
                  </div>
                  <div className="flex items-center bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                    <Clock className="h-5 w-5 text-accent-300 mr-2" />
                    <span className="text-white font-medium">24/7 Available</span>
                  </div>
                  <div className="flex items-center bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                    <Shield className="h-5 w-5 text-accent-300 mr-2" />
                    <span className="text-white font-medium">Digital Receipts</span>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  {!isAuthenticated ? (
                    <>
                      <Link to="/register">
                        <Button variant="accent" size="lg" className="px-8 py-4 text-lg font-semibold shadow-2xl">
                          Get Started Free
                          <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                      </Link>
                      <Link to="/login">
                        <Button variant="outline" size="lg" className="px-8 py-4 text-lg font-semibold bg-white/20 border-white/30 text-white hover:bg-white/30">
                          Sign In
                        </Button>
                      </Link>
                    </>
                  ) : (
                    <Link to="/violations/search">
                      <Button variant="accent" size="lg" className="px-8 py-4 text-lg font-semibold shadow-2xl">
                        Search Violations
                        <Search className="ml-2 h-5 w-5" />
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-16 bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl mb-4 shadow-lg">
                  <stat.icon className="h-8 w-8 text-white" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.number}</div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-gradient-to-br from-green-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Why Choose Our
              <span className="gradient-text"> Platform?</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experience the most convenient and secure way to handle your traffic violations online.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="group">
                <div className="gradient-card p-8 h-full hover:shadow-2xl transition-all duration-300 group-hover:-translate-y-2">
                  <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Payment Methods Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Multiple Payment
              <span className="gradient-text"> Options</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Choose from a variety of secure payment methods that suit your preference.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {paymentMethods.map((method, index) => (
              <div key={index} className="group">
                <div className="glass-card p-6 text-center hover:shadow-xl transition-all duration-300 group-hover:-translate-y-1">
                  <div className={`w-12 h-12 ${method.color} rounded-xl mx-auto mb-4 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300`}>
                    <span className="text-white font-bold text-sm">{method.logo.charAt(0)}</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 text-sm">{method.name}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-gradient-to-r from-primary-600 to-primary-800">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-green-100 mb-10 max-w-2xl mx-auto">
            Join thousands of Las Piñas residents who have already simplified their traffic violation payments.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {!isAuthenticated ? (
              <>
                <Link to="/register">
                  <Button variant="accent" size="lg" className="px-8 py-4 text-lg font-semibold shadow-2xl">
                    Create Account
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/login">
                  <Button variant="outline" size="lg" className="px-8 py-4 text-lg font-semibold bg-white/20 border-white/30 text-white hover:bg-white/30">
                    Sign In
                  </Button>
                </Link>
              </>
            ) : (
              <Link to="/violations/search">
                <Button variant="accent" size="lg" className="px-8 py-4 text-lg font-semibold shadow-2xl">
                  Search Violations
                  <Search className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center mb-6">
              <div className="h-12 w-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">EV</span>
              </div>
              <span className="ml-3 text-2xl font-bold">E-VioPay</span>
            </div>
            <p className="text-gray-400 mb-6">
              Simplifying traffic violation payments for the City of Las Piñas
            </p>
            <div className="flex justify-center space-x-6 text-sm text-gray-400">
              <span>© 2024 Las Piñas City Government</span>
              <span>•</span>
              <span>All rights reserved</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;