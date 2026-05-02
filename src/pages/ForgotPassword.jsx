import { useState } from 'react'
import { Link } from 'react-router-dom'
import { authAPI } from '../services/api'
import cuetLogo from '../assets/logos/CUET_Vector_Logo.svg.png'

function ForgotPassword() {
  const [identifier, setIdentifier] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    const trimmed = identifier.trim()
    if (!trimmed) {
      setError('Please enter your email or Student ID')
      return
    }

    setIsLoading(true)
    try {
      // Determine if the input is an email or student ID
      const isEmail = trimmed.includes('@')
      const data = isEmail ? { email: trimmed } : { studentId: trimmed }
      await authAPI.forgotPassword(data)
      setSuccess(true)
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3">
            <img src={cuetLogo} alt="CUET Logo" className="h-14 w-14" />
            <span className="text-2xl font-bold text-teal-700 dark:text-teal-400 heading-font">CUET ConnectX</span>
          </Link>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-700">
          {success ? (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-teal-100 dark:bg-teal-900/30 rounded-full flex items-center justify-center mx-auto">
                <i className="fas fa-envelope text-teal-600 dark:text-teal-400 text-2xl"></i>
              </div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-white heading-font">Check Your Email</h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                If an account with that information exists, we've sent a password reset link. Please check your inbox and spam folder.
              </p>
              <p className="text-gray-400 dark:text-gray-500 text-xs">The link will expire in 10 minutes.</p>
              <Link
                to="/login"
                className="inline-block mt-4 text-teal-600 hover:text-teal-700 font-semibold text-sm"
              >
                <i className="fas fa-arrow-left mr-1"></i> Back to Login
              </Link>
            </div>
          ) : (
            <>
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-teal-100 dark:bg-teal-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-lock text-teal-600 dark:text-teal-400 text-2xl"></i>
                </div>
                <h2 className="text-xl font-bold text-gray-800 dark:text-white heading-font">Forgot Password?</h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                  Enter your email or Student ID and we'll send you a reset link.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                    <i className="fas fa-exclamation-circle"></i> {error}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email or Student ID
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                      <i className="fas fa-user"></i>
                    </div>
                    <input
                      type="text"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder="Enter your email or 7-digit Student ID"
                      className="input-professional pl-11"
                      autoFocus
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full btn-primary py-3.5 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <><i className="fas fa-spinner fa-spin"></i> Sending...</>
                  ) : (
                    <><i className="fas fa-paper-plane"></i> Send Reset Link</>
                  )}
                </button>
              </form>

              <p className="mt-6 text-center">
                <Link to="/login" className="text-teal-600 hover:text-teal-700 font-semibold text-sm">
                  <i className="fas fa-arrow-left mr-1"></i> Back to Login
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword
