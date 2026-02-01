import { Link } from 'react-router-dom'

function Cookies() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white heading-font mb-4">Cookie Policy</h1>
          <p className="text-gray-600 dark:text-gray-400">Last updated: February 1, 2026</p>
        </div>

        {/* Content */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 space-y-8">
          {/* Introduction */}
          <section>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">1. What Are Cookies?</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Cookies are small text files that are stored on your device when you visit a website. They are widely 
              used to make websites work more efficiently and provide information to the website owners. CUET ConnectX 
              uses localStorage (a similar technology) to enhance your experience on our platform.
            </p>
          </section>

          {/* How We Use Cookies */}
          <section>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">2. How We Use Local Storage</h2>
            <div className="space-y-4 text-gray-600 dark:text-gray-400">
              <p className="leading-relaxed">CUET ConnectX uses browser localStorage to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong className="text-gray-700 dark:text-gray-300">Remember Your Login:</strong> Keep you signed in between sessions</li>
                <li><strong className="text-gray-700 dark:text-gray-300">Store Profile Data:</strong> Save your profile information, images, and preferences</li>
                <li><strong className="text-gray-700 dark:text-gray-300">Theme Preferences:</strong> Remember your dark/light mode choice</li>
                <li><strong className="text-gray-700 dark:text-gray-300">Following/Followers:</strong> Track your connections within the platform</li>
                <li><strong className="text-gray-700 dark:text-gray-300">User Settings:</strong> Store your customization preferences</li>
              </ul>
            </div>
          </section>

          {/* Types of Data Stored */}
          <section>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">3. Types of Data Stored</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-4 py-3 rounded-tl-lg">Data Type</th>
                    <th className="px-4 py-3">Purpose</th>
                    <th className="px-4 py-3 rounded-tr-lg">Duration</th>
                  </tr>
                </thead>
                <tbody className="text-gray-600 dark:text-gray-400">
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <td className="px-4 py-3 font-medium">cuet_connectx_user</td>
                    <td className="px-4 py-3">Stores your login session</td>
                    <td className="px-4 py-3">Until logout</td>
                  </tr>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <td className="px-4 py-3 font-medium">profileData_[ID]</td>
                    <td className="px-4 py-3">Your profile information</td>
                    <td className="px-4 py-3">Persistent</td>
                  </tr>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <td className="px-4 py-3 font-medium">profileImage_[ID]</td>
                    <td className="px-4 py-3">Your profile picture</td>
                    <td className="px-4 py-3">Until deleted</td>
                  </tr>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <td className="px-4 py-3 font-medium">coverImage_[ID]</td>
                    <td className="px-4 py-3">Your cover photo</td>
                    <td className="px-4 py-3">Until deleted</td>
                  </tr>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <td className="px-4 py-3 font-medium">following_[ID]</td>
                    <td className="px-4 py-3">List of people you follow</td>
                    <td className="px-4 py-3">Persistent</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-medium">theme</td>
                    <td className="px-4 py-3">Dark/light mode preference</td>
                    <td className="px-4 py-3">Persistent</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Third-Party Services */}
          <section>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">4. Third-Party Services</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
              Our platform may use the following third-party services that may set their own cookies:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4 text-gray-600 dark:text-gray-400">
              <li><strong className="text-gray-700 dark:text-gray-300">Vercel:</strong> Our hosting provider may collect anonymous analytics</li>
              <li><strong className="text-gray-700 dark:text-gray-300">Font Awesome:</strong> For icons (loaded from CDN)</li>
              <li><strong className="text-gray-700 dark:text-gray-300">Google Fonts:</strong> For typography (Poppins, Playfair Display)</li>
            </ul>
          </section>

          {/* Managing Your Data */}
          <section>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">5. Managing Your Data</h2>
            <div className="space-y-4 text-gray-600 dark:text-gray-400">
              <p className="leading-relaxed">You have full control over the data stored by CUET ConnectX:</p>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-teal-100 dark:bg-teal-900/50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <i className="fas fa-user-cog text-teal-600 dark:text-teal-400 text-sm"></i>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700 dark:text-gray-300">Update Profile</p>
                    <p className="text-sm">Edit your profile data anytime from your Profile page</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-teal-100 dark:bg-teal-900/50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <i className="fas fa-trash text-teal-600 dark:text-teal-400 text-sm"></i>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700 dark:text-gray-300">Delete Images</p>
                    <p className="text-sm">Remove profile or cover images from the Edit options</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-teal-100 dark:bg-teal-900/50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <i className="fas fa-broom text-teal-600 dark:text-teal-400 text-sm"></i>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700 dark:text-gray-300">Clear All Data</p>
                    <p className="text-sm">Clear your browser's localStorage to remove all CUET ConnectX data</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* How to Clear Data */}
          <section>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">6. How to Clear Browser Data</h2>
            <div className="space-y-4 text-gray-600 dark:text-gray-400">
              <p className="leading-relaxed">To clear localStorage data in your browser:</p>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 space-y-2">
                <p><strong className="text-gray-700 dark:text-gray-300">Chrome:</strong> Settings → Privacy and Security → Clear browsing data → Cookies and site data</p>
                <p><strong className="text-gray-700 dark:text-gray-300">Firefox:</strong> Settings → Privacy & Security → Cookies and Site Data → Clear Data</p>
                <p><strong className="text-gray-700 dark:text-gray-300">Safari:</strong> Preferences → Privacy → Manage Website Data → Remove All</p>
                <p><strong className="text-gray-700 dark:text-gray-300">Edge:</strong> Settings → Privacy → Clear browsing data → Cookies and site data</p>
              </div>
              <p className="text-sm text-amber-600 dark:text-amber-400">
                <i className="fas fa-exclamation-triangle mr-2"></i>
                Note: Clearing data will log you out and remove all your saved profile information.
              </p>
            </div>
          </section>

          {/* Updates */}
          <section>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">7. Updates to This Policy</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              We may update this Cookie Policy from time to time to reflect changes in our practices or for legal, 
              operational, or regulatory reasons. We encourage you to review this page periodically for the latest 
              information on our cookie practices.
            </p>
          </section>

          {/* Contact */}
          <section>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">8. Contact Us</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              If you have any questions about our use of cookies or localStorage, please contact us:
            </p>
            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
              <p className="text-gray-700 dark:text-gray-300"><strong>Email:</strong> privacy@cuetconnectx.com</p>
              <p className="text-gray-700 dark:text-gray-300"><strong>Address:</strong> Chittagong University of Engineering & Technology, Chittagong-4349, Bangladesh</p>
            </div>
          </section>

          {/* Back Button */}
          <div className="pt-6 border-t border-gray-200 dark:border-gray-700 flex flex-wrap gap-4">
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
            <Link 
              to="/terms" 
              className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-teal-600 dark:hover:text-teal-400"
            >
              <i className="fas fa-file-contract"></i>
              Terms & Conditions
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Cookies
