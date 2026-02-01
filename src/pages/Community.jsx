import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

function Community() {
  const [followedMembers, setFollowedMembers] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [memberType, setMemberType] = useState('All Members')
  const [department, setDepartment] = useState('All Departments')
  const [batchFilter, setBatchFilter] = useState('All Batches')
  const { isLoggedIn } = useAuth()
  const navigate = useNavigate()

  const members = [
    { id: 1, name: 'Anupam Paul', studentId: '2204116', batch: '2022', department: 'CSE', initials: 'AP', type: 'Student', bio: 'Passionate about AI and Machine Learning. Looking for research opportunities.', skills: [], followers: 245, location: '' },
    { id: 2, name: 'MD Abu Sayed', studentId: '2204115', batch: '2022', department: 'CSE', initials: 'AS', type: 'Student', bio: 'Passionate about AI and Machine Learning. Looking for research opportunities.', skills: [], followers: 333, location: '' },
    { id: 3, name: 'Fatima Rahman', studentId: '2304201', batch: '2023', department: 'EEE', initials: 'FR', type: 'Student', bio: 'Electronics enthusiast with interest in IoT and embedded systems.', skills: [], followers: 180, location: '' },
    { id: 4, name: 'Karim Hassan', studentId: '2104306', batch: '2021', department: 'ME', initials: 'KH', type: 'Student', bio: 'Mechanical engineering student interested in robotics and automation.', skills: [], followers: 370, location: '' },
    { id: 5, name: 'Abir Hassan', studentId: '1804110', batch: '2018', department: 'BANGLADESH', initials: 'AH', type: 'Alumni', position: 'Lecturer at CUET', skills: ['Machine Learning', 'Software Development', 'Teaching', 'Internet Programming'], followers: 520, location: '' },
    { id: 6, name: 'Fahim Hassan', studentId: '1104220', batch: '2007', department: 'UK', initials: 'FH', type: 'Alumni', position: 'Data Scientist at DeepMind', skills: ['Machine Learning', 'Python', 'TensorFlow'], followers: 430, location: '' },
    { id: 7, name: 'Nusrat Jahan', studentId: '1904133', batch: '2019', department: 'Bangladesh', initials: 'NJ', type: 'Alumni', position: 'Founder & CEO at TechStart BD', skills: ['Business', 'Leadership', 'Marketing'], followers: 680, location: '' },
  ]

  const memberTypes = ['All Members', 'Alumni', 'Student']
  const departments = ['All Departments', 'CSE', 'EEE', 'ME', 'CE', 'URP', 'Arch']
  const batches = ['All Batches', ...new Set(members.map(m => m.batch))].sort()

  const handleFollow = (memberId) => {
    if (!isLoggedIn) {
      navigate('/login')
      return
    }
    if (followedMembers.includes(memberId)) {
      setFollowedMembers(followedMembers.filter(id => id !== memberId))
    } else {
      setFollowedMembers([...followedMembers, memberId])
    }
  }

  const handleViewProfile = (memberId) => {
    if (!isLoggedIn) {
      navigate('/login')
      return
    }
    navigate(`/member/${memberId}`)
  }

  const filteredMembers = members.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (member.position || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (member.bio || '').toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = memberType === 'All Members' || member.type === memberType
    const matchesDepartment = department === 'All Departments' || member.department === department
    const matchesBatch = batchFilter === 'All Batches' || member.batch === batchFilter
    return matchesSearch && matchesType && matchesDepartment && matchesBatch
  })

  return (
    <div className="py-16 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <span className="inline-block px-4 py-1.5 bg-teal-100 dark:bg-teal-900/50 text-teal-700 dark:text-teal-400 text-sm font-semibold rounded-full mb-4">Network</span>
          <h1 className="text-3xl md:text-4xl font-bold heading-font text-gray-800 dark:text-white mb-2">CUET Community</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">Connect with students and alumni from CUET</p>
        </div>

        {/* Search & Filters */}
        <div className="card-professional p-6 mb-8">
          <div className="relative mb-4">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              <i className="fas fa-search"></i>
            </div>
            <input
              type="text"
              placeholder="Search by name, role, or department..."
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
            <select value={memberType} onChange={(e) => setMemberType(e.target.value)} className="px-4 py-2.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500">
              {memberTypes.map(type => <option key={type} value={type}>{type}</option>)}
            </select>
            <select value={department} onChange={(e) => setDepartment(e.target.value)} className="px-4 py-2.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500">
              {departments.map(dept => <option key={dept} value={dept}>{dept}</option>)}
            </select>
            <select value={batchFilter} onChange={(e) => setBatchFilter(e.target.value)} className="px-4 py-2.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500">
              {batches.map(batch => <option key={batch} value={batch}>{batch === 'All Batches' ? batch : `Batch ${batch}`}</option>)}
            </select>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMembers.map(member => (
            <div key={member.id} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 shadow-sm hover:shadow-lg transition-shadow duration-300">
              {/* Header with avatar and badge */}
              <div className="flex items-start justify-between mb-4">
                <div className="w-14 h-14 bg-teal-100 dark:bg-teal-900/50 rounded-full flex items-center justify-center border-2 border-teal-500">
                  <span className="text-teal-700 dark:text-teal-400 font-bold text-lg">{member.initials}</span>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  member.type === 'Student' 
                    ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400' 
                    : 'bg-teal-600 text-white'
                }`}>
                  {member.type === 'Student' ? 'Current Student' : 'Alumni'}
                </span>
              </div>

              {/* Name and ID */}
              <h3 className="font-bold text-gray-800 dark:text-white text-lg">{member.name}</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-3">ID: {member.studentId}</p>

              {/* Batch and Department */}
              <div className="flex flex-wrap gap-2 mb-3">
                <span className="px-2.5 py-1 bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 rounded-md text-xs font-medium flex items-center gap-1">
                  <i className="fas fa-calendar-alt text-xs"></i> Batch {member.batch}
                </span>
                <span className="px-2.5 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-md text-xs flex items-center gap-1">
                  <i className="fas fa-map-marker-alt text-xs"></i> {member.department}
                </span>
              </div>

              {/* Bio or Position */}
              {member.type === 'Student' ? (
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2 min-h-[40px]">
                  {member.bio}
                </p>
              ) : (
                <p className="text-teal-600 dark:text-teal-400 text-sm mb-3 flex items-center gap-2">
                  <i className="fas fa-briefcase"></i> {member.position}
                </p>
              )}

              {/* Skills tags (for alumni) */}
              {member.type === 'Alumni' && member.skills && member.skills.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {member.skills.slice(0, 4).map((skill, idx) => (
                    <span key={idx} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded text-xs border border-gray-200 dark:border-gray-600">
                      {skill}
                    </span>
                  ))}
                </div>
              )}

              {/* Followers */}
              <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400 text-sm mb-4">
                <i className="fas fa-users text-xs"></i>
                <span>{member.followers} followers</span>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button 
                  onClick={() => handleViewProfile(member.id)}
                  className="flex-1 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  View Profile
                </button>
                <button 
                  onClick={() => handleFollow(member.id)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                    followedMembers.includes(member.id)
                      ? 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                      : 'bg-teal-600 text-white hover:bg-teal-700'
                  }`}
                >
                  <i className={`fas ${followedMembers.includes(member.id) ? 'fa-user-check' : 'fa-user-plus'}`}></i>
                  {followedMembers.includes(member.id) ? 'Following' : 'Follow'}
                </button>
              </div>
            </div>
          ))}
        </div>
        
        {filteredMembers.length === 0 && (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <i className="fas fa-users text-4xl mb-4 opacity-50"></i>
            <p>No members found matching your criteria</p>
            <button onClick={() => { setSearchTerm(''); setMemberType('All Members'); setDepartment('All Departments'); setBatchFilter('All Batches'); }} className="mt-4 text-teal-600 hover:underline">Clear all filters</button>
          </div>
        )}
      </div>
    </div>
  )
}

export default Community
