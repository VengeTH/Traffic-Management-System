import React, { useEffect } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { FileText, ArrowLeft, Shield, AlertTriangle, CheckCircle } from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "../../components/UI/Card"
import Button from "../../components/UI/Button"

const TermsOfServicePage: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const fromRegister = location.state?.from === "register"

  // * Mark terms as read when page is loaded
  useEffect(() => {
    localStorage.setItem("terms_read", "true")
  }, [])

  const handleBack = () => {
    if (fromRegister) {
      navigate("/register", { replace: true })
    } else {
      navigate("/", { replace: true })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button variant="outline" size="sm" className="mb-4" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {fromRegister ? "Back to Registration" : "Back to Home"}
          </Button>
          <div className="flex items-center gap-3 mb-4">
            <div className="h-12 w-12 flex items-center justify-center flex-shrink-0 bg-white rounded-lg p-1">
              <img
                src={`${process.env.PUBLIC_URL || ""}/logo.jpg`}
                alt="Las Piñas City Logo"
                className="h-full w-full object-contain"
              />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-gradient-premium">
                Terms of Service
              </h1>
              <p className="text-gray-600 mt-1">Last updated: {new Date().toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <Card className="lux-card animated-gradient-border premium-glow">
          <CardHeader className="bg-gradient-to-r from-primary-50/50 to-white border-b border-gray-100">
            <CardTitle className="text-xl font-bold text-gradient-premium">
              E-VioPay Traffic Management System
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {/* Introduction */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Shield className="h-6 w-6 text-primary-600" />
                1. Introduction
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Welcome to E-VioPay, the official online traffic violation payment system for Las Piñas City. 
                These Terms of Service ("Terms") govern your access to and use of our website, services, and 
                applications (collectively, the "Service") operated by the Las Piñas City Traffic Management Office.
              </p>
              <p className="text-gray-700 leading-relaxed mt-3">
                By accessing or using our Service, you agree to be bound by these Terms. If you disagree with 
                any part of these Terms, you may not access the Service.
              </p>
            </section>

            {/* Acceptance of Terms */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                <CheckCircle className="h-6 w-6 text-primary-600" />
                2. Acceptance of Terms
              </h2>
              <p className="text-gray-700 leading-relaxed">
                By creating an account, accessing, or using the Service, you acknowledge that you have read, 
                understood, and agree to be bound by these Terms and our Privacy Policy. If you do not agree 
                to these Terms, you must not use the Service.
              </p>
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mt-4 rounded-r-lg">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> These Terms constitute a legally binding agreement between you and 
                  Las Piñas City. Please read them carefully.
                </p>
              </div>
            </section>

            {/* Account Registration */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">3. Account Registration</h2>
              <div className="space-y-3 text-gray-700">
                <p className="leading-relaxed">
                  <strong>3.1 Eligibility:</strong> You must be at least 18 years old and have the legal 
                  capacity to enter into contracts to use this Service. By registering, you represent and 
                  warrant that you meet these requirements.
                </p>
                <p className="leading-relaxed">
                  <strong>3.2 Account Information:</strong> You agree to provide accurate, current, and 
                  complete information during registration and to update such information to keep it accurate, 
                  current, and complete.
                </p>
                <p className="leading-relaxed">
                  <strong>3.3 Account Security:</strong> You are responsible for maintaining the confidentiality 
                  of your account credentials and for all activities that occur under your account. You must 
                  immediately notify us of any unauthorized use of your account.
                </p>
                <p className="leading-relaxed">
                  <strong>3.4 Account Types:</strong> The Service supports different account types including 
                  regular users, traffic enforcers, and administrators. Your account type determines your 
                  access level and available features.
                </p>
              </div>
            </section>

            {/* Use of Service */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">4. Use of Service</h2>
              <div className="space-y-3 text-gray-700">
                <p className="leading-relaxed">
                  <strong>4.1 Permitted Use:</strong> You may use the Service to:
                </p>
                <ul className="list-disc list-inside ml-4 space-y-2">
                  <li>Search and view your traffic violations</li>
                  <li>Pay traffic violation fines online</li>
                  <li>View payment history and receipts</li>
                  <li>Submit disputes for violations (if applicable)</li>
                  <li>Access violation-related information and documents</li>
                </ul>
                <p className="leading-relaxed mt-4">
                  <strong>4.2 Prohibited Activities:</strong> You agree not to:
                </p>
                <ul className="list-disc list-inside ml-4 space-y-2">
                  <li>Use the Service for any illegal or unauthorized purpose</li>
                  <li>Attempt to gain unauthorized access to any part of the Service</li>
                  <li>Interfere with or disrupt the Service or servers connected to the Service</li>
                  <li>Use automated systems (bots, scrapers) to access the Service without permission</li>
                  <li>Impersonate any person or entity or falsely state your affiliation with any person or entity</li>
                  <li>Transmit any viruses, malware, or other harmful code</li>
                  <li>Violate any applicable local, national, or international law or regulation</li>
                </ul>
              </div>
            </section>

            {/* Traffic Violations */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">5. Traffic Violations and Payments</h2>
              <div className="space-y-3 text-gray-700">
                <p className="leading-relaxed">
                  <strong>5.1 Violation Records:</strong> All traffic violation records are official and 
                  maintained by Las Piñas City. The Service provides access to view and pay these violations 
                  but does not create or modify violation records.
                </p>
                <p className="leading-relaxed">
                  <strong>5.2 Payment Obligations:</strong> You are responsible for paying all fines and 
                  penalties associated with your traffic violations. Payment through the Service constitutes 
                  your agreement to pay the specified amount.
                </p>
                <p className="leading-relaxed">
                  <strong>5.3 Payment Methods:</strong> We accept various payment methods including credit cards, 
                  debit cards, e-wallets (GCash, Maya), and other approved payment gateways. All payments are 
                  processed securely through third-party payment processors.
                </p>
                <p className="leading-relaxed">
                  <strong>5.4 Payment Processing:</strong> Payments are processed immediately upon confirmation. 
                  Once processed, payments are final and non-refundable except as required by law or as determined 
                  by Las Piñas City.
                </p>
                <p className="leading-relaxed">
                  <strong>5.5 Late Fees and Penalties:</strong> Failure to pay violations by their due date may 
                  result in additional late fees, penalties, or other enforcement actions as permitted by law.
                </p>
              </div>
            </section>

            {/* Disputes */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">6. Disputes and Appeals</h2>
              <div className="space-y-3 text-gray-700">
                <p className="leading-relaxed">
                  <strong>6.1 Dispute Process:</strong> If you believe a violation was issued in error, you 
                  may submit a dispute through the Service. All disputes are subject to review by authorized 
                  personnel.
                </p>
                <p className="leading-relaxed">
                  <strong>6.2 Dispute Timeline:</strong> Disputes must be submitted within the timeframe 
                  specified by Las Piñas City regulations. Late submissions may not be considered.
                </p>
                <p className="leading-relaxed">
                  <strong>6.3 Dispute Resolution:</strong> The decision on disputes is final and binding, 
                  subject to any further appeals process available under applicable laws and regulations.
                </p>
                <p className="leading-relaxed">
                  <strong>6.4 Payment During Dispute:</strong> Submitting a dispute does not automatically 
                  suspend your payment obligation. You may be required to pay the fine pending resolution of 
                  your dispute.
                </p>
              </div>
            </section>

            {/* Privacy and Data */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">7. Privacy and Data Protection</h2>
              <p className="text-gray-700 leading-relaxed">
                Your use of the Service is also governed by our Privacy Policy. By using the Service, you 
                consent to the collection, use, and disclosure of your information as described in our Privacy 
                Policy. Please review our{" "}
                <Link to="/privacy" className="text-primary-600 hover:text-primary-700 font-semibold underline">
                  Privacy Policy
                </Link>{" "}
                for more information.
              </p>
            </section>

            {/* Intellectual Property */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">8. Intellectual Property</h2>
              <div className="space-y-3 text-gray-700">
                <p className="leading-relaxed">
                  <strong>8.1 Ownership:</strong> The Service, including all content, features, functionality, 
                  logos, and trademarks, is owned by Las Piñas City and is protected by copyright, trademark, 
                  and other intellectual property laws.
                </p>
                <p className="leading-relaxed">
                  <strong>8.2 Limited License:</strong> We grant you a limited, non-exclusive, non-transferable 
                  license to access and use the Service for its intended purpose. This license does not include 
                  any right to reproduce, distribute, modify, or create derivative works.
                </p>
              </div>
            </section>

            {/* Disclaimers */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                <AlertTriangle className="h-6 w-6 text-warning-600" />
                9. Disclaimers and Limitations
              </h2>
              <div className="space-y-3 text-gray-700">
                <p className="leading-relaxed">
                  <strong>9.1 Service Availability:</strong> We strive to maintain the Service's availability 
                  but do not guarantee uninterrupted or error-free operation. The Service may be temporarily 
                  unavailable due to maintenance, updates, or technical issues.
                </p>
                <p className="leading-relaxed">
                  <strong>9.2 Information Accuracy:</strong> While we make every effort to ensure the accuracy 
                  of information displayed on the Service, we do not warrant that all information is complete, 
                  accurate, or up-to-date at all times.
                </p>
                <p className="leading-relaxed">
                  <strong>9.3 Limitation of Liability:</strong> To the maximum extent permitted by law, Las 
                  Piñas City shall not be liable for any indirect, incidental, special, consequential, or 
                  punitive damages arising from your use of the Service.
                </p>
              </div>
            </section>

            {/* Modifications */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">10. Modifications to Terms</h2>
              <p className="text-gray-700 leading-relaxed">
                We reserve the right to modify these Terms at any time. We will notify users of material 
                changes by posting the updated Terms on the Service and updating the "Last updated" date. 
                Your continued use of the Service after such modifications constitutes acceptance of the 
                updated Terms.
              </p>
            </section>

            {/* Termination */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">11. Termination</h2>
              <div className="space-y-3 text-gray-700">
                <p className="leading-relaxed">
                  <strong>11.1 Termination by You:</strong> You may stop using the Service at any time by 
                  deactivating your account or ceasing to access the Service.
                </p>
                <p className="leading-relaxed">
                  <strong>11.2 Termination by Us:</strong> We reserve the right to suspend or terminate your 
                  access to the Service at any time, with or without cause or notice, for any reason including, 
                  but not limited to, violation of these Terms.
                </p>
                <p className="leading-relaxed">
                  <strong>11.3 Effect of Termination:</strong> Upon termination, your right to use the Service 
                  will immediately cease. All provisions of these Terms that by their nature should survive 
                  termination shall survive.
                </p>
              </div>
            </section>

            {/* Governing Law */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">12. Governing Law</h2>
              <p className="text-gray-700 leading-relaxed">
                These Terms shall be governed by and construed in accordance with the laws of the Republic of 
                the Philippines, without regard to its conflict of law provisions. Any disputes arising from 
                these Terms or the Service shall be subject to the exclusive jurisdiction of the courts of 
                Las Piñas City, Philippines.
              </p>
            </section>

            {/* Contact Information */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">13. Contact Information</h2>
              <p className="text-gray-700 leading-relaxed">
                If you have any questions about these Terms, please contact us:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg mt-3">
                <p className="text-gray-700">
                  <strong>Las Piñas City Traffic Management Office</strong>
                  <br />
                  Email: traffic@laspinascity.gov.ph
                  <br />
                  Phone: (02) 8398-5765
                  <br />
                  Address: Las Piñas City Hall, Las Piñas City, Metro Manila, Philippines
                </p>
              </div>
            </section>

            {/* Acknowledgment */}
            <section className="bg-primary-50 border-l-4 border-primary-500 p-4 rounded-r-lg">
              <p className="text-sm text-gray-800">
                <strong>By using E-VioPay, you acknowledge that you have read, understood, and agree to be 
                bound by these Terms of Service.</strong>
              </p>
            </section>
          </CardContent>
        </Card>

        {/* Footer Navigation */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <Link 
            to="/privacy" 
            state={{ from: fromRegister ? "register" : "home" }}
            className="text-primary-600 hover:text-primary-700 font-semibold"
          >
            View Privacy Policy →
          </Link>
          <Button variant="primary" size="sm" onClick={handleBack}>
            {fromRegister ? "Return to Registration" : "Return to Home"}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default TermsOfServicePage

