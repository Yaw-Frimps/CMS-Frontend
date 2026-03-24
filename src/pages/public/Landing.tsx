import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Camera, Heart, Users, MapPin, Mail, Phone, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import churchInterior from '../../assets/church_interior_community.png';
import smallGroup from '../../assets/small_group_community.png';
import worship from '../../assets/joyful_worship_service.png';

const carouselImages = [
  {
    url: churchInterior,
    title: "A Community of Faith",
    subtitle: "Grow together in a space that loves and supports everyone."
  },
  {
    url: smallGroup,
    title: "Connect in Small Groups",
    subtitle: "Find your people and deepen your journey with others."
  },
  {
    url: worship,
    title: "Uplifting Worship",
    subtitle: "Experience joyful and vibrant services every Sunday."
  }
];


// NOTE: I need to move the images to frontend/src/assets first. 
// I'll do that in a separate step or just use the absolute paths if the dev server can serve them.
// High likely the dev server won't serve from the brain dir. I'll move them.

export default function Landing() {
  const { isAuthenticated } = useAuth();
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + carouselImages.length) % carouselImages.length);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 font-sans text-gray-900 dark:text-gray-100 selection:bg-primary-200 dark:selection:bg-primary-900/50 transition-colors duration-300">
      
      {/* Navbar */}
      <nav className="fixed w-full z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-13 h-13 bg-gradient-to-br from-primary-600 to-secondary-500 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-primary-500/30 group-hover:scale-110 transition-transform">
                POV
              </div>
              <span className="text-2xl font-extrabold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent transition-colors duration-300">People Of Vision</span>
            </Link>
            <div className="hidden md:flex space-x-8">
              <a href="#about" className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors">About Us</a>
              <a href="#gallery" className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors">Gallery</a>
              <a href="#contact" className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors">Contact</a>
            </div>
            <div className="flex items-center gap-4">
              {isAuthenticated ? (
                <Link to="/dashboard" className="px-5 py-2.5 bg-primary-600 text-white font-medium rounded-full shadow-md shadow-primary-500/25 hover:bg-primary-700 hover:-translate-y-0.5 transition-all">
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link to="/login" className="text-gray-700 dark:text-gray-200 font-medium hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Log in</Link>
                  <Link to="/register" className="px-5 py-2.5 bg-primary-600 text-white font-medium rounded-full shadow-md shadow-primary-500/25 hover:bg-primary-700 hover:-translate-y-0.5 transition-all">
                    Sign up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section with Carousel */}
      <section className="relative h-screen min-h-[700px] flex items-center justify-center overflow-hidden">
        {/* Carousel Background */}
        <div className="absolute inset-0 z-0">
          <AnimatePresence initial={false}>
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
              className="absolute inset-0"
            >
              <div className="absolute inset-0 bg-black/40 z-10" /> {/* Dark overlay */}
              <img 
                src={carouselImages[currentSlide].url} 
                alt={carouselImages[currentSlide].title}
                className="w-full h-full object-cover"
              />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Content */}
        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <motion.div
            key={`content-${currentSlide}`}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 drop-shadow-lg">
              <span className="block">{carouselImages[currentSlide].title}</span>
              <span className="block bg-gradient-to-r from-primary-400 to-secondary-300 bg-clip-text text-transparent mt-2">People Of Vision International</span>
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-xl text-gray-100 drop-shadow-md">
              {carouselImages[currentSlide].subtitle}
            </p>
            <div className="mt-10 flex justify-center gap-4">
              <Link to={isAuthenticated ? '/dashboard' : '/register'} className="px-8 py-4 bg-white text-gray-900 text-lg font-medium rounded-full shadow-xl hover:bg-gray-100 hover:-translate-y-1 transition-all flex items-center gap-2">
                Join Our Community <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Carousel Controls */}
        <div className="absolute bottom-10 left-0 right-0 z-30 flex justify-center items-center gap-6">
          <button 
            type="button"
            onClick={prevSlide}
            aria-label="Previous slide"
            className="p-3 rounded-full bg-white/10 backdrop-blur-md text-white hover:bg-white/20 transition-all border border-white/20"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          
          <div className="flex gap-2">
            {carouselImages.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentSlide(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                className={`w-3 h-3 rounded-full transition-all ${idx === currentSlide ? 'bg-primary-500 w-8' : 'bg-white/30 hover:bg-white/50'}`}
              />
            ))}
          </div>

          <button 
            type="button"
            onClick={nextSlide}
            aria-label="Next slide"
            className="p-3 rounded-full bg-white/10 backdrop-blur-md text-white hover:bg-white/20 transition-all border border-white/20"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </section>

      {/* About Us */}
      <section id="about" className="py-24 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl transition-colors duration-300">About Us</h2>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 dark:text-gray-400 mx-auto transition-colors duration-300">Who we are and what we believe.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm hover:shadow-md transition-all duration-300">
              <div className="w-14 h-14 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-2xl flex items-center justify-center mb-6 transition-colors duration-300">
                <Heart className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white transition-colors duration-300">Our Mission</h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed transition-colors duration-300">To love God, love people, and make a positive impact in our local community and beyond through acts of service and faith.</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm hover:shadow-md transition-all duration-300">
              <div className="w-14 h-14 bg-secondary-100 dark:bg-secondary-900/30 text-secondary-600 dark:text-secondary-400 rounded-2xl flex items-center justify-center mb-6 transition-colors duration-300">
                <Users className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white transition-colors duration-300">Our Community</h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed transition-colors duration-300">A diverse family of believers from all walks of life, united by grace. We offer small groups, youth programs, and support networks.</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm hover:shadow-md transition-all duration-300">
              <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mb-6 transition-colors duration-300">
                <MapPin className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white transition-colors duration-300">Our Vision</h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed transition-colors duration-300">Creating a welcoming space where anyone can encounter truth, find purpose, and discover their unique calling.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section id="gallery" className="py-24 bg-white dark:bg-gray-950 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl transition-colors duration-300">Gallery</h2>
              <p className="mt-4 text-xl text-gray-500 dark:text-gray-400 transition-colors duration-300">Moments from our church life.</p>
            </div>
            <div className="hidden sm:flex w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full items-center justify-center text-gray-400 dark:text-gray-500 transition-colors duration-300">
              <Camera className="w-6 h-6" />
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="col-span-2 row-span-2 group overflow-hidden rounded-3xl relative h-96">
              <img src="https://images.unsplash.com/photo-1438283173091-5dbf5c5a3206?q=80&w=1000&auto=format&fit=crop" alt="Church Service" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-8">
                <p className="text-white font-bold text-xl">Sunday Worship</p>
              </div>
            </div>
            <div className="group overflow-hidden rounded-3xl relative h-44 md:h-auto">
              <img src="https://images.unsplash.com/photo-1511632765486-a01980e01a18?q=80&w=1000&auto=format&fit=crop" alt="Community" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
            </div>
            <div className="group overflow-hidden rounded-3xl relative h-44 md:h-auto">
              <img src="https://images.unsplash.com/photo-1529070538774-1843cb3265df?q=80&w=1000&auto=format&fit=crop" alt="Youth Group" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
            </div>
            <div className="col-span-2 group overflow-hidden rounded-3xl relative h-44 md:h-48">
              <img src="https://images.unsplash.com/photo-1473186578172-c141e6798cf4?q=80&w=1000&auto=format&fit=crop" alt="Baptism" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-24 bg-gray-900 dark:bg-black text-white transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
            <div>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-6">Get in Touch</h2>
              <p className="text-gray-400 text-lg mb-8 max-w-md">Have questions? Need prayer? We'd love to hear from you. Reach out to our pastoral team anytime.</p>
              
              <div className="space-y-6">
                <div className="flex items-center gap-4 text-gray-300">
                  <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center text-primary-400 transition-colors duration-300">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium text-white">Visit Us</p>
                    <p>123 Faith Avenue, Cityville, ST 12345</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-gray-300">
                  <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center text-primary-400 transition-colors duration-300">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium text-white">Call Us</p>
                    <p>(555) 123-4567</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-gray-300">
                  <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center text-primary-400 transition-colors duration-300">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium text-white">Email Us</p>
                    <p>peopleofvisioninternational@gmail.com</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800 dark:bg-gray-900 border border-transparent dark:border-gray-800 p-8 rounded-3xl transition-colors duration-300">
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Name</label>
                  <input type="text" placeholder="Enter your name" className="w-full bg-gray-900 dark:bg-black border border-gray-700 dark:border-gray-800 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-primary-500 outline-none transition-all duration-300" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
                  <input type="email" placeholder="Enter your email" className="w-full bg-gray-900 dark:bg-black border border-gray-700 dark:border-gray-800 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-primary-500 outline-none transition-all duration-300" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Message</label>
                  <textarea rows={4} placeholder="Enter your message" className="w-full bg-gray-900 dark:bg-black border border-gray-700 dark:border-gray-800 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-primary-500 outline-none transition-all duration-300 resize-none"></textarea>
                </div>
                <button type="button" className="w-full py-4 bg-primary-600 text-white font-medium rounded-xl hover:bg-primary-700 transition-colors">
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-gray-950 dark:bg-black py-8 text-center text-gray-500 text-sm transition-colors duration-300">
        <p>&copy; {new Date().getFullYear()} People Of Vision International. All rights reserved.</p>
      </footer>
    </div>
  );
}
