import { Link } from 'react-router-dom'

function Terms() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white heading-font mb-4">Terms & Conditions</h1>
          <p className="text-gray-600 dark:text-gray-400">Last updated: February 1, 2026</p>
        </div>

        {/* Content */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 space-y-8">
          {/* Introduction */}
          <section>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              By accessing and using CUET ConnectX, you accept and agree to be bound by these Terms and Conditions. 
              If you do not agree to these terms, please do not use our platform. These terms apply to all visitors, 
              users, and others who access or use the service.
            </p>
          </section>

          {/* Eligibility */}
          <section>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">2. Eligibility</h2>
            <div className="space-y-4 text-gray-600 dark:text-gray-400">
              <p className="leading-relaxed">To use CUET ConnectX, you must:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Be a current student, alumnus, or faculty member of Chittagong University of Engineering & Technology (CUET)</li>
                <li>Have a valid CUET Student ID</li>
                <li>Be at least 16 years of age</li>
                <li>Provide accurate and complete registration information</li>
                <li>Maintain the security of your account credentials</li>
              </ul>
            </div>
          </section>

          {/* User Account */}
          <section>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">3. User Account</h2>
            <div className="space-y-4 text-gray-600 dark:text-gray-400">
              <p className="leading-relaxed">When you create an account with us, you agree to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Provide accurate, current, and complete information during registration</li>
                <li>Maintain and promptly update your account information</li>
                <li>Keep your password secure and confidential</li>
                <li>Accept responsibility for all activities that occur under your account</li>
                <li>Notify us immediately of any unauthorized use of your account</li>
              </ul>
            </div>
          </section>

          {/* Acceptable Use */}
          <section>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">4. Acceptable Use</h2>
            <div className="space-y-4 text-gray-600 dark:text-gray-400">
              <p className="leading-relaxed">You agree NOT to use CUET ConnectX to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Post false, misleading, or fraudulent content</li>
                <li>Harass, bully, or intimidate other users</li>
                <li>Share spam, malware, or malicious content</li>
                <li>Impersonate others or misrepresent your affiliation with CUET</li>
                <li>Violate any applicable laws or regulations</li>
                <li>Collect or harvest user data without consent</li>
                <li>Interfere with the platform's security or functionality</li>
                <li>Post content that is offensive, discriminatory, or inappropriate</li>
              </ul>
            </div>
          </section>

          {/* Content */}
          <section>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">5. User Content</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
              You retain ownership of content you post on CUET ConnectX. However, by posting content, you grant us 
              a non-exclusive, worldwide, royalty-free license to use, display, and distribute your content within 
              the platform for the purpose of operating and improving our services.
            </p>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              You are solely responsible for the content you post and must ensure it does not violate any 
              third-party rights or applicable laws.
            </p>
          </section>

          {/* Job Postings & Scholarships */}
          <section>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">6. Job Postings & Scholarships</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              CUET ConnectX provides job and scholarship listings as a service to our community. We do not guarantee 
              the accuracy, completeness, or legitimacy of any posting. Users should conduct their own due diligence 
              before applying or accepting any opportunity. We are not responsible for any outcomes resulting from 
              interactions with employers or scholarship providers.
            </p>
          </section>

          {/* Intellectual Property */}
          <section>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">7. Intellectual Property</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              The CUET ConnectX platform, including its design, logos, features, and content (excluding user-generated 
              content), is owned by CUET ConnectX and protected by intellectual property laws. You may not copy, modify, 
              distribute, or create derivative works without our prior written consent.
            </p>
          </section>

          {/* Termination */}
          <section>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">8. Termination</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              We reserve the right to suspend or terminate your account at any time, with or without notice, for 
              violations of these terms or for any other reason. Upon termination, your right to use the platform 
              will immediately cease. You may also delete your account at any time through your profile settings.
            </p>
          </section>

          {/* Disclaimer */}
          <section>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">9. Disclaimer of Warranties</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              CUET ConnectX is provided "as is" and "as available" without warranties of any kind, either express 
              or implied. We do not guarantee that the platform will be uninterrupted, secure, or error-free. 
              Use of the platform is at your own risk.
            </p>
          </section>

          {/* Limitation of Liability */}
          <section>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">10. Limitation of Liability</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              To the maximum extent permitted by law, CUET ConnectX shall not be liable for any indirect, incidental, 
              special, consequential, or punitive damages arising out of or related to your use of the platform, 
              including but not limited to loss of data, loss of opportunities, or any other damages.
            </p>
          </section>

          {/* Changes to Terms */}
          <section>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">11. Changes to Terms</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              We may modify these Terms and Conditions at any time. We will notify users of significant changes 
              by posting a notice on the platform. Your continued use of CUET ConnectX after changes are posted 
              constitutes your acceptance of the modified terms.
            </p>
          </section>

          {/* Governing Law */}
          <section>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">12. Governing Law</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              These Terms and Conditions shall be governed by and construed in accordance with the laws of Bangladesh. 
              Any disputes arising under these terms shall be subject to the exclusive jurisdiction of the courts 
              located in Chittagong, Bangladesh.
            </p>
          </section>

          {/* Contact */}
          <section>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">13. Contact Us</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              If you have any questions about these Terms and Conditions, please contact us at:
            </p>
            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
              <p className="text-gray-700 dark:text-gray-300"><strong>Email:</strong> legal@cuetconnectx.com</p>
              <p className="text-gray-700 dark:text-gray-300"><strong>Address:</strong> Chittagong University of Engineering & Technology, Chittagong-4349, Bangladesh</p>
            </div>
          </section>

          {/* Back Button */}
          <div className="pt-6 border-t border-gray-200 dark:border-gray-700 flex gap-4">
            <Link 
              to="/" 
              className="inline-flex items-center gap-2 text-teal-600 dark:text-teal-400 hover:underline"
            >
              <i className="fas fa-arrow-left"></i>
              Back to Home
            </Link>
            <Link 
              to="/privacy" 
              className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-teal-600 dark:hover:text-teal-400"
            >
              <i className="fas fa-shield-alt"></i>
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Terms
