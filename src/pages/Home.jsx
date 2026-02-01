import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import cuetLogo from '../assets/logos/CUET_Vector_Logo.svg.png'

// Import CUET campus images
import aboveImg from '../assets/images/above.jpg'
import centralfieldImg from '../assets/images/centralfield.jpg'
import flowerImg from '../assets/images/flower.jpg'
import gateImg from '../assets/images/gate.jpg'
import gymImg from '../assets/images/gym.jpg'
import incubatorImg from '../assets/images/incubator.jpg'
import monumentImg from '../assets/images/monument.jpg'
import registryImg from '../assets/images/registry.jpg'
import tscImg from '../assets/images/TSC.jpg'

function Home() {
  // Background slideshow images - CUET Campus
  const heroImages = [
    { src: gateImg, alt: 'CUET Main Gate' },
    { src: aboveImg, alt: 'CUET Aerial View' },
    { src: centralfieldImg, alt: 'CUET Central Field' },
    { src: monumentImg, alt: 'CUET Monument' },
    { src: tscImg, alt: 'CUET TSC' },
    { src: registryImg, alt: 'CUET Registry Building' },
    { src: incubatorImg, alt: 'CUET IT Incubator' },
    { src: gymImg, alt: 'CUET Gymnasium' },
    { src: flowerImg, alt: 'CUET Campus Flowers' },
  ]

  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  // Auto-change background every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === heroImages.length - 1 ? 0 : prevIndex + 1
      )
    }, 5000) // Change every 5 seconds

    return () => clearInterval(interval)
  }, [heroImages.length])

  const features = [
    { icon: 'fa-briefcase', title: 'Job Opportunities', desc: 'Access exclusive job postings and career opportunities from our extensive CUET alumni network across the globe', color: 'from-teal-500 to-teal-600' },
    { icon: 'fa-graduation-cap', title: 'Scholarships', desc: 'Discover funding opportunities, research grants, and educational scholarships tailored for CUETians', color: 'from-teal-600 to-teal-700' },
    { icon: 'fa-users', title: 'Community', desc: 'Connect with 10,000+ students and alumni worldwide through our vibrant community platform', color: 'from-teal-500 to-emerald-600' },
    { icon: 'fa-calendar-alt', title: 'Events & Meetups', desc: 'Stay updated with CUET events, reunions, webinars, and networking meetups in your city', color: 'from-emerald-500 to-teal-600' },
  ]

  const stats = [
    { number: '10,000+', label: 'Active Members', icon: 'fa-users' },
    { number: '500+', label: 'Job Placements', icon: 'fa-briefcase' },
    { number: '50+', label: 'Countries', icon: 'fa-globe' },
    { number: '100+', label: 'Partner Companies', icon: 'fa-building' },
  ]

  return (
    <div>
      {/* Hero Section with Background Slideshow */}
      <section className="relative overflow-hidden min-h-[90vh] flex items-center text-white">
        {/* Background Images */}
        {heroImages.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentImageIndex ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <img
              src={image.src}
              alt={image.alt}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
        
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900/90 via-teal-900/80 to-gray-900/70"></div>
        
        {/* Animated gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent"></div>
        
        {/* Floating elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-teal-500/20 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-teal-400/10 rounded-full blur-3xl animate-pulse-slow"></div>
        
        {/* Slide Indicators */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {heroImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentImageIndex 
                  ? 'bg-teal-400 w-8' 
                  : 'bg-white/50 hover:bg-white/80'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 py-20">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
            {/* Content */}
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-teal-500/20 border border-teal-500/30 rounded-full px-4 py-2 mb-6 animate-fade-in-up backdrop-blur-sm">
                <span className="w-2 h-2 bg-teal-400 rounded-full animate-pulse"></span>
                <span className="text-sm font-medium text-teal-300">Trusted by 10,000+ CUETians worldwide</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold heading-font mb-6 animate-fade-in-up stagger-1 drop-shadow-lg">
                Connect with CUETians
                <span className="block mt-2 bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent">Worldwide</span>
              </h1>
              
              <p className="text-lg md:text-xl text-gray-200 mb-8 max-w-2xl animate-fade-in-up stagger-2 drop-shadow">
                Join CUET ConnectX — The premier platform for students and alumni to network, discover opportunities, and build lasting professional relationships.
              </p>
              
              <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4 animate-fade-in-up stagger-3">
                <Link to="/signup" className="btn-primary inline-flex items-center justify-center gap-2 text-lg shadow-xl">
                  Get Started Free <i className="fas fa-arrow-right"></i>
                </Link>
                <Link to="/about" className="px-8 py-3 border-2 border-white/30 text-white font-semibold rounded-xl hover:bg-white/10 hover:border-white/50 transition-all duration-200 inline-flex items-center justify-center gap-2 backdrop-blur-sm">
                  <i className="fas fa-play-circle"></i> Learn More
                </Link>
              </div>
            </div>
            
            {/* Logo/Visual */}
            <div className="flex-shrink-0 animate-fade-in-up stagger-4">
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full blur-2xl opacity-40 animate-pulse-slow"></div>
                <div className="relative bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 shadow-2xl">
                  <img src={cuetLogo} alt="CUET Logo" className="w-48 h-48 md:w-64 md:h-64 object-contain drop-shadow-lg" />
                </div>
              </div>
            </div>
          </div>
          
          {/* Stats Bar */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8">
            {stats.map((stat, idx) => (
              <div key={idx} className="text-center p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 animate-fade-in-up shadow-lg" style={{animationDelay: `${0.5 + idx * 0.1}s`}}>
                <i className={`fas ${stat.icon} text-teal-400 text-2xl mb-2`}></i>
                <div className="text-2xl md:text-3xl font-bold text-white">{stat.number}</div>
                <div className="text-sm text-gray-300">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="inline-block px-4 py-1.5 bg-teal-100 dark:bg-teal-900/50 text-teal-700 dark:text-teal-400 text-sm font-semibold rounded-full mb-4">Why Choose Us</span>
            <h2 className="text-3xl md:text-4xl font-bold heading-font text-gray-800 dark:text-white mb-4">
              Everything You Need to <span className="gradient-text">Succeed</span>
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              CUET ConnectX provides all the tools and resources to help you connect, grow, and achieve your professional goals.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, idx) => (
              <div key={idx} className="card-professional p-6 group">
                <div className={`w-14 h-14 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                  <i className={'fas ' + feature.icon + ' text-2xl text-white'}></i>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-3">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{feature.desc}</p>
                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                  <Link to={feature.title === 'Job Opportunities' ? '/jobs' : feature.title === 'Scholarships' ? '/scholarships' : feature.title === 'Community' ? '/community' : '/about'} className="text-teal-600 dark:text-teal-400 text-sm font-medium inline-flex items-center gap-1 group-hover:gap-2 transition-all duration-200">
                    Learn more <i className="fas fa-arrow-right text-xs"></i>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial/Trust Section */}
      <section className="py-20 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-teal-600 to-teal-500 rounded-3xl p-8 md:p-12 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2"></div>
            
            <div className="relative flex flex-col md:flex-row items-center gap-8">
              <div className="flex-shrink-0">
                <img src={cuetLogo} alt="CUET" className="w-24 h-24 bg-white rounded-2xl p-2" />
              </div>
              <div className="text-center md:text-left flex-1">
                <h3 className="text-2xl md:text-3xl font-bold heading-font mb-3">Join the Largest CUET Network</h3>
                <p className="text-teal-100 max-w-2xl">
                  Be part of a thriving community of engineers, innovators, and leaders. Whether you are a current student or a distinguished alumni, there is a place for you here.
                </p>
              </div>
              <Link to="/signup" className="flex-shrink-0 px-8 py-4 bg-white text-teal-700 font-semibold rounded-xl hover:bg-gray-100 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105">
                Join Now — It's Free
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-gray-900 via-teal-900 to-gray-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px'}}></div>
        </div>
        
        <div className="max-w-4xl mx-auto text-center px-4 relative">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-teal-500/20 rounded-full mb-6">
            <i className="fas fa-rocket text-3xl text-teal-400"></i>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold heading-font mb-4">Ready to Start Your Journey?</h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Create your free account today and unlock access to exclusive opportunities, mentorship programs, and a global network of CUETians.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/signup" className="btn-primary inline-flex items-center justify-center gap-2 text-lg">
              Create Free Account <i className="fas fa-arrow-right"></i>
            </Link>
            <Link to="/community" className="px-8 py-3 border-2 border-white/30 text-white font-semibold rounded-xl hover:bg-white/10 transition-all duration-200 inline-flex items-center justify-center gap-2">
              Explore Community
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
