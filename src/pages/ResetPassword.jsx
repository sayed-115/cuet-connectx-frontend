import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { authAPI } from '../services/api'
import cuetLogo from '../assets/logos/CUET_Vector_Logo.svg.png'

function ResetPassword() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-700 text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-times-circle text-red-500 text-2xl"></i>
          </div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white heading-font mb-2">Invalid Reset Link</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
            This password reset link is invalid. Please request a new one.
          </p>
          <Link to="/forgot-password" className="text-teal-600 hover:text-teal-700 font-semibold text-sm">
            Request New Reset Link
          </Link>
        </div>
      </div>
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setIsLoading(true)
    try {
      await authAPI.resetPassword(token, newPassword)
      setSuccess(true)
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
    }
    setIsLoading(false)
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
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
                <i className="fas fa-check-circle text-green-500 text-2xl"></i>
              </div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-white heading-font">Password Reset Successful!</h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                Your password has been updated. You can now log in with your new password.
              </p>
              <Link
                to="/login"
                className="inline-block mt-4 btn-primary px-8 py-3"
              >
                Go to Login
              </Link>
            </div>
          ) : (
            <>
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-teal-100 dark:bg-teal-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-key text-teal-600 dark:text-teal-400 text-2xl"></i>
                </div>
                <h2 className="text-xl font-bold text-gray-800 dark:text-white heading-font">Set New Password</h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                  Enter your new password below.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                    <i className="fas fa-exclamation-circle"></i> {error}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">New Password</label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                      <i className="fas fa-lock"></i>
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimum 8 characters"
                      className="input-professional pl-11 pr-12"
                      autoFocus
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Confirm Password</label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                      <i className="fas fa-lock"></i>
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter your new password"
                      className="input-professional pl-11"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full btn-primary py-3.5 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <><i className="fas fa-spinner fa-spin"></i> Resetting...</>
                  ) : (
                    <><i className="fas fa-check"></i> Reset Password</>
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

export default ResetPassword
