import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { authAPI } from '../services/api'
import cuetLogo from '../assets/logos/CUET_Vector_Logo.svg.png'

const resolveRedirectPath = (fromState) => {
  if (!fromState) return '/'

  if (typeof fromState === 'string') {
    return fromState === '/login' || fromState === '/signup' ? '/' : fromState
  }

  const pathname = fromState.pathname || '/'
  const search = fromState.search || ''
  const hash = fromState.hash || ''
  const target = `${pathname}${search}${hash}`

  if (target === '/login' || target === '/signup') {
    return '/'
  }

  return target
}

function Login() {
  const [studentId, setStudentId] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [needsVerification, setNeedsVerification] = useState(false)
  const [verificationEmail, setVerificationEmail] = useState('')
  const [resendLoading, setResendLoading] = useState(false)
  const [resendMessage, setResendMessage] = useState('')
  const { login, isLoggedIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const redirectPath = resolveRedirectPath(location.state?.from)

  // Redirect if already logged in
  useEffect(() => {
    if (isLoggedIn) {
      navigate(redirectPath, { replace: true })
    }
  }, [isLoggedIn, navigate, redirectPath])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    if (studentId.length !== 7) {
      setError('Student ID must be 7 digits')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    setIsLoading(true)
    setNeedsVerification(false)
    setResendMessage('')
    
    try {
      const result = await login(studentId, password)
      setIsLoading(false)
      
      if (result.success) {
        navigate(redirectPath, { replace: true })
      } else {
        // Check if the error is about email verification
        if (result.needsVerification) {
          setNeedsVerification(true)
          setVerificationEmail(result.email || '')
        }
        setError(result.error)
      }
    } catch (err) {
      setIsLoading(false)
      setError(err.message || 'Login failed. Please try again.')
    }
  }

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-900">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-teal-700 via-teal-600 to-teal-800 p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px'}}></div>
        </div>
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-teal-500/30 rounded-full blur-3xl"></div>
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-teal-400/20 rounded-full blur-3xl"></div>
        
        <div className="relative">
          <Link to="/" className="flex items-center gap-3">
            <img src={cuetLogo} alt="CUET Logo" className="h-12 w-12 bg-white rounded-xl p-1" />
            <span className="text-2xl font-bold text-white heading-font">CUET ConnectX</span>
          </Link>
        </div>
        
        <div className="relative space-y-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <p className="text-white text-lg italic">"CUET ConnectX has been instrumental in connecting me with alumni mentors who helped shape my career path."</p>
            <div className="mt-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-teal-500 rounded-full flex items-center justify-center text-white font-bold">RS</div>
              <div>
                <p className="text-white font-semibold">Rafiq Sharif</p>
                <p className="text-teal-200 text-sm">CSE'18, Software Engineer @ Google</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="relative">
          <p className="text-teal-200 text-sm">&copy; 2026 CUET ConnectX. All rights reserved.</p>
        </div>
      </div>
      
      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="max-w-md w-full">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-3">
              <img src={cuetLogo} alt="CUET Logo" className="h-14 w-14" />
              <span className="text-2xl font-bold text-teal-700 dark:text-teal-400 heading-font">CUET ConnectX</span>
            </Link>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-700">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold heading-font text-gray-800 dark:text-white">Welcome Back!</h2>
              <p className="text-gray-500 dark:text-gray-400 mt-1">Sign in to continue to your account</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                  <i className="fas fa-exclamation-circle"></i> {error}
                </div>
              )}

              {needsVerification && (
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 text-center">
                  <p className="text-amber-700 dark:text-amber-400 text-sm mb-3">
                    Your email is not verified yet. Check your inbox or request a new link.
                  </p>
                  {resendMessage && (
                    <p className="text-teal-600 dark:text-teal-400 text-sm mb-2">{resendMessage}</p>
                  )}
                  <button
                    type="button"
                    disabled={resendLoading}
                    onClick={async () => {
                      if (!verificationEmail) return
                      setResendLoading(true)
                      setResendMessage('')
                      try {
                        const res = await authAPI.resendVerification(verificationEmail)
                        setResendMessage(res.message || 'Verification email sent!')
                      } catch (err) {
                        setResendMessage(err.message || 'Failed to resend.')
                      }
                      setResendLoading(false)
                    }}
                    className="text-teal-600 hover:text-teal-700 font-semibold text-sm disabled:opacity-50"
                  >
                    {resendLoading ? 'Sending...' : 'Resend Verification Email'}
                  </button>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Student ID</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    <i className="fas fa-id-card"></i>
                  </div>
                  <input
                    type="text"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value.replace(/\D/g, '').slice(0, 7))}
                    placeholder="Enter your 7-digit Student ID"
                    className="input-professional pl-11"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
                  <Link to="/forgot-password" className="text-sm text-teal-600 hover:text-teal-700">Forgot password?</Link>
                </div>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    <i className="fas fa-lock"></i>
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="input-professional pl-11 pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <i className={showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'}></i>
                  </button>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full btn-primary py-3.5 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <><i className="fas fa-spinner fa-spin"></i> Signing in...</>
                ) : (
                  <>Sign In <i className="fas fa-arrow-right"></i></>
                )}
              </button>
            </form>

            <p className="mt-8 text-center text-gray-600 dark:text-gray-400">
              Don't have an account? <Link to="/signup" className="text-teal-600 hover:text-teal-700 font-semibold">Create Account</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
