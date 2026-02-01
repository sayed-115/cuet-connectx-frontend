function About() {
  const objectives = [
    { number: '01', title: 'Verified Digital Network', desc: 'Create a centralized and verified digital network exclusively for CUET students and alumni, ensuring authentic connections within our community.', icon: 'fa-network-wired' },
    { number: '02', title: 'Mentorship & Guidance', desc: 'Enable meaningful mentorship relationships and roadmap sharing based on real-life career experiences from successful alumni.', icon: 'fa-user-graduate' },
    { number: '03', title: 'Academic Collaboration', desc: 'Facilitate academic, research, and professional collaboration among CUETians to advance knowledge and innovation.', icon: 'fa-users-cog' },
    { number: '04', title: 'Career Opportunities', desc: 'Provide students with access to career advice, scholarships, internships, and job opportunities shared by the community.', icon: 'fa-briefcase' },
    { number: '05', title: 'Alumni Engagement', desc: 'Encourage active alumni participation in supporting students through knowledge sharing, funding opportunities, and professional networking.', icon: 'fa-handshake' },
    { number: '06', title: 'Lifelong Connection', desc: 'Strengthen the CUET alumni association and promote a culture of lifelong connection, support, and community engagement.', icon: 'fa-link' },
  ]

  const features = [
    { icon: 'fa-user-check', title: 'Verified User Profiles', desc: 'Every user undergoes email verification to ensure authenticity. Profiles include comprehensive information about academic background, skills, research interests, professional experience, and contact details. The platform automatically identifies users as students or alumni based on their student ID.' },
    { icon: 'fa-id-card', title: 'Comprehensive Profiles', desc: 'Users can create detailed profiles with photos, professional information, education history, research interests, and social media links. Profiles include follower counts and enable networking through our follow system.' },
    { icon: 'fa-briefcase', title: 'Job Opportunities Portal', desc: 'A dedicated space for posting and discovering job opportunities. Users can search and filter jobs by type, location, and experience level. Each posting includes detailed information and direct application links.' },
    { icon: 'fa-graduation-cap', title: 'Scholarship Database', desc: 'Centralized repository of scholarship opportunities with comprehensive details including eligibility, funding details, deadlines, and application links. Community members can contribute by sharing new opportunities.' },
  ]

  const howItWorks = [
    { step: '1', title: 'Sign Up & Verify', desc: 'Create your account using your CUET student ID and verify your email address.', icon: 'fa-user-plus' },
    { step: '2', title: 'Build Your Profile', desc: 'Complete your profile with academic background, skills, and professional information.', icon: 'fa-edit' },
    { step: '3', title: 'Connect & Collaborate', desc: 'Find mentors, explore opportunities, and engage with the CUET community.', icon: 'fa-handshake' },
  ]

  const stats = [
    { number: '1000+', label: 'Active Members', icon: 'fa-users' },
    { number: '500+', label: 'Job Opportunities Shared', icon: 'fa-briefcase' },
    { number: '200+', label: 'Scholarship Listings', icon: 'fa-graduation-cap' },
    { number: '5000+', label: 'Connections Made', icon: 'fa-link' },
  ]

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Hero Section */}
      <section className="relative py-16 bg-gradient-to-br from-teal-800 via-teal-700 to-teal-800 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px'}}></div>
        </div>
        
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative text-center">
          <h1 className="text-4xl md:text-5xl font-bold heading-font mb-4">About CUET ConnectX</h1>
          <p className="text-xl text-teal-100 max-w-3xl mx-auto">
            Building Bridges, Creating Opportunities, Strengthening the CUET Community
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1">
              <h2 className="text-3xl font-bold heading-font text-gray-800 dark:text-white mb-6">Our Mission</h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                CUET ConnectX is dedicated to creating a vibrant, interconnected community of CUET students and alumni that transcends geographical boundaries and fosters lifelong relationships.
              </p>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                We believe in the power of connection—connecting students with mentors, connecting talent with opportunities, and connecting ideas with resources. Our platform serves as the digital backbone of the CUET community, enabling every member to contribute to and benefit from our collective knowledge and experience.
              </p>
            </div>
            <div className="flex-shrink-0">
              <div className="w-48 h-48 bg-gradient-to-br from-teal-100 to-teal-200 dark:from-teal-900 dark:to-teal-800 rounded-full flex items-center justify-center">
                <div className="w-32 h-32 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-lg">
                  <div className="w-16 h-16 bg-teal-600 rounded-full flex items-center justify-center">
                    <div className="w-6 h-6 bg-white rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Objectives Section */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold heading-font text-gray-800 dark:text-white">Our Objectives</h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {objectives.map((obj, idx) => (
              <div key={idx} className="p-6 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-700">
                <div className="flex items-start gap-4 mb-3">
                  <div className="w-10 h-10 bg-teal-100 dark:bg-teal-900/50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <i className={`fas ${obj.icon} text-teal-600 dark:text-teal-400`}></i>
                  </div>
                  <span className="text-4xl font-bold text-gray-200 dark:text-gray-700">{obj.number}</span>
                </div>
                <h3 className="font-semibold text-gray-800 dark:text-white mb-2">{obj.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{obj.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Features Section */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold heading-font text-gray-800 dark:text-white">Platform Features</h2>
          </div>
          
          <div className="space-y-6">
            {features.map((feature, idx) => (
              <div key={idx} className="flex gap-4 p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                <div className="flex-shrink-0 w-12 h-12 bg-teal-600 rounded-full flex items-center justify-center">
                  <i className={`fas ${feature.icon} text-white text-lg`}></i>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 dark:text-white mb-2 text-lg">{feature.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold heading-font text-gray-800 dark:text-white">How It Works</h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {howItWorks.map((step, idx) => (
              <div key={idx} className="text-center p-6 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-700 relative">
                <div className="absolute -top-3 left-6 w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {step.step}
                </div>
                <div className="w-16 h-16 bg-teal-100 dark:bg-teal-900/50 rounded-2xl flex items-center justify-center mx-auto mb-4 mt-4">
                  <i className={`fas ${step.icon} text-teal-600 dark:text-teal-400 text-2xl`}></i>
                </div>
                <h3 className="font-semibold text-gray-800 dark:text-white mb-2">{step.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{step.desc}</p>
                {idx < howItWorks.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <i className="fas fa-arrow-right text-gray-300 dark:text-gray-600"></i>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold heading-font text-gray-800 dark:text-white">Our Impact</h2>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, idx) => (
              <div key={idx} className="text-center p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                <div className="w-14 h-14 bg-teal-100 dark:bg-teal-900/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <i className={`fas ${stat.icon} text-teal-600 dark:text-teal-400 text-xl`}></i>
                </div>
                <h3 className="text-3xl font-bold text-teal-600 dark:text-teal-400 mb-1">{stat.number}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Vision Section */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold heading-font text-gray-800 dark:text-white">Our Vision for the Future</h2>
          </div>
          
          <div className="prose dark:prose-invert max-w-none">
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
              We envision CUET ConnectX as more than just a platform—it's a movement to transform how CUETians support each other throughout their academic and professional journeys. By leveraging technology to foster genuine connections, we aim to create an ecosystem where every student has access to the guidance, opportunities, and resources they need to succeed.
            </p>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              As we grow, we're committed to continuously improving our platform based on community feedback, adding new features that serve our members' evolving needs, and maintaining the highest standards of security and user experience.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}

export default About
