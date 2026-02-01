import { Link } from 'react-router-dom'

function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white heading-font mb-4">Privacy Policy</h1>
          <p className="text-gray-600 dark:text-gray-400">Last updated: February 1, 2026</p>
        </div>

        {/* Content */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 space-y-8">
          {/* Introduction */}
          <section>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">1. Introduction</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Welcome to CUET ConnectX. We respect your privacy and are committed to protecting your personal data. 
              This privacy policy explains how we collect, use, and safeguard your information when you use our platform.
            </p>
          </section>

          {/* Information We Collect */}
          <section>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">2. Information We Collect</h2>
            <div className="space-y-4 text-gray-600 dark:text-gray-400">
              <p className="leading-relaxed">We collect the following types of information:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong className="text-gray-700 dark:text-gray-300">Account Information:</strong> Full name, student ID, email address, and password when you register.</li>
                <li><strong className="text-gray-700 dark:text-gray-300">Profile Information:</strong> Profile picture, cover photo, bio, education details, skills, and professional experience you choose to share.</li>
                <li><strong className="text-gray-700 dark:text-gray-300">Usage Data:</strong> Information about how you interact with our platform, including pages visited and features used.</li>
                <li><strong className="text-gray-700 dark:text-gray-300">Device Information:</strong> Browser type, device type, and IP address for security and analytics purposes.</li>
              </ul>
            </div>
          </section>

          {/* How We Use Your Information */}
          <section>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">3. How We Use Your Information</h2>
            <div className="space-y-4 text-gray-600 dark:text-gray-400">
              <p className="leading-relaxed">We use your information to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Create and manage your account</li>
                <li>Connect you with other CUET students and alumni</li>
                <li>Display relevant job opportunities and scholarships</li>
                <li>Send important notifications about your account</li>
                <li>Improve our platform and user experience</li>
                <li>Ensure platform security and prevent fraud</li>
              </ul>
            </div>
          </section>

          {/* Data Storage */}
          <section>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">4. Data Storage</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Your data is stored locally in your browser using localStorage for this demo version. 
              In a production environment, data would be stored on secure servers with encryption at rest and in transit. 
              We retain your data for as long as your account is active or as needed to provide services.
            </p>
          </section>

          {/* Data Sharing */}
          <section>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">5. Data Sharing</h2>
            <div className="space-y-4 text-gray-600 dark:text-gray-400">
              <p className="leading-relaxed">We do not sell your personal information. We may share your data with:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong className="text-gray-700 dark:text-gray-300">Other Users:</strong> Profile information you choose to make public is visible to other CUET ConnectX members.</li>
                <li><strong className="text-gray-700 dark:text-gray-300">Service Providers:</strong> Third-party services that help us operate the platform (hosting, analytics).</li>
                <li><strong className="text-gray-700 dark:text-gray-300">Legal Requirements:</strong> When required by law or to protect our rights and safety.</li>
              </ul>
            </div>
          </section>

          {/* Your Rights */}
          <section>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">6. Your Rights</h2>
            <div className="space-y-4 text-gray-600 dark:text-gray-400">
              <p className="leading-relaxed">You have the right to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Access and download your personal data</li>
                <li>Update or correct your information</li>
                <li>Delete your account and associated data</li>
                <li>Opt out of non-essential communications</li>
                <li>Request information about how your data is used</li>
              </ul>
            </div>
          </section>

          {/* Cookies */}
          <section>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">7. Cookies & Local Storage</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              We use localStorage to save your preferences, login session, and profile data locally in your browser. 
              This allows the platform to remember your settings and provide a seamless experience. 
              You can clear this data at any time through your browser settings.
            </p>
          </section>

          {/* Security */}
          <section>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">8. Security</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              We implement appropriate security measures to protect your personal information. 
              However, no method of transmission over the Internet is 100% secure. 
              We encourage you to use strong passwords and keep your login credentials confidential.
            </p>
          </section>

          {/* Changes to Policy */}
          <section>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">9. Changes to This Policy</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              We may update this privacy policy from time to time. We will notify you of any significant changes 
              by posting a notice on our platform. Your continued use of CUET ConnectX after changes are posted 
              constitutes your acceptance of the updated policy.
            </p>
          </section>

          {/* Contact */}
          <section>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">10. Contact Us</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              If you have any questions about this privacy policy or our data practices, please contact us at:
            </p>
            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
              <p className="text-gray-700 dark:text-gray-300"><strong>Email:</strong> privacy@cuetconnectx.com</p>
              <p className="text-gray-700 dark:text-gray-300"><strong>Address:</strong> Chittagong University of Engineering & Technology, Chittagong-4349, Bangladesh</p>
            </div>
          </section>

          {/* Back Button */}
          <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
            <Link 
              to="/" 
              className="inline-flex items-center gap-2 text-teal-600 dark:text-teal-400 hover:underline"
            >
              <i className="fas fa-arrow-left"></i>
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PrivacyPolicy
