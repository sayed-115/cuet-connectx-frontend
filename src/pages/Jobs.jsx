import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

function Jobs() {
  const [searchTerm, setSearchTerm] = useState('')
  const [appliedJobs, setAppliedJobs] = useState([])
  const [savedJobs, setSavedJobs] = useState([])
  const [jobType, setJobType] = useState('All Job Types')
  const [location, setLocation] = useState('All Locations')
  const [experienceLevel, setExperienceLevel] = useState('Experience Level')
  const [postedByAlumni, setPostedByAlumni] = useState(false)
  const [showPostModal, setShowPostModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(null)
  const [newJob, setNewJob] = useState({ title: '', company: '', location: '', type: '', experience: '', deadline: '', requirements: '', responsibilities: '', applicationLink: '' })
  const { isLoggedIn } = useAuth()
  const navigate = useNavigate()
  
  const [jobs, setJobs] = useState([
    { 
      id: 1, 
      title: 'Software Engineer', 
      company: 'TechCorp Bangladesh Ltd.', 
      location: 'Dhaka, Bangladesh', 
      type: 'Full-Time', 
      posted: '2 days ago', 
      salary: '$120k-180k', 
      experience: 'Entry Level (0-2 years)', 
      deadline: 'February 28, 2026',
      postedByAlumni: true, 
      postedBy: { name: 'Sarah Ahmed', type: 'Alumni', batch: '2018', position: 'Senior Software Engineer at TechCorp' }, 
      requirements: [
        "Bachelor's degree in Computer Science or related field",
        "Experience with React, Node.js, and cloud technologies",
        "Strong problem-solving skills",
        "Good communication skills"
      ],
      responsibilities: [
        "Develop and maintain web applications",
        "Collaborate with cross-functional teams",
        "Write clean, maintainable code",
        "Participate in code reviews"
      ],
      applicationLink: 'https://techcorp.com/careers/apply',
      icon: 'fa-briefcase', 
      iconColor: 'bg-teal-100 dark:bg-teal-900/50 text-teal-600 dark:text-teal-400' 
    },
    { 
      id: 2, 
      title: 'Frontend Development Intern', 
      company: 'StartupXYZ', 
      location: 'Remote', 
      type: 'Internship', 
      posted: '5 days ago', 
      salary: 'Paid', 
      experience: 'Entry Level (0-1 years)', 
      deadline: 'March 15, 2026',
      postedByAlumni: false, 
      postedBy: { name: 'Rajib Khan', type: 'Student', batch: '2021', position: 'Founder at StartupXYZ' }, 
      requirements: [
        "Currently pursuing a degree in Computer Science",
        "Basic knowledge of HTML, CSS, JavaScript",
        "Eagerness to learn React",
        "Good communication skills"
      ],
      responsibilities: [
        "Learn and apply React concepts",
        "Build UI components",
        "Work on real projects",
        "Collaborate with the development team"
      ],
      applicationLink: 'https://startupxyz.com/internship',
      icon: 'fa-code', 
      iconColor: 'bg-teal-100 dark:bg-teal-900/50 text-teal-600 dark:text-teal-400' 
    },
    { 
      id: 3, 
      title: 'Data Analyst', 
      company: 'DataTech Solutions', 
      location: 'Chittagong, Bangladesh', 
      type: 'Full-Time', 
      posted: '1 week ago', 
      salary: '$80k-120k', 
      experience: 'Intermediate (2-4 years)', 
      deadline: 'March 1, 2026',
      postedByAlumni: true, 
      postedBy: { name: 'Fahim Hassan', type: 'Alumni', batch: '2017', position: 'Data Science Lead at DataTech' }, 
      requirements: [
        "2+ years experience in data analysis",
        "Strong SQL and Python skills",
        "Experience with data visualization tools",
        "Statistical analysis knowledge"
      ],
      responsibilities: [
        "Analyze large datasets",
        "Create dashboards and reports",
        "Identify trends and insights",
        "Present findings to stakeholders"
      ],
      applicationLink: 'https://datatech.com/careers',
      icon: 'fa-chart-line', 
      iconColor: 'bg-teal-100 dark:bg-teal-900/50 text-teal-600 dark:text-teal-400' 
    },
    { 
      id: 4, 
      title: 'ML Engineer', 
      company: 'AI Labs Bangladesh', 
      location: 'Remote', 
      type: 'Full-Time', 
      posted: '3 days ago', 
      salary: '$150k-220k', 
      experience: 'Senior Level (5+ years)', 
      deadline: 'April 1, 2026',
      postedByAlumni: true, 
      postedBy: { name: 'Dr. Rahim Khan', type: 'Alumni', batch: '2010', position: 'AI Research Director' }, 
      requirements: [
        "PhD or equivalent experience in ML",
        "5+ years of industry experience",
        "Published research papers",
        "Experience with TensorFlow/PyTorch"
      ],
      responsibilities: [
        "Lead ML research projects",
        "Design and implement ML models",
        "Mentor junior engineers",
        "Publish research findings"
      ],
      applicationLink: 'https://ailabs.com/careers/ml-engineer',
      icon: 'fa-brain', 
      iconColor: 'bg-teal-100 dark:bg-teal-900/50 text-teal-600 dark:text-teal-400' 
    },
  ])

  const jobTypes = ['All Job Types', 'Full-time', 'Part-time', 'Contract', 'Internship', 'Remote']
  const locations = ['All Locations', 'Remote', 'Dhaka', 'Chittagong', 'San Francisco', 'New York', 'London']
  const experienceLevels = ['Experience Level', 'Entry Level', 'Intermediate', 'Senior Level', 'Lead/Manager']

  const handleApply = (jobId) => {
    if (!isLoggedIn) {
      navigate('/login')
      return
    }
    setAppliedJobs([...appliedJobs, jobId])
  }

  const handleSaveJob = (jobId) => {
    if (!isLoggedIn) {
      navigate('/login')
      return
    }
    if (savedJobs.includes(jobId)) {
      setSavedJobs(savedJobs.filter(id => id !== jobId))
    } else {
      setSavedJobs([...savedJobs, jobId])
    }
  }

  const handlePostJob = (e) => {
    e.preventDefault()
    if (!isLoggedIn) {
      navigate('/login')
      return
    }
    const job = {
      id: jobs.length + 1,
      title: newJob.title,
      company: newJob.company,
      location: newJob.location,
      type: newJob.type,
      experience: newJob.experience,
      salary: 'Competitive',
      description: newJob.responsibilities,
      requirements: newJob.requirements,
      applicationLink: newJob.applicationLink,
      deadline: newJob.deadline,
      posted: 'Just now',
      postedByAlumni: true,
      postedBy: { name: 'You', type: 'Alumni', batch: '2020' },
      icon: 'fa-briefcase',
      iconColor: 'bg-teal-100 dark:bg-teal-900/50 text-teal-600 dark:text-teal-400'
    }
    setJobs([job, ...jobs])
    setNewJob({ title: '', company: '', location: '', type: '', experience: '', deadline: '', requirements: '', responsibilities: '', applicationLink: '' })
    setShowPostModal(false)
  }

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.location.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = jobType === 'All Job Types' || job.type === jobType
    const matchesLocation = location === 'All Locations' || job.location === location
    const matchesExperience = experienceLevel === 'Experience Level' || job.experience === experienceLevel
    const matchesAlumni = !postedByAlumni || job.postedByAlumni
    return matchesSearch && matchesType && matchesLocation && matchesExperience && matchesAlumni
  })

  return (
    <div className="py-16 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-10">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold heading-font text-gray-800 dark:text-white mb-2">Job Opportunities</h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">Explore career opportunities shared by the CUET community</p>
          </div>
          <button 
            onClick={() => isLoggedIn ? setShowPostModal(true) : navigate('/login')}
            className="mt-4 md:mt-0 btn-primary flex items-center gap-2"
          >
            <i className="fas fa-plus"></i> Post a Job
          </button>
        </div>

        {/* Search & Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 mb-8">
          <div className="relative mb-4">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              <i className="fas fa-search"></i>
            </div>
            <input
              type="text"
              placeholder="Search jobs by title, company, or keywords..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-professional pl-12"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <i className="fas fa-times"></i>
              </button>
            )}
          </div>
          
          <div className="flex flex-wrap items-center gap-4">
            <select value={jobType} onChange={(e) => setJobType(e.target.value)} className="px-4 py-2.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500">
              {jobTypes.map(type => <option key={type} value={type}>{type}</option>)}
            </select>
            <select value={location} onChange={(e) => setLocation(e.target.value)} className="px-4 py-2.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500">
              {locations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
            </select>
            <select value={experienceLevel} onChange={(e) => setExperienceLevel(e.target.value)} className="px-4 py-2.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500">
              {experienceLevels.map(exp => <option key={exp} value={exp}>{exp}</option>)}
            </select>
            <label className="flex items-center gap-2 text-gray-700 dark:text-gray-300 cursor-pointer ml-2">
              <input 
                type="checkbox" 
                checked={postedByAlumni} 
                onChange={(e) => setPostedByAlumni(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
              />
              Posted by Alumni
            </label>
          </div>
        </div>

        {/* Post Job Modal */}
        {showPostModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">Post a Job Opportunity</h2>
                <button onClick={() => setShowPostModal(false)} className="text-gray-400 hover:text-gray-600">
                  <i className="fas fa-times text-xl"></i>
                </button>
              </div>
              <form onSubmit={handlePostJob} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Company Name *</label>
                    <input type="text" required value={newJob.company} onChange={(e) => setNewJob({...newJob, company: e.target.value})} className="input-professional" placeholder="Enter company name" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Job Role/Title *</label>
                    <input type="text" required value={newJob.title} onChange={(e) => setNewJob({...newJob, title: e.target.value})} className="input-professional" placeholder="e.g., Software Engineer" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location *</label>
                    <input type="text" required value={newJob.location} onChange={(e) => setNewJob({...newJob, location: e.target.value})} className="input-professional" placeholder="e.g., Dhaka, Remote" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Job Type *</label>
                    <select required value={newJob.type} onChange={(e) => setNewJob({...newJob, type: e.target.value})} className="input-professional">
                      <option value="">Select job type</option>
                      <option>Full-time</option>
                      <option>Part-time</option>
                      <option>Contract</option>
                      <option>Internship</option>
                      <option>Remote</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Experience Level *</label>
                    <select required value={newJob.experience} onChange={(e) => setNewJob({...newJob, experience: e.target.value})} className="input-professional">
                      <option value="">Select experience level</option>
                      <option>Entry Level</option>
                      <option>Intermediate</option>
                      <option>Senior Level</option>
                      <option>Lead/Manager</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Application Deadline *</label>
                    <input type="date" required value={newJob.deadline} onChange={(e) => setNewJob({...newJob, deadline: e.target.value})} className="input-professional" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Requirements *</label>
                  <textarea rows={3} required value={newJob.requirements} onChange={(e) => setNewJob({...newJob, requirements: e.target.value})} className="input-professional" placeholder="List the required qualifications and skills"></textarea>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Responsibilities *</label>
                  <textarea rows={3} required value={newJob.responsibilities} onChange={(e) => setNewJob({...newJob, responsibilities: e.target.value})} className="input-professional" placeholder="Describe the job responsibilities"></textarea>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Application Link *</label>
                  <input type="url" required value={newJob.applicationLink} onChange={(e) => setNewJob({...newJob, applicationLink: e.target.value})} className="input-professional" placeholder="https://example.com/apply" />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">URL where applicants can apply for this position</p>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowPostModal(false)} className="flex-1 btn-secondary">Cancel</button>
                  <button type="submit" className="flex-1 btn-primary">Post Job</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Job Detail Modal */}
        {showDetailModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6">
              {/* Header */}
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">Job Details</h2>
                <button onClick={() => setShowDetailModal(null)} className="text-gray-400 hover:text-gray-600">
                  <i className="fas fa-times text-xl"></i>
                </button>
              </div>

              {/* Title & Company */}
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white">{showDetailModal.title}</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm">{showDetailModal.company}</p>
              </div>

              {/* Job Information */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                  <i className="fas fa-info-circle text-gray-400"></i> Job Information
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Job Type:</span>
                    <p className="text-teal-600 dark:text-teal-400 font-medium">{showDetailModal.type}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Location:</span>
                    <p className="text-teal-600 dark:text-teal-400 font-medium">{showDetailModal.location}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Experience:</span>
                    <p className="text-gray-700 dark:text-gray-300 font-medium">{showDetailModal.experience}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Deadline:</span>
                    <p className="text-gray-700 dark:text-gray-300 font-medium">{showDetailModal.deadline || 'Not specified'}</p>
                  </div>
                </div>
              </div>

              {/* Requirements */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                  <i className="fas fa-list text-gray-400"></i> Requirements
                </h4>
                <ul className="space-y-2">
                  {(showDetailModal.requirements && Array.isArray(showDetailModal.requirements) ? showDetailModal.requirements : [showDetailModal.description || 'No requirements specified']).map((req, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <span className="text-teal-500 mt-1">•</span>
                      {req}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Responsibilities */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                  <i className="fas fa-list text-gray-400"></i> Responsibilities
                </h4>
                <ul className="space-y-2">
                  {(showDetailModal.responsibilities && Array.isArray(showDetailModal.responsibilities) ? showDetailModal.responsibilities : ['See job description']).map((resp, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <span className="text-teal-500 mt-1">•</span>
                      {resp}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Posted By */}
              <div className="mb-6 pt-4 border-t dark:border-gray-700">
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                  <i className="fas fa-user text-gray-400"></i> Posted By
                </h4>
                <div className="text-sm">
                  <p className="font-semibold text-gray-800 dark:text-white">{showDetailModal.postedBy.name}</p>
                  <p className="text-gray-500 dark:text-gray-400">{showDetailModal.postedBy.type}, Batch {showDetailModal.postedBy.batch}</p>
                  <p className="text-gray-500 dark:text-gray-400">{showDetailModal.postedBy.position || ''}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button onClick={() => setShowDetailModal(null)} className="flex-1 btn-secondary">Close</button>
                <a 
                  href={showDetailModal.applicationLink || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-teal-600 hover:bg-teal-700 text-white py-2.5 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors"
                >
                  Apply Now <i className="fas fa-external-link-alt text-xs"></i>
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Job Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredJobs.map(job => (
            <div key={job.id} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 shadow-sm hover:shadow-lg transition-shadow duration-300">
              {/* Header with icon and bookmark */}
              <div className="flex justify-between items-start mb-4">
                <div className={`w-10 h-10 ${job.iconColor} rounded-lg flex items-center justify-center`}>
                  <i className={`fas ${job.icon} text-base`}></i>
                </div>
                <button 
                  onClick={() => handleSaveJob(job.id)}
                  className={`p-1.5 transition-colors ${savedJobs.includes(job.id) ? 'text-teal-600 dark:text-teal-400' : 'text-gray-300 hover:text-gray-500'}`}
                >
                  <i className={`${savedJobs.includes(job.id) ? 'fas' : 'far'} fa-bookmark text-lg`}></i>
                </button>
              </div>

              {/* Title and Company */}
              <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-1">{job.title}</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-3">{job.company}</p>

              {/* Tags Row 1 - Type & Location */}
              <div className="flex flex-wrap gap-2 mb-2">
                <span className="px-3 py-1 bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 rounded-full text-xs font-medium flex items-center gap-1.5">
                  <i className="fas fa-briefcase text-[10px]"></i> {job.type}
                </span>
                <span className="px-3 py-1 bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 rounded-full text-xs font-medium flex items-center gap-1.5">
                  <i className="fas fa-map-marker-alt text-[10px]"></i> {job.location.split(',')[0]}
                </span>
              </div>
              
              {/* Tags Row 2 - Experience */}
              <div className="mb-4">
                <span className="px-3 py-1 bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 rounded-full text-xs font-medium inline-flex items-center gap-1.5">
                  <i className="fas fa-star text-[10px]"></i> {job.experience.split(' (')[0]}
                </span>
              </div>

              {/* Description */}
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3">
                {Array.isArray(job.requirements) ? job.requirements.slice(0, 2).join('. ') + '.' : job.description}
              </p>

              {/* Posted By */}
              <div className="flex items-center gap-1.5 text-xs mb-2">
                <i className="fas fa-user-circle text-teal-500"></i>
                <span className="text-gray-500 dark:text-gray-400">Posted by</span>
                <span className="font-medium text-teal-600 dark:text-teal-400">{job.postedBy.name}</span>
                <span className="text-gray-400 dark:text-gray-500">({job.postedBy.type}, Batch {job.postedBy.batch})</span>
              </div>

              {/* Posted Time */}
              <div className="flex items-center gap-1.5 text-gray-400 dark:text-gray-500 text-xs mb-5">
                <i className="far fa-clock"></i>
                <span>Posted {job.posted}</span>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowDetailModal(job)}
                  className="flex-1 py-2.5 border border-teal-500 dark:border-teal-500 rounded-lg text-teal-600 dark:text-teal-400 text-sm font-medium hover:bg-teal-50 dark:hover:bg-teal-900/30 transition-colors"
                >
                  View Details
                </button>
                <a 
                  href={job.applicationLink || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2.5 rounded-lg text-sm font-medium bg-teal-500 text-white hover:bg-teal-600 transition-colors flex items-center justify-center gap-2"
                >
                  Apply Now <i className="fas fa-external-link-alt text-xs"></i>
                </a>
              </div>
            </div>
          ))}
        </div>
        
        {filteredJobs.length === 0 && (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <i className="fas fa-search text-4xl mb-4 opacity-50"></i>
            <p>No jobs found matching your criteria</p>
            <button onClick={() => { setSearchTerm(''); setJobType('All Job Types'); setLocation('All Locations'); setExperienceLevel('Experience Level'); setPostedByAlumni(false); }} className="mt-4 text-teal-600 hover:underline">Clear all filters</button>
          </div>
        )}
      </div>
    </div>
  )
}

export default Jobs
