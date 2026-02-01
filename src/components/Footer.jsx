import { Link } from 'react-router-dom'
import cuetLogo from '../assets/logos/CUET_Vector_Logo.svg.png'

function Footer() {
  const currentYear = new Date().getFullYear()
  
  return (
    <footer className="bg-gradient-to-b from-gray-900 to-gray-950 text-white">
      {/* Top decorative border */}
      <div className="h-1 bg-gradient-to-r from-teal-600 via-teal-400 to-teal-600"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-6">
              <img src={cuetLogo} alt="CUET Logo" className="h-14 w-14 object-contain bg-white/10 rounded-xl p-1.5" />
              <div>
                <h3 className="text-xl font-bold heading-font">CUET ConnectX</h3>
                <p className="text-xs text-teal-400 uppercase tracking-wider">Alumni Network</p>
              </div>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              Connecting CUETians worldwide. Building bridges, creating opportunities, and fostering lifelong professional relationships.
            </p>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <i className="fas fa-shield-alt text-teal-500"></i>
              <span>Trusted by 10,000+ members</span>
            </div>
          </div>

          {/* Explore */}
          <div>
            <h4 className="font-semibold text-white mb-6 flex items-center gap-2">
              <span className="w-8 h-0.5 bg-teal-500"></span>
              Explore
            </h4>
            <ul className="space-y-3 text-sm">
              <li><Link to="/jobs" className="text-gray-400 hover:text-teal-400 transition-colors flex items-center gap-2"><i className="fas fa-chevron-right text-xs text-teal-600"></i> Job Opportunities</Link></li>
              <li><Link to="/scholarships" className="text-gray-400 hover:text-teal-400 transition-colors flex items-center gap-2"><i className="fas fa-chevron-right text-xs text-teal-600"></i> Scholarships</Link></li>
              <li><Link to="/community" className="text-gray-400 hover:text-teal-400 transition-colors flex items-center gap-2"><i className="fas fa-chevron-right text-xs text-teal-600"></i> Community Forum</Link></li>
              <li><Link to="/" className="text-gray-400 hover:text-teal-400 transition-colors flex items-center gap-2"><i className="fas fa-chevron-right text-xs text-teal-600"></i> Events & Meetups</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold text-white mb-6 flex items-center gap-2">
              <span className="w-8 h-0.5 bg-teal-500"></span>
              Support
            </h4>
            <ul className="space-y-3 text-sm">
              <li><Link to="/faq" className="text-gray-400 hover:text-teal-400 transition-colors flex items-center gap-2"><i className="fas fa-chevron-right text-xs text-teal-600"></i> FAQs</Link></li>
              <li><Link to="/about" className="text-gray-400 hover:text-teal-400 transition-colors flex items-center gap-2"><i className="fas fa-chevron-right text-xs text-teal-600"></i> About Us</Link></li>
              <li><Link to="/terms" className="text-gray-400 hover:text-teal-400 transition-colors flex items-center gap-2"><i className="fas fa-chevron-right text-xs text-teal-600"></i> Terms & Conditions</Link></li>
              <li><Link to="/privacy" className="text-gray-400 hover:text-teal-400 transition-colors flex items-center gap-2"><i className="fas fa-chevron-right text-xs text-teal-600"></i> Privacy Policy</Link></li>
            </ul>
          </div>

          {/* Social & Contact */}
          <div>
            <h4 className="font-semibold text-white mb-6 flex items-center gap-2">
              <span className="w-8 h-0.5 bg-teal-500"></span>
              Connect With Us
            </h4>
            <div className="flex gap-3 mb-6">
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-xl flex items-center justify-center hover:bg-teal-600 transition-all duration-200 hover:scale-110" aria-label="Facebook">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-xl flex items-center justify-center hover:bg-teal-600 transition-all duration-200 hover:scale-110" aria-label="Twitter">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-xl flex items-center justify-center hover:bg-teal-600 transition-all duration-200 hover:scale-110" aria-label="LinkedIn">
                <i className="fab fa-linkedin-in"></i>
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-xl flex items-center justify-center hover:bg-teal-600 transition-all duration-200 hover:scale-110" aria-label="Instagram">
                <i className="fab fa-instagram"></i>
              </a>
            </div>
            <div className="space-y-2 text-sm text-gray-400">
              <a href="mailto:support@cuetconnectx.com" className="flex items-center gap-2 hover:text-teal-400 transition-colors"><i className="fas fa-envelope text-teal-500"></i> Contact Support</a>
              <p className="flex items-center gap-2"><i className="fas fa-map-marker-alt text-teal-500"></i> CUET, Chittagong, Bangladesh</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Bottom bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-500">
              &copy; {currentYear} CUET ConnectX. All rights reserved. Made with <i className="fas fa-heart text-red-500"></i> for CUETians
            </p>
            <div className="flex items-center gap-6 text-sm text-gray-500">
              <Link to="/terms" className="hover:text-teal-400 transition-colors">Terms</Link>
              <Link to="/privacy" className="hover:text-teal-400 transition-colors">Privacy</Link>
              <Link to="/cookies" className="hover:text-teal-400 transition-colors">Cookies</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
