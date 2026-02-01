import { useState } from 'react'

function FAQ() {
  const [openIndex, setOpenIndex] = useState(null)
  
  const faqs = [
    { q: 'What is CUET ConnectX?', a: 'CUET ConnectX is a comprehensive platform that connects current students and alumni of Chittagong University of Engineering and Technology (CUET). It provides networking opportunities, job listings, scholarship information, and community features.', icon: 'fa-info-circle' },
    { q: 'Who can join CUET ConnectX?', a: 'Any current student or alumni of CUET can join the platform by registering with their valid 7-digit student ID. We verify all members to ensure a trusted community.', icon: 'fa-user-plus' },
    { q: 'How do I find job opportunities?', a: 'Navigate to the Jobs page from the main menu to browse all available opportunities. You can search and filter jobs by title, company, or location. Click "Apply" on any job to express your interest.', icon: 'fa-briefcase' },
    { q: 'How can I post a job or scholarship?', a: 'Alumni members can post job opportunities and scholarships through their profile dashboard after logging in. Click on "Post Opportunity" in your profile menu to get started.', icon: 'fa-plus-circle' },
    { q: 'Is CUET ConnectX free to use?', a: 'Yes! CUET ConnectX is completely free for all CUET students and alumni. Our mission is to strengthen the CUET community without any barriers.', icon: 'fa-gift' },
    { q: 'How do I connect with other members?', a: 'Visit the Community page to browse member profiles. Click the "Connect" button on any profile to send a connection request. Once accepted, you can message each other directly.', icon: 'fa-users' },
  ]

  return (
    <div className="py-16 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-1.5 bg-teal-100 dark:bg-teal-900/50 text-teal-700 dark:text-teal-400 text-sm font-semibold rounded-full mb-4">Support</span>
          <h1 className="text-3xl md:text-4xl font-bold heading-font text-gray-800 dark:text-white mb-4">Frequently Asked Questions</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">Find answers to common questions about CUET ConnectX</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div key={idx} className="card-professional overflow-hidden">
              <button
                onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                className="w-full px-6 py-5 text-left flex justify-between items-center gap-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-teal-100 dark:bg-teal-900/50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <i className={`fas ${faq.icon} text-teal-600 dark:text-teal-400`}></i>
                  </div>
                  <span className="font-medium text-gray-800 dark:text-white">{faq.q}</span>
                </div>
                <i className={`fas fa-chevron-down text-teal-500 transition-transform duration-300 ${openIndex === idx ? 'rotate-180' : ''}`}></i>
              </button>
              <div className={`overflow-hidden transition-all duration-300 ${openIndex === idx ? 'max-h-48' : 'max-h-0'}`}>
                <div className="px-6 pb-5 pl-20 text-gray-600 dark:text-gray-400 leading-relaxed">
                  {faq.a}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">Still have questions?</p>
          <a href="mailto:support@cuetconnectx.com" className="btn-primary inline-flex items-center gap-2">
            <i className="fas fa-envelope"></i> Contact Support
          </a>
        </div>
      </div>
    </div>
  )
}

export default FAQ
