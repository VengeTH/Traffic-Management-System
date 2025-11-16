import React from "react"
import { Link } from "react-router-dom"
import { FileText, Shield, Mail, Phone, MapPin } from "lucide-react"

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 bg-gradient-to-br from-primary-600 to-primary-700 rounded-xl flex items-center justify-center">
                <span className="text-white font-black text-sm">EV</span>
              </div>
              <div>
                <h3 className="text-xl font-black text-white">E-VioPay</h3>
                <p className="text-xs text-gray-400">Las Piñas Online Traffic Payments</p>
              </div>
            </div>
            <p className="text-sm text-gray-400 mb-4">
              The official online traffic violation payment system for Las Piñas City. 
              Pay your traffic violations quickly and securely from anywhere.
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-gray-400">
                <MapPin className="h-4 w-4" />
                <span>Las Piñas City Hall, Metro Manila, Philippines</span>
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <Phone className="h-4 w-4" />
                <span>(02) 8XXX-XXXX</span>
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <Mail className="h-4 w-4" />
                <span>traffic@laspinascity.gov.ph</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/violations/search"
                  className="text-gray-400 hover:text-primary-400 transition-colors text-sm"
                >
                  Search Violations
                </Link>
              </li>
              <li>
                <Link
                  to="/dashboard"
                  className="text-gray-400 hover:text-primary-400 transition-colors text-sm"
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <Link
                  to="/payments"
                  className="text-gray-400 hover:text-primary-400 transition-colors text-sm"
                >
                  Payment History
                </Link>
              </li>
              <li>
                <Link
                  to="/profile"
                  className="text-gray-400 hover:text-primary-400 transition-colors text-sm"
                >
                  Profile
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-white font-semibold mb-4">Legal</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/terms"
                  className="text-gray-400 hover:text-primary-400 transition-colors text-sm flex items-center gap-2"
                >
                  <FileText className="h-4 w-4" />
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy"
                  className="text-gray-400 hover:text-primary-400 transition-colors text-sm flex items-center gap-2"
                >
                  <Shield className="h-4 w-4" />
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-400">
              © {new Date().getFullYear()} Las Piñas City. All rights reserved.
            </p>
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <span>Powered by E-VioPay</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer

