import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { authAPI } from '../services/api'

function VerifyEmail() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const [status, setStatus] = useState('verifying') // verifying | success | error
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setMessage('No verification token provided.')
      return
    }

    const verify = async () => {
      try {
        const response = await authAPI.verifyEmail(token)
        if (response.success) {
          setStatus('success')
          setMessage(response.message || 'Email verified successfully!')
        } else {
          setStatus('error')
          setMessage(response.message || 'Verification failed.')
        }
      } catch (err) {
        setStatus('error')
        setMessage(err.message || 'Verification failed. The link may have expired.')
      }
    }

    verify()
  }, [token])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center border border-gray-100 dark:border-gray-700">
        {status === 'verifying' && (
          <>
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-teal-50 dark:bg-teal-900/30 flex items-center justify-center">
              <i className="fas fa-spinner fa-spin text-2xl text-teal-600 dark:text-teal-400"></i>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white heading-font mb-2">Verifying Your Email</h2>
            <p className="text-gray-500 dark:text-gray-400">Please wait while we verify your email address...</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-green-50 dark:bg-green-900/30 flex items-center justify-center">
              <i className="fas fa-check-circle text-3xl text-green-500"></i>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white heading-font mb-2">Email Verified!</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6">{message}</p>
            <Link 
              to="/login"
              className="inline-block bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 px-8 rounded-xl transition-colors"
            >
              Go to Login
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-50 dark:bg-red-900/30 flex items-center justify-center">
              <i className="fas fa-times-circle text-3xl text-red-500"></i>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white heading-font mb-2">Verification Failed</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6">{message}</p>
            <div className="space-y-3">
              <Link 
                to="/login"
                className="inline-block bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 px-8 rounded-xl transition-colors"
              >
                Go to Login
              </Link>
              <p className="text-sm text-gray-400 dark:text-gray-500">
                You can request a new verification link from the login page.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default VerifyEmail
