import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import cuetLogo from '../assets/logos/CUET_Vector_Logo.svg.png'

// Department code mapping
const DEPARTMENT_CODES = {
  '01': 'Civil Engineering',
  '02': 'Electrical & Electronic Engineering',
  '03': 'Mechanical Engineering',
  '04': 'Computer Science & Engineering',
  '05': 'Electronics & Communication Engineering',
  '06': 'Urban & Regional Planning',
  '07': 'Petroleum & Mining Engineering',
  '08': 'Architecture',
  '09': 'Physics',
  '10': 'Chemistry',
  '11': 'Mathematics',
  '12': 'Humanities',
}

// Short department names for display
const DEPARTMENT_SHORT = {
  '01': 'CE',
  '02': 'EEE',
  '03': 'ME',
  '04': 'CSE',
  '05': 'ECE',
  '06': 'URP',
  '07': 'PME',
  '08': 'ARCH',
  '09': 'PHY',
  '10': 'CHEM',
  '11': 'MATH',
  '12': 'HUM',
}

// Parse student ID and extract info
const parseStudentId = (studentId) => {
  if (!studentId || studentId.length !== 7) {
    return { valid: false, batch: null, department: null, departmentShort: null, roll: null }
  }
  
  const batchCode = studentId.substring(0, 2)
  const deptCode = studentId.substring(2, 4)
  const roll = studentId.substring(4, 7)
  
  const batch = 2000 + parseInt(batchCode)
  const department = DEPARTMENT_CODES[deptCode] || null
  const departmentShort = DEPARTMENT_SHORT[deptCode] || null
  
  return {
    valid: department !== null,
    batch,
    department,
    departmentShort,
    deptCode,
    roll,
  }
}

function Signup() {
  const [formData, setFormData] = useState({ fullName: '', email: '', studentId: '', password: '', confirmPassword: '' })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [parsedId, setParsedId] = useState({ valid: false, batch: null, department: null, departmentShort: null, roll: null })
  const { register, isLoggedIn } = useAuth()
  const navigate = useNavigate()

  // Redirect if already logged in
  useEffect(() => {
    if (isLoggedIn) {
      navigate('/profile')
    }
  }, [isLoggedIn, navigate])

  const handleChange = (e) => {
    const { name, value } = e.target
    if (name === 'studentId') {
      const cleanedValue = value.replace(/\D/g, '').slice(0, 7)
      setFormData({ ...formData, [name]: cleanedValue })
      // Parse student ID as user types
      setParsedId(parseStudentId(cleanedValue))
    } else {
      setFormData({ ...formData, [name]: value })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    if (formData.fullName.length < 3) { setError('Name must be at least 3 characters'); return }
    if (formData.studentId.length !== 7) { setError('Student ID must be 7 digits'); return }
    
    // Validate department code
    const parsed = parseStudentId(formData.studentId)
    if (!parsed.valid) { 
      setError('Invalid department code in Student ID. Please check your ID.'); 
      return 
    }
    
    if (formData.password.length < 8) { setError('Password must be at least 8 characters'); return }
    if (formData.password !== formData.confirmPassword) { setError('Passwords do not match'); return }

    setIsLoading(true)
    
    try {
      const userData = {
        fullName: formData.fullName,
        studentId: formData.studentId,
        email: formData.email,
        password: formData.password,
        userType: parsed.batch >= 2020 ? 'student' : 'alumni',
        batch: parsed.batch,
        department: parsed.department,
        departmentShort: parsed.departmentShort,
        roll: parsed.roll,
      }
      
      const result = await register(userData)
      setIsLoading(false)
      
      if (result.success) {
        navigate('/profile')
      } else {
        setError(result.error)
      }
    } catch (err) {
      setIsLoading(false)
      setError(err.message || 'Registration failed. Please try again.')
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
          <h2 className="text-3xl font-bold text-white heading-font">Start Your Journey Today</h2>
          <p className="text-teal-100 text-lg">Join thousands of CUETians who are already building their future through our network.</p>
          
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-white">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <i className="fas fa-check"></i>
              </div>
              <span>Access exclusive job opportunities</span>
            </div>
            <div className="flex items-center gap-3 text-white">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <i className="fas fa-check"></i>
              </div>
              <span>Connect with alumni mentors</span>
            </div>
            <div className="flex items-center gap-3 text-white">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <i className="fas fa-check"></i>
              </div>
              <span>Discover scholarship opportunities</span>
            </div>
          </div>
        </div>
        
        <div className="relative">
          <p className="text-teal-200 text-sm">&copy; 2026 CUET ConnectX. All rights reserved.</p>
        </div>
      </div>
      
      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 overflow-y-auto">
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
              <h2 className="text-2xl font-bold heading-font text-gray-800 dark:text-white">Create Account</h2>
              <p className="text-gray-500 dark:text-gray-400 mt-1">Join the CUET ConnectX community</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                  <i className="fas fa-exclamation-circle"></i> {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Full Name</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    <i className="fas fa-user"></i>
                  </div>
                  <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} placeholder="Enter your full name"
                    className="input-professional pl-11" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email Address</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    <i className="fas fa-envelope"></i>
                  </div>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="you@example.com"
                    className="input-professional pl-11" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Student ID</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    <i className="fas fa-id-card"></i>
                  </div>
                  <input type="text" name="studentId" value={formData.studentId} onChange={handleChange} placeholder="7-digit Student ID (e.g., 2204115)"
                    className="input-professional pl-11" />
                </div>
                
                {/* Parsed Student ID Info */}
                {formData.studentId.length > 0 && (
                  <div className="mt-2 text-sm">
                    {formData.studentId.length === 7 ? (
                      parsedId.valid ? (
                        <div className="bg-teal-50 dark:bg-teal-900/30 rounded-lg p-3 border border-teal-200 dark:border-teal-800">
                          <div className="flex flex-wrap gap-3">
                            <div className="flex items-center gap-2">
                              <span className="text-gray-500 dark:text-gray-400">Batch:</span>
                              <span className="font-semibold text-teal-700 dark:text-teal-400">{parsedId.batch}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-gray-500 dark:text-gray-400">Dept:</span>
                              <span className="font-semibold text-teal-700 dark:text-teal-400">{parsedId.departmentShort}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-gray-500 dark:text-gray-400">Roll:</span>
                              <span className="font-semibold text-teal-700 dark:text-teal-400">{parsedId.roll}</span>
                            </div>
                          </div>
                          <div className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                            {parsedId.department}
                          </div>
                        </div>
                      ) : (
                        <div className="bg-red-50 dark:bg-red-900/30 rounded-lg p-3 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400">
                          <i className="fas fa-exclamation-triangle mr-2"></i>
                          Invalid department code "{formData.studentId.substring(2, 4)}". Please check your Student ID.
                        </div>
                      )
                    ) : (
                      <div className="text-gray-400 dark:text-gray-500">
                        <i className="fas fa-info-circle mr-1"></i>
                        Enter all 7 digits ({7 - formData.studentId.length} more needed)
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Password</label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                      <i className="fas fa-lock"></i>
                    </div>
                    <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Min. 8 chars"
                      className="input-professional pl-11" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Confirm</label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                      <i className="fas fa-lock"></i>
                    </div>
                    <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="Repeat"
                      className="input-professional pl-11" />
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2 text-sm">
                <input type="checkbox" id="terms" className="mt-1 rounded border-gray-300 text-teal-600 focus:ring-teal-500" required />
                <label htmlFor="terms" className="text-gray-600 dark:text-gray-400">
                  I agree to the <Link to="/terms" className="text-teal-600 hover:underline">Terms of Service</Link> and <Link to="/privacy" className="text-teal-600 hover:underline">Privacy Policy</Link>
                </label>
              </div>

              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full btn-primary py-3.5 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <><i className="fas fa-spinner fa-spin"></i> Creating Account...</>
                ) : (
                  <>Create Account <i className="fas fa-arrow-right"></i></>
                )}
              </button>
            </form>

            <p className="mt-8 text-center text-gray-600 dark:text-gray-400">
              Already have an account? <Link to="/login" className="text-teal-600 hover:text-teal-700 font-semibold">Sign In</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Signup
