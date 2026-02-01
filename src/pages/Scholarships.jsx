import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

function Scholarships() {
  const [savedScholarships, setSavedScholarships] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [level, setLevel] = useState('All Levels')
  const [location, setLocation] = useState('All Locations')
  const [fundingType, setFundingType] = useState('Funding Type')
  const [showPostModal, setShowPostModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(null)
  const [newScholarship, setNewScholarship] = useState({ 
    name: '', 
    level: '', 
    location: '', 
    fundingType: '', 
    duration: '',
    fundingDetails: '', 
    deadline: '', 
    link: '',
    eligibility: '',
    benefits: '',
    description: '' 
  })
  const { isLoggedIn, user } = useAuth()
  const navigate = useNavigate()

  const [scholarships, setScholarships] = useState([
    { 
      id: 1, 
      name: 'Fulbright Foreign Student Program', 
      level: "Master's, PhD", 
      location: 'USA', 
      fundingType: 'Full',
      duration: '2-3 years',
      fundingDetails: 'Full tuition + $2,500/month stipend + Travel',
      deadline: 'October 15, 2026',
      link: 'https://foreign.fulbrightonline.org',
      eligibility: 'Must be a citizen of an eligible country. Bachelor\'s degree required. Strong academic record and leadership potential.',
      benefits: 'Full tuition coverage, monthly stipend, round-trip airfare, health insurance, and pre-academic training.',
      description: 'Full scholarship for international students to pursue graduate studies in the United States. Covers tuition, living expenses, and travel costs.',
      postedBy: { name: 'Dr. Nasrin Ahmed', type: 'Alumni' }
    },
    { 
      id: 2, 
      name: 'Commonwealth PhD Scholarships', 
      level: 'PhD', 
      location: 'UK', 
      fundingType: 'Full',
      duration: '3-4 years',
      fundingDetails: 'Full tuition + Living allowance + Travel',
      deadline: 'December 16, 2026',
      link: 'https://cscuk.fcdo.gov.uk/scholarships',
      eligibility: 'Citizens of Commonwealth countries. Must have a relevant Master\'s degree or equivalent.',
      benefits: 'Full tuition fees, living allowance, return airfare, thesis grant, and warm clothing allowance.',
      description: 'Commonwealth scholarships for developing country students to pursue doctoral studies in UK universities.',
      postedBy: { name: 'Prof. Karim Rahman', type: 'Alumni' }
    },
    { 
      id: 3, 
      name: 'CUET Merit Scholarship', 
      level: 'Undergraduate', 
      location: 'Bangladesh', 
      fundingType: 'Partial',
      duration: '1 year (renewable)',
      fundingDetails: '50% tuition waiver',
      deadline: 'March 31, 2026',
      link: 'https://cuet.ac.bd/scholarship',
      eligibility: 'Current CUET students with CGPA 3.75 or above. Must maintain academic standing.',
      benefits: '50% tuition waiver for one academic year, renewable based on performance.',
      description: 'Merit-based scholarship for CUET undergraduate students with excellent academic records.',
      postedBy: { name: 'CUET Admin', type: 'Admin' }
    },
  ])

  const levels = ['All Levels', 'Undergraduate', "Master's", 'PhD', 'Postdoc']
  const locations = ['All Locations', 'Bangladesh', 'USA', 'UK', 'Europe', 'Asia', 'Australia']
  const fundingTypes = ['Funding Type', 'Full', 'Partial', 'Tuition Only', 'Stipend']

  const handleSaveScholarship = (scholarshipId) => {
    if (!isLoggedIn) {
      navigate('/login')
      return
    }
    if (savedScholarships.includes(scholarshipId)) {
      setSavedScholarships(savedScholarships.filter(id => id !== scholarshipId))
    } else {
      setSavedScholarships([...savedScholarships, scholarshipId])
    }
  }

  const handlePostScholarship = (e) => {
    e.preventDefault()
    if (!isLoggedIn) {
      navigate('/login')
      return
    }
    const scholarship = {
      id: scholarships.length + 1,
      ...newScholarship,
      postedBy: { name: user?.fullName || 'You', type: 'Alumni' }
    }
    setScholarships([scholarship, ...scholarships])
    setNewScholarship({ 
      name: '', 
      level: '', 
      location: '', 
      fundingType: '', 
      duration: '',
      fundingDetails: '', 
      deadline: '', 
      link: '',
      eligibility: '',
      benefits: '',
      description: '' 
    })
    setShowPostModal(false)
  }

  const filteredScholarships = scholarships.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesLevel = level === 'All Levels' || s.level.includes(level.replace("'s", ""))
    const matchesLocation = location === 'All Locations' || s.location === location
    const matchesFunding = fundingType === 'Funding Type' || s.fundingType === fundingType
    return matchesSearch && matchesLevel && matchesLocation && matchesFunding
  })

  return (
    <div className="py-16 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-10">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold heading-font text-gray-800 dark:text-white mb-2">Scholarship Opportunities</h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">Discover funding opportunities for your academic journey</p>
          </div>
          <button 
            onClick={() => isLoggedIn ? setShowPostModal(true) : navigate('/login')}
            className="mt-4 md:mt-0 btn-primary flex items-center gap-2"
          >
            <i className="fas fa-plus"></i> Post a Scholarship
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
              placeholder="Search scholarships by name, keywords..."
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
            <select value={level} onChange={(e) => setLevel(e.target.value)} className="px-4 py-2.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500">
              {levels.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
            <select value={location} onChange={(e) => setLocation(e.target.value)} className="px-4 py-2.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500">
              {locations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
            </select>
            <select value={fundingType} onChange={(e) => setFundingType(e.target.value)} className="px-4 py-2.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500">
              {fundingTypes.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
        </div>

        {/* Post Scholarship Modal */}
        {showPostModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">Post a Scholarship Opportunity</h2>
                <button onClick={() => setShowPostModal(false)} className="text-gray-400 hover:text-gray-600">
                  <i className="fas fa-times text-xl"></i>
                </button>
              </div>
              <form onSubmit={handlePostScholarship} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Scholarship Name *</label>
                  <input type="text" required value={newScholarship.name} onChange={(e) => setNewScholarship({...newScholarship, name: e.target.value})} className="input-professional" placeholder="Enter scholarship name" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Level *</label>
                    <select required value={newScholarship.level} onChange={(e) => setNewScholarship({...newScholarship, level: e.target.value})} className="input-professional">
                      <option value="">Select level</option>
                      <option>Undergraduate</option>
                      <option>Master's</option>
                      <option>PhD</option>
                      <option>Master's, PhD</option>
                      <option>Postdoc</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location *</label>
                    <input type="text" required value={newScholarship.location} onChange={(e) => setNewScholarship({...newScholarship, location: e.target.value})} className="input-professional" placeholder="e.g., USA, UK" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Funding Type *</label>
                    <select required value={newScholarship.fundingType} onChange={(e) => setNewScholarship({...newScholarship, fundingType: e.target.value})} className="input-professional">
                      <option value="">Select funding type</option>
                      <option>Full</option>
                      <option>Partial</option>
                      <option>Tuition Only</option>
                      <option>Stipend</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Duration *</label>
                    <input type="text" required value={newScholarship.duration} onChange={(e) => setNewScholarship({...newScholarship, duration: e.target.value})} className="input-professional" placeholder="e.g., 2-3 years" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Funding Details *</label>
                  <textarea rows={2} required value={newScholarship.fundingDetails} onChange={(e) => setNewScholarship({...newScholarship, fundingDetails: e.target.value})} className="input-professional" placeholder="Describe what the scholarship covers (tuition, stipend, travel, etc.)"></textarea>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Application Deadline *</label>
                    <input type="date" required value={newScholarship.deadline} onChange={(e) => setNewScholarship({...newScholarship, deadline: e.target.value})} className="input-professional" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Scholarship Link *</label>
                    <input type="url" required value={newScholarship.link} onChange={(e) => setNewScholarship({...newScholarship, link: e.target.value})} className="input-professional" placeholder="https://example.com/scholarship" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Eligibility Criteria *</label>
                  <textarea rows={2} required value={newScholarship.eligibility} onChange={(e) => setNewScholarship({...newScholarship, eligibility: e.target.value})} className="input-professional" placeholder="List eligibility requirements"></textarea>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Benefits *</label>
                  <textarea rows={2} required value={newScholarship.benefits} onChange={(e) => setNewScholarship({...newScholarship, benefits: e.target.value})} className="input-professional" placeholder="Describe the scholarship benefits"></textarea>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description *</label>
                  <textarea rows={3} required value={newScholarship.description} onChange={(e) => setNewScholarship({...newScholarship, description: e.target.value})} className="input-professional" placeholder="Provide additional details about the scholarship"></textarea>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowPostModal(false)} className="flex-1 btn-secondary">Cancel</button>
                  <button type="submit" className="flex-1 btn-primary">Post Scholarship</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Detail Modal */}
        {showDetailModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-3 ${
                    showDetailModal.fundingType === 'Full' 
                      ? 'bg-teal-100 dark:bg-teal-900/50 text-teal-700 dark:text-teal-400' 
                      : 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-400'
                  }`}>
                    {showDetailModal.fundingType === 'Full' ? 'Fully Funded' : 'Partially Funded'}
                  </span>
                  <h2 className="text-xl font-bold text-gray-800 dark:text-white">{showDetailModal.name}</h2>
                </div>
                <button onClick={() => setShowDetailModal(null)} className="text-gray-400 hover:text-gray-600">
                  <i className="fas fa-times text-xl"></i>
                </button>
              </div>
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1.5 bg-teal-100 dark:bg-teal-900/50 text-teal-700 dark:text-teal-400 rounded-full text-sm font-medium flex items-center gap-1">
                    <i className="fas fa-graduation-cap text-xs"></i> {showDetailModal.level}
                  </span>
                  <span className="px-3 py-1.5 bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-400 rounded-full text-sm font-medium flex items-center gap-1">
                    <i className="fas fa-map-marker-alt text-xs"></i> {showDetailModal.location}
                  </span>
                </div>
                <p className="text-gray-600 dark:text-gray-400">{showDetailModal.description}</p>
                <div className="space-y-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <i className="fas fa-check-circle text-teal-500 mt-1"></i>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Funding</p>
                      <p className="text-sm font-medium text-gray-800 dark:text-white">{showDetailModal.fundingDetails}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <i className="fas fa-calendar text-amber-500 mt-1"></i>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Deadline</p>
                      <p className="text-sm font-medium text-gray-800 dark:text-white">{showDetailModal.deadline}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <i className="fas fa-clock text-teal-500 mt-1"></i>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Duration</p>
                      <p className="text-sm font-medium text-gray-800 dark:text-white">{showDetailModal.duration}</p>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 dark:text-white mb-2">Eligibility</h4>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">{showDetailModal.eligibility}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 dark:text-white mb-2">Benefits</h4>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">{showDetailModal.benefits}</p>
                </div>
                <div className="pt-4 border-t dark:border-gray-700">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 flex items-center gap-2">
                    <i className="fas fa-user-circle text-teal-500"></i>
                    Posted by <span className="font-medium text-gray-700 dark:text-gray-300">{showDetailModal.postedBy.name}</span>
                  </p>
                  <div className="flex gap-3">
                    <button onClick={() => setShowDetailModal(null)} className="flex-1 btn-secondary">Close</button>
                    <a 
                      href={showDetailModal.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex-1 bg-teal-600 hover:bg-teal-700 text-white py-2.5 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors"
                    >
                      Learn More <i className="fas fa-external-link-alt"></i>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Scholarship Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredScholarships.map(scholarship => (
            <div key={scholarship.id} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 shadow-sm hover:shadow-lg transition-shadow duration-300">
              {/* Header with badge and bookmark */}
              <div className="flex justify-between items-start mb-4">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  scholarship.fundingType === 'Full' 
                    ? 'bg-teal-100 dark:bg-teal-900/50 text-teal-700 dark:text-teal-400' 
                    : 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-400'
                }`}>
                  {scholarship.fundingType === 'Full' ? 'Fully Funded' : 'Partially Funded'}
                </span>
                <button 
                  onClick={() => handleSaveScholarship(scholarship.id)}
                  className={`p-2 rounded-lg transition-colors ${savedScholarships.includes(scholarship.id) ? 'text-teal-600 dark:text-teal-400' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  <i className={`${savedScholarships.includes(scholarship.id) ? 'fas' : 'far'} fa-bookmark`}></i>
                </button>
              </div>

              {/* Title */}
              <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-3">{scholarship.name}</h3>

              {/* Level and Location Tags */}
              <div className="flex flex-wrap gap-2 mb-3">
                <span className="px-2.5 py-1 bg-teal-100 dark:bg-teal-900/50 text-teal-700 dark:text-teal-400 rounded-md text-xs font-medium flex items-center gap-1">
                  <i className="fas fa-graduation-cap text-xs"></i> {scholarship.level}
                </span>
                <span className="px-2.5 py-1 bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-400 rounded-md text-xs font-medium flex items-center gap-1">
                  <i className="fas fa-map-marker-alt text-xs"></i> {scholarship.location}
                </span>
              </div>

              {/* Description */}
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                {scholarship.description}
              </p>

              {/* Details */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <i className="fas fa-check-circle text-teal-500 w-4"></i>
                  <span className="text-gray-500 dark:text-gray-400">Funding</span>
                  <span className="ml-auto font-medium text-gray-700 dark:text-gray-300 text-xs">{scholarship.fundingDetails}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <i className="fas fa-calendar text-amber-500 w-4"></i>
                  <span className="text-gray-500 dark:text-gray-400">Deadline</span>
                  <span className="ml-auto font-medium text-amber-600 dark:text-amber-400 text-xs">{scholarship.deadline}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <i className="fas fa-clock text-teal-500 w-4"></i>
                  <span className="text-gray-500 dark:text-gray-400">Duration</span>
                  <span className="ml-auto font-medium text-gray-700 dark:text-gray-300 text-xs">{scholarship.duration}</span>
                </div>
              </div>

              {/* Posted By */}
              <div className="flex items-center gap-2 mb-4 pb-4 border-b border-gray-100 dark:border-gray-700">
                <div className="w-6 h-6 bg-teal-100 dark:bg-teal-900/50 rounded-full flex items-center justify-center">
                  <i className="fas fa-user text-teal-600 dark:text-teal-400 text-xs"></i>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Posted by <span className="font-medium text-gray-700 dark:text-gray-300">{scholarship.postedBy.name}</span>
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button 
                  onClick={() => setShowDetailModal(scholarship)}
                  className="flex-1 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  View Details
                </button>
                <a 
                  href={scholarship.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-teal-600 text-white hover:bg-teal-700 transition-colors flex items-center justify-center gap-2"
                >
                  Learn More <i className="fas fa-external-link-alt text-xs"></i>
                </a>
              </div>
            </div>
          ))}
        </div>
        
        {filteredScholarships.length === 0 && (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <i className="fas fa-search text-4xl mb-4 opacity-50"></i>
            <p>No scholarships found matching your criteria</p>
            <button onClick={() => { setSearchTerm(''); setLevel('All Levels'); setLocation('All Locations'); setFundingType('Funding Type'); }} className="mt-4 text-teal-600 hover:underline">Clear all filters</button>
          </div>
        )}
      </div>
    </div>
  )
}

export default Scholarships
