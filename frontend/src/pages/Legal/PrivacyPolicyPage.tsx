import React, { useEffect } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { Shield, ArrowLeft, Lock, Eye, Database, CheckCircle } from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "../../components/UI/Card"
import Button from "../../components/UI/Button"

const PrivacyPolicyPage: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const fromRegister = location.state?.from === "register"

  // * Mark privacy policy as read when page is loaded
  useEffect(() => {
    localStorage.setItem("privacy_read", "true")
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
            <div className="p-3 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl shadow-lg">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-gradient-premium">
                Privacy Policy
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
                Las Piñas City ("we," "our," or "us") is committed to protecting your privacy. This Privacy 
                Policy explains how we collect, use, disclose, and safeguard your information when you use 
                the E-VioPay Traffic Management System ("Service"). Please read this Privacy Policy carefully.
              </p>
              <p className="text-gray-700 leading-relaxed mt-3">
                By using our Service, you consent to the data practices described in this Privacy Policy. 
                If you do not agree with the practices described in this policy, you should not use the Service.
              </p>
            </section>

            {/* Information We Collect */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Database className="h-6 w-6 text-primary-600" />
                2. Information We Collect
              </h2>
              <div className="space-y-4 text-gray-700">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">2.1 Personal Information</h3>
                  <p className="leading-relaxed mb-2">
                    We collect personal information that you provide directly to us, including:
                  </p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>Full name (first name, last name, middle name)</li>
                    <li>Email address</li>
                    <li>Phone number</li>
                    <li>Date of birth</li>
                    <li>Home address</li>
                    <li>Driver's license number</li>
                    <li>Vehicle plate number</li>
                    <li>Payment information (processed securely through third-party payment processors)</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">2.2 Traffic Violation Information</h3>
                  <p className="leading-relaxed mb-2">
                    We collect and maintain information related to traffic violations, including:
                  </p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>OVR (Ordinance Violation Receipt) numbers</li>
                    <li>Citation numbers</li>
                    <li>Violation types and descriptions</li>
                    <li>Violation dates, times, and locations</li>
                    <li>Fine amounts and payment status</li>
                    <li>Vehicle information (type, make, model, color, year)</li>
                    <li>Enforcer information</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">2.3 Automatically Collected Information</h3>
                  <p className="leading-relaxed mb-2">
                    When you use our Service, we automatically collect certain information, including:
                  </p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>IP address</li>
                    <li>Browser type and version</li>
                    <li>Device information (type, operating system)</li>
                    <li>Usage data (pages visited, time spent, actions taken)</li>
                    <li>Cookies and similar tracking technologies</li>
                    <li>Log files and analytics data</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* How We Use Information */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Eye className="h-6 w-6 text-primary-600" />
                3. How We Use Your Information
              </h2>
              <div className="space-y-3 text-gray-700">
                <p className="leading-relaxed">
                  We use the information we collect for the following purposes:
                </p>
                <ul className="list-disc list-inside ml-4 space-y-2">
                  <li>
                    <strong>Service Provision:</strong> To provide, maintain, and improve our Service, 
                    including processing payments, managing violations, and facilitating disputes.
                  </li>
                  <li>
                    <strong>Account Management:</strong> To create and manage your account, authenticate 
                    your identity, and provide customer support.
                  </li>
                  <li>
                    <strong>Communication:</strong> To send you notifications, updates, receipts, and 
                    important information about your violations and payments.
                  </li>
                  <li>
                    <strong>Legal Compliance:</strong> To comply with legal obligations, enforce our Terms 
                    of Service, and respond to legal requests.
                  </li>
                  <li>
                    <strong>Security:</strong> To detect, prevent, and address fraud, security issues, and 
                    technical problems.
                  </li>
                  <li>
                    <strong>Analytics:</strong> To analyze usage patterns, improve our Service, and generate 
                    reports for administrative purposes.
                  </li>
                  <li>
                    <strong>Enforcement:</strong> To support traffic law enforcement activities and maintain 
                    public safety records.
                  </li>
                </ul>
              </div>
            </section>

            {/* Information Sharing */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">4. Information Sharing and Disclosure</h2>
              <div className="space-y-3 text-gray-700">
                <p className="leading-relaxed">
                  We do not sell your personal information. We may share your information in the following 
                  circumstances:
                </p>
                <div className="space-y-3">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">4.1 Government Agencies</h3>
                    <p className="leading-relaxed">
                      We may share information with other government agencies, law enforcement, and judicial 
                      bodies as required by law or for legitimate government purposes.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">4.2 Service Providers</h3>
                    <p className="leading-relaxed">
                      We may share information with third-party service providers who perform services on our 
                      behalf, such as payment processors, hosting providers, and analytics services. These 
                      providers are contractually obligated to protect your information.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">4.3 Legal Requirements</h3>
                    <p className="leading-relaxed">
                      We may disclose information if required by law, court order, or government regulation, 
                      or if we believe disclosure is necessary to protect our rights, property, or safety, or 
                      that of others.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">4.4 With Your Consent</h3>
                    <p className="leading-relaxed">
                      We may share information with your explicit consent or at your direction.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Data Security */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Lock className="h-6 w-6 text-primary-600" />
                5. Data Security
              </h2>
              <div className="space-y-3 text-gray-700">
                <p className="leading-relaxed">
                  We implement appropriate technical and organizational security measures to protect your 
                  personal information against unauthorized access, alteration, disclosure, or destruction. 
                  These measures include:
                </p>
                <ul className="list-disc list-inside ml-4 space-y-2">
                  <li>Encryption of data in transit (SSL/TLS) and at rest</li>
                  <li>Secure authentication and access controls</li>
                  <li>Regular security assessments and updates</li>
                  <li>Employee training on data protection</li>
                  <li>Incident response procedures</li>
                </ul>
                <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mt-4 rounded-r-lg">
                  <p className="text-sm text-yellow-800">
                    <strong>Important:</strong> While we strive to protect your information, no method of 
                    transmission over the Internet or electronic storage is 100% secure. We cannot guarantee 
                    absolute security.
                  </p>
                </div>
              </div>
            </section>

            {/* Your Rights */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                <CheckCircle className="h-6 w-6 text-primary-600" />
                6. Your Privacy Rights
              </h2>
              <div className="space-y-3 text-gray-700">
                <p className="leading-relaxed">
                  Under the Data Privacy Act of 2012 (Republic Act No. 10173), you have certain rights 
                  regarding your personal information:
                </p>
                <ul className="list-disc list-inside ml-4 space-y-2">
                  <li>
                    <strong>Right to Access:</strong> You may request access to your personal information 
                    that we hold.
                  </li>
                  <li>
                    <strong>Right to Correction:</strong> You may request correction of inaccurate or 
                    incomplete information.
                  </li>
                  <li>
                    <strong>Right to Object:</strong> You may object to certain processing of your 
                    information, subject to legal limitations.
                  </li>
                  <li>
                    <strong>Right to Erasure:</strong> You may request deletion of your information, 
                    subject to legal and operational requirements.
                  </li>
                  <li>
                    <strong>Right to Data Portability:</strong> You may request a copy of your data in 
                    a structured, machine-readable format.
                  </li>
                  <li>
                    <strong>Right to File a Complaint:</strong> You may file a complaint with the National 
                    Privacy Commission if you believe your privacy rights have been violated.
                  </li>
                </ul>
                <p className="leading-relaxed mt-3">
                  To exercise these rights, please contact us using the information provided in Section 10 
                  (Contact Information).
                </p>
              </div>
            </section>

            {/* Cookies and Tracking */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">7. Cookies and Tracking Technologies</h2>
              <div className="space-y-3 text-gray-700">
                <p className="leading-relaxed">
                  We use cookies and similar tracking technologies to enhance your experience, analyze usage, 
                  and improve our Service. Cookies are small text files stored on your device.
                </p>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Types of Cookies We Use:</h3>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>
                      <strong>Essential Cookies:</strong> Required for the Service to function properly 
                      (e.g., authentication, session management)
                    </li>
                    <li>
                      <strong>Analytics Cookies:</strong> Help us understand how users interact with our 
                      Service
                    </li>
                    <li>
                      <strong>Preference Cookies:</strong> Remember your settings and preferences
                    </li>
                  </ul>
                </div>
                <p className="leading-relaxed mt-3">
                  You can control cookies through your browser settings. However, disabling certain cookies 
                  may affect the functionality of the Service.
                </p>
              </div>
            </section>

            {/* Data Retention */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">8. Data Retention</h2>
              <p className="text-gray-700 leading-relaxed">
                We retain your personal information for as long as necessary to fulfill the purposes outlined 
                in this Privacy Policy, unless a longer retention period is required or permitted by law. 
                Traffic violation records may be retained for extended periods as required by government 
                regulations and for historical record-keeping purposes.
              </p>
            </section>

            {/* Children's Privacy */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">9. Children's Privacy</h2>
              <p className="text-gray-700 leading-relaxed">
                Our Service is not intended for individuals under the age of 18. We do not knowingly collect 
                personal information from children. If you believe we have collected information from a child, 
                please contact us immediately, and we will take steps to delete such information.
              </p>
            </section>

            {/* Third-Party Links */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">10. Third-Party Links</h2>
              <p className="text-gray-700 leading-relaxed">
                Our Service may contain links to third-party websites or services. We are not responsible for 
                the privacy practices of these third parties. We encourage you to review their privacy policies 
                before providing any information.
              </p>
            </section>

            {/* Changes to Privacy Policy */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">11. Changes to This Privacy Policy</h2>
              <p className="text-gray-700 leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of any material changes 
                by posting the new Privacy Policy on this page and updating the "Last updated" date. We encourage 
                you to review this Privacy Policy periodically.
              </p>
            </section>

            {/* Contact Information */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">12. Contact Information</h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                If you have questions, concerns, or requests regarding this Privacy Policy or our data practices, 
                please contact us:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700">
                  <strong>Data Protection Officer</strong>
                  <br />
                  Las Piñas City Traffic Management Office
                  <br />
                  Email: privacy@laspinascity.gov.ph
                  <br />
                  Phone: (02) 8XXX-XXXX
                  <br />
                  Address: Las Piñas City Hall, Las Piñas City, Metro Manila, Philippines
                </p>
              </div>
              <p className="text-gray-700 leading-relaxed mt-3">
                You may also file a complaint with the{" "}
                <a 
                  href="https://www.privacy.gov.ph" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary-600 hover:text-primary-700 font-semibold underline"
                >
                  National Privacy Commission
                </a>{" "}
                if you believe your privacy rights have been violated.
              </p>
            </section>

            {/* Acknowledgment */}
            <section className="bg-primary-50 border-l-4 border-primary-500 p-4 rounded-r-lg">
              <p className="text-sm text-gray-800">
                <strong>By using E-VioPay, you acknowledge that you have read and understood this Privacy 
                Policy and consent to the collection, use, and disclosure of your information as described 
                herein.</strong>
              </p>
            </section>
          </CardContent>
        </Card>

        {/* Footer Navigation */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <Link 
            to="/terms" 
            state={{ from: fromRegister ? "register" : "home" }}
            className="text-primary-600 hover:text-primary-700 font-semibold"
          >
            View Terms of Service →
          </Link>
          <Button variant="primary" size="sm" onClick={handleBack}>
            {fromRegister ? "Return to Registration" : "Return to Home"}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default PrivacyPolicyPage

