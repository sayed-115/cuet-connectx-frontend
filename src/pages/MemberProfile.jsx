import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useState, useEffect } from 'react'

function MemberProfile() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isLoggedIn, isFollowingMember, followMember, unfollowMember } = useAuth()
  const [showShareToast, setShowShareToast] = useState(false)

  // Check if following this member
  const isFollowing = isFollowingMember(id)

  // Sample member data - in a real app this would come from an API
  const membersData = {
    1: { id: 1, name: 'Anupam Paul', studentId: '2204118', batch: '2022', department: 'CSE', initials: 'AP', type: 'Student', bio: 'Passionate about AI and Machine Learning. Looking for research opportunities.', skills: ['Python', 'Machine Learning', 'Data Science', 'React'], followers: 245, email: 'anupam.paul@cuet.ac.bd', address: 'Chittagong, Bangladesh', currentProfession: 'Student at CUET', researchInterests: ['Machine Learning', 'AI', 'Natural Language Processing'], education: [{ degree: 'B.Sc. in CSE', institution: 'CUET', year: '2022 - Present' }] },
    2: { id: 2, name: 'MD Abu Sayed', studentId: '2204115', batch: '2022', department: 'CSE', initials: 'AS', type: 'Student', bio: 'Passionate about AI and Machine Learning. Looking for research opportunities.', skills: ['JavaScript', 'React', 'Node.js', 'Python'], followers: 333, email: 'abu.sayed@cuet.ac.bd', address: 'Chittagong, Bangladesh', currentProfession: 'Student at CUET', researchInterests: ['Web Development', 'Full Stack', 'Cloud Computing'], education: [{ degree: 'B.Sc. in CSE', institution: 'CUET', year: '2022 - Present' }] },
    3: { id: 3, name: 'Fatima Rahman', studentId: '2304201', batch: '2023', department: 'EEE', initials: 'FR', type: 'Student', bio: 'Electronics enthusiast with interest in IoT and embedded systems.', skills: ['Arduino', 'IoT', 'Embedded Systems', 'C++'], followers: 180, email: 'fatima.rahman@cuet.ac.bd', address: 'Dhaka, Bangladesh', currentProfession: 'Student at CUET', researchInterests: ['IoT', 'Embedded Systems', 'Robotics'], education: [{ degree: 'B.Sc. in EEE', institution: 'CUET', year: '2023 - Present' }] },
    4: { id: 4, name: 'Karim Hassan', studentId: '2104306', batch: '2021', department: 'ME', initials: 'KH', type: 'Student', bio: 'Mechanical engineering student interested in robotics and automation.', skills: ['CAD', 'SolidWorks', 'Robotics', 'MATLAB'], followers: 370, email: 'karim.hassan@cuet.ac.bd', address: 'Chittagong, Bangladesh', currentProfession: 'Student at CUET', researchInterests: ['Robotics', 'Automation', 'Manufacturing'], education: [{ degree: 'B.Sc. in ME', institution: 'CUET', year: '2021 - Present' }] },
    5: { id: 5, name: 'Abir Hassan', studentId: '1904110', batch: '2018', department: 'CSE', initials: 'AH', type: 'Alumni', position: 'Lecturer at CUET', bio: 'Passionate educator and researcher in machine learning and software development.', skills: ['Machine Learning', 'Software Development', 'Teaching', 'Internet Programming'], followers: 520, email: 'abir.hassan@cuet.ac.bd', address: 'Chittagong, Bangladesh', currentProfession: 'Lecturer at CUET', previousProfession: 'Software Engineer at Tech Corp', researchInterests: ['Machine Learning', 'Deep Learning', 'Computer Vision'], education: [{ degree: 'M.Sc. in CSE', institution: 'CUET', year: '2020 - 2022' }, { degree: 'B.Sc. in CSE', institution: 'CUET', year: '2018 - 2022' }] },
    6: { id: 6, name: 'Fahim Hassan', studentId: '1104220', batch: '2007', department: 'CSE', initials: 'FH', type: 'Alumni', position: 'Data Scientist at DeepMind', bio: 'Working on cutting-edge AI research at one of the world\'s leading AI labs.', skills: ['Machine Learning', 'Python', 'TensorFlow', 'PyTorch', 'Research'], followers: 430, email: 'fahim.hassan@deepmind.com', address: 'London, UK', currentProfession: 'Data Scientist at DeepMind', previousProfession: 'ML Engineer at Google', researchInterests: ['Reinforcement Learning', 'AGI', 'Neural Networks'], education: [{ degree: 'Ph.D. in AI', institution: 'University of Cambridge', year: '2015 - 2019' }, { degree: 'B.Sc. in CSE', institution: 'CUET', year: '2007 - 2011' }] },
    7: { id: 7, name: 'Nusrat Jahan', studentId: '1904133', batch: '2019', department: 'CSE', initials: 'NJ', type: 'Alumni', position: 'Founder & CEO at TechStart BD', bio: 'Building the next generation of tech startups in Bangladesh.', skills: ['Business', 'Leadership', 'Marketing', 'Product Management', 'Fundraising'], followers: 680, email: 'nusrat@techstartbd.com', address: 'Dhaka, Bangladesh', currentProfession: 'Founder & CEO at TechStart BD', previousProfession: 'Product Manager at Pathao', researchInterests: ['Entrepreneurship', 'FinTech', 'EdTech'], education: [{ degree: 'MBA', institution: 'IBA, Dhaka University', year: '2021 - 2023' }, { degree: 'B.Sc. in CSE', institution: 'CUET', year: '2019 - 2023' }] },
  }

  const member = membersData[id]

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login')
    }
  }, [isLoggedIn, navigate])

  if (!member) {
    return (
      <div className="py-16 bg-gray-50 dark:bg-gray-900 min-h-screen">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <i className="fas fa-user-slash text-6xl text-gray-300 dark:text-gray-600 mb-4"></i>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Member Not Found</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">The member you're looking for doesn't exist or has been removed.</p>
          <button onClick={() => navigate('/community')} className="btn-primary">
            <i className="fas fa-arrow-left mr-2"></i> Back to Community
          </button>
        </div>
      </div>
    )
  }

  const handleFollow = () => {
    if (isFollowing) {
      unfollowMember(id)
    } else {
      followMember(id)
    }
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${member.name} - CUET ConnectX`,
        text: `Check out ${member.name}'s profile on CUET ConnectX`,
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      setShowShareToast(true)
      setTimeout(() => setShowShareToast(false), 3000)
    }
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen relative">
      {/* Share Toast */}
      {showShareToast && (
        <div className="fixed top-20 right-4 z-50 bg-emerald-500 text-white px-4 py-3 rounded-xl shadow-lg animate-fade-in-up flex items-center gap-2">
          <i className="fas fa-check-circle"></i> Profile link copied to clipboard!
        </div>
      )}

      {/* Cover */}
      <div className="h-48 bg-gradient-to-r from-teal-800 via-teal-600 to-teal-800 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '30px 30px'}}></div>
        </div>
      </div>

      {/* Profile Header */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative -mt-16">
          <div className="flex flex-col sm:flex-row items-start gap-4">
            {/* Avatar */}
            <div className="relative">
              <div className="w-28 h-28 rounded-full border-4 border-white dark:border-gray-800 shadow-lg bg-gradient-to-r from-teal-500 to-teal-600 flex items-center justify-center text-white text-3xl font-bold">
                {member.initials}
              </div>
              {/* Online indicator */}
              <div className="absolute bottom-1 right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-white dark:border-gray-800"></div>
            </div>

            {/* Info & Actions Row */}
            <div className="flex-1 flex flex-col sm:flex-row sm:items-end sm:justify-between w-full pt-2 sm:pt-4">
              <div>
                {/* Name */}
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white heading-font mb-2">{member.name}</h1>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    member.type === 'Student' 
                      ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400' 
                      : 'bg-teal-600 text-white'
                  }`}>
                    {member.type === 'Student' ? 'Current Student' : 'Alumni'}
                  </span>
                  <span className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-xs font-medium">
                    Batch {member.batch}
                  </span>
                  <span className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-xs font-medium">
                    {member.department}
                  </span>
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Student ID: {member.studentId}
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-2 mt-3 sm:mt-0">
                <button 
                  onClick={handleFollow}
                  className={`px-5 py-2.5 rounded-xl transition-all duration-200 flex items-center gap-2 text-sm font-medium ${
                    isFollowing 
                      ? 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600' 
                      : 'bg-teal-600 text-white hover:bg-teal-700'
                  }`}
                >
                  <i className={`fas ${isFollowing ? 'fa-user-check' : 'fa-user-plus'}`}></i>
                  {isFollowing ? 'Following' : 'Follow'}
                </button>
                <button 
                  onClick={handleShare}
                  className="px-5 py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 flex items-center gap-2 text-gray-700 dark:text-gray-300 text-sm font-medium"
                >
                  <i className="fas fa-share-alt"></i> Share
                </button>
              </div>
            </div>
          </div>

          {/* Followers */}
          <div className="mt-4 pb-4 border-b border-gray-200 dark:border-gray-700">
            <p className="text-2xl font-bold text-gray-800 dark:text-white">{member.followers + (isFollowing ? 1 : 0)}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Followers</p>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6 mt-6 pb-12">
          {/* Left Column */}
          <div className="space-y-6">
            {/* About */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">About</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                {member.bio}
              </p>
            </div>

            {/* Contact */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Contact Information</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-teal-100 dark:bg-teal-900/50 rounded-xl flex items-center justify-center">
                    <i className="fas fa-envelope text-teal-600 dark:text-teal-400"></i>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Email</p>
                    <a href={`mailto:${member.email}`} className="text-sm text-teal-600 dark:text-teal-400 hover:underline">{member.email}</a>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-teal-100 dark:bg-teal-900/50 rounded-xl flex items-center justify-center">
                    <i className="fas fa-map-marker-alt text-teal-600 dark:text-teal-400"></i>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Location</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{member.address}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Skills */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {member.skills.map((skill, idx) => (
                  <span key={idx} className="px-3 py-1.5 bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 rounded-lg text-sm font-medium border border-teal-200 dark:border-teal-800">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Professional Info */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Professional Information</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-teal-100 dark:bg-teal-900/50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <i className="fas fa-briefcase text-teal-600 dark:text-teal-400"></i>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Current Position</p>
                    <p className="text-sm font-medium text-gray-800 dark:text-white">{member.currentProfession}</p>
                  </div>
                </div>
                {member.previousProfession && (
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center flex-shrink-0">
                      <i className="fas fa-history text-gray-500 dark:text-gray-400"></i>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Previous Position</p>
                      <p className="text-sm text-gray-700 dark:text-gray-300">{member.previousProfession}</p>
                    </div>
                  </div>
                )}
                {member.researchInterests && member.researchInterests.length > 0 && (
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/50 rounded-xl flex items-center justify-center flex-shrink-0">
                      <i className="fas fa-flask text-amber-600 dark:text-amber-400"></i>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Research Interests</p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {member.researchInterests.map((interest, idx) => (
                          <span key={idx} className="px-2 py-1 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded text-xs">
                            {interest}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Education */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Education</h3>
              <div className="space-y-4">
                {member.education.map((edu, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                    <div className="w-10 h-10 bg-teal-100 dark:bg-teal-900/50 rounded-xl flex items-center justify-center flex-shrink-0">
                      <i className="fas fa-graduation-cap text-teal-600 dark:text-teal-400"></i>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-800 dark:text-white">{edu.degree}</h4>
                      <p className="text-sm text-teal-600 dark:text-teal-400">{edu.institution}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{edu.year}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Back to Community */}
            <div className="text-center pt-4">
              <button 
                onClick={() => navigate('/community')} 
                className="text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-2 mx-auto"
              >
                <i className="fas fa-arrow-left"></i> Back to Community
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MemberProfile
