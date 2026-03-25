import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api, getImageUrl } from '../../services/api';
import { Heart, Users, MapPin, Mail, Phone, ArrowRight, ChevronLeft, ChevronRight, Loader2, Calendar, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import churchInterior from '../../assets/church_interior_community.png';
import smallGroup from '../../assets/small_group_community.png';
import worship from '../../assets/joyful_worship_service.png';

interface GalleryImage {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
}

export default function Landing() {
  const { isAuthenticated } = useAuth();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [heroImages, setHeroImages] = useState<GalleryImage[]>([]);
  const [landingGallery, setLandingGallery] = useState<GalleryImage[]>([]);
  const [publicEvents, setPublicEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [heroRes, galleryRes, eventsRes] = await Promise.all([
          api.get('/gallery/hero'),
          api.get('/gallery/landing'),
          api.get('/events')
        ]);
        setHeroImages(heroRes.data);
        setLandingGallery(galleryRes.data);
        
        const upcoming = eventsRes.data
            .filter((e: any) => new Date(e.startTime) >= new Date())
            .sort((a: any, b: any) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
            .slice(0, 3);
        setPublicEvents(upcoming);
      } catch (err) {
        console.error('Failed to fetch landing data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const displayCarousel = useMemo(() => 
    heroImages.length > 0 ? heroImages : [
      { id: 1, imageUrl: churchInterior, title: "A Community of Faith", description: "Grow together in a space that loves and supports everyone." },
      { id: 2, imageUrl: smallGroup, title: "Connect in Small Groups", description: "Find your people and deepen your journey with others." },
      { id: 3, imageUrl: worship, title: "Uplifting Worship", description: "Experience joyful and vibrant services every Sunday." }
    ]
  , [heroImages]);

  useEffect(() => {
    if (displayCarousel.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % displayCarousel.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [displayCarousel]);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % displayCarousel.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + displayCarousel.length) % displayCarousel.length);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 font-sans text-gray-900 dark:text-gray-100 selection:bg-primary-200 dark:selection:bg-primary-900/50 transition-colors duration-300">
      
      {/* Navbar */}
      <nav className="fixed w-full z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <Link to="/" className="flex items-center gap-3 group h-full py-2">
              <img src="/logo.png" alt="People Of Vision Logo" className="h-10 md:h-12 object-contain group-hover:scale-105 transition-transform duration-300 drop-shadow-sm" />
              <span className="hidden md:inline text-xl font-extrabold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent transition-colors duration-300">People Of Vision International</span>
            </Link>
            <div className="hidden md:flex space-x-8">
              <a href="#about" className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors">About Us</a>
              <a href="#events" className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors">Events</a>
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
              <div className="absolute inset-0 bg-black/40 z-10" />
              <img 
                src={getImageUrl(displayCarousel[currentSlide].imageUrl) || displayCarousel[currentSlide].imageUrl} 
                alt={displayCarousel[currentSlide].title}
                className="w-full h-full object-cover"
              />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Content */}
        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white pointer-events-none">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="pointer-events-auto"
          >
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 drop-shadow-lg">
              <span className="block">Welcome to</span>
              <span className="block bg-gradient-to-r from-primary-400 to-secondary-300 bg-clip-text text-transparent mt-2">People Of Vision International</span>
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-xl text-gray-100 drop-shadow-md">
              A vibrant community of faith where everyone is loved and supported to discover their unique purpose.
            </p>
            <div className="mt-10 flex justify-center gap-4">
              <Link to={isAuthenticated ? '/dashboard' : '/register'} className="px-8 py-4 bg-white text-gray-900 text-lg font-medium rounded-full shadow-xl hover:bg-gray-100 hover:-translate-y-1 transition-all flex items-center gap-2">
                Join Our Community <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Carousel Controls */}
        {displayCarousel.length > 1 && (
          <div className="absolute bottom-10 left-0 right-0 z-30 flex justify-center items-center gap-6">
            <button 
              type="button"
              onClick={prevSlide}
              className="p-3 rounded-full bg-white/10 backdrop-blur-md text-white hover:bg-white/20 transition-all border border-white/20"
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            
            <div className="flex gap-2">
              {displayCarousel.map((_, idx) => (
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
              className="p-3 rounded-full bg-white/10 backdrop-blur-md text-white hover:bg-white/20 transition-all border border-white/20"
              aria-label="Next slide"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        )}
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

      {/* Events Section */}
      <section id="events" className="py-24 bg-white dark:bg-gray-950 transition-colors duration-300 relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-800 to-transparent"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-16">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl transition-colors duration-300">Upcoming Events</h2>
              <p className="mt-4 text-xl text-gray-500 dark:text-gray-400 transition-colors duration-300">Join us in fellowship and community building.</p>
            </div>
          </div>

          {loading ? (
             <div className="flex justify-center py-12">
               <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
             </div>
          ) : publicEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {publicEvents.map((event) => (
                <motion.div
                  key={event.id}
                  whileHover={{ y: -8 }}
                  className="bg-gray-50 dark:bg-gray-900 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-800"
                >
                  <div className="relative h-56 w-full bg-gray-200 dark:bg-gray-800">
                    {event.imageUrl ? (
                      <img src={getImageUrl(event.imageUrl) || ''} alt={event.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Calendar className="w-12 h-12 text-gray-400 dark:text-gray-600" />
                      </div>
                    )}
                    <div className="absolute top-4 left-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md px-4 py-2 rounded-2xl text-center shadow-lg border border-gray-100 dark:border-gray-700">
                      <p className="text-[10px] font-black text-primary-600 dark:text-primary-400 uppercase tracking-widest leading-none mb-1">
                        {new Date(event.startTime).toLocaleString('default', { month: 'short' })}
                      </p>
                      <p className="text-2xl font-black text-gray-900 dark:text-white leading-none">
                        {new Date(event.startTime).getDate()}
                      </p>
                    </div>
                  </div>
                  <div className="p-8">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 line-clamp-1">{event.title}</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 line-clamp-2">{event.description}</p>
                    
                    <div className="space-y-4">
                      <div className="flex items-center text-sm font-medium text-gray-600 dark:text-gray-300">
                        <div className="w-8 h-8 rounded-xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center mr-3">
                          <Clock className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                        </div>
                        {new Date(event.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <div className="flex items-center text-sm font-medium text-gray-600 dark:text-gray-300">
                        <div className="w-8 h-8 rounded-xl bg-secondary-50 dark:bg-secondary-900/20 flex items-center justify-center mr-3">
                          <MapPin className="w-4 h-4 text-secondary-600 dark:text-secondary-400" />
                        </div>
                        {event.location}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
             <div className="text-center py-20 bg-gray-50 dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800">
               <Calendar className="w-12 h-12 mx-auto text-gray-400 mb-4" />
               <h3 className="text-lg font-medium text-gray-900 dark:text-white">No Upcoming Events</h3>
               <p className="mt-2 text-gray-500">Check back later for new gatherings and services.</p>
             </div>
          )}
        </div>
      </section>

      {/* Gallery Section */}
      <section id="gallery" className="py-24 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl transition-colors duration-300">Gallery Highlights</h2>
              <p className="mt-4 text-xl text-gray-500 dark:text-gray-400 transition-colors duration-300">Moments from our church life.</p>
            </div>
            <Link 
              to="/gallery"
              className="hidden sm:flex items-center gap-2 px-6 py-3 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-full hover:bg-primary-600 hover:text-white transition-all group"
            >
              View Full Gallery
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          
          {loading ? (
             <div className="flex justify-center py-12">
               <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
             </div>
          ) : landingGallery.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {landingGallery.map((img) => (
                <motion.div
                  key={img.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  whileHover={{ y: -5 }}
                  className="relative overflow-hidden rounded-2xl group aspect-square shadow-sm"
                >
                  <img 
                    src={getImageUrl(img.imageUrl) || ''} 
                    alt={img.title} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                    <p className="text-white font-bold text-sm truncate">{img.title}</p>
                    <p className="text-gray-200 text-xs line-clamp-1">{img.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4">
              <div className="group overflow-hidden rounded-2xl relative aspect-square">
                <img src="https://images.unsplash.com/photo-1438283173091-5dbf5c5a3206?q=80&w=1000&auto=format&fit=crop" alt="Church Service" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                  <p className="text-white font-bold text-sm">Sunday Worship</p>
                </div>
              </div>
              <div className="group overflow-hidden rounded-2xl relative aspect-square">
                <img src="https://images.unsplash.com/photo-1511632765486-a01980e01a18?q=80&w=1000&auto=format&fit=crop" alt="Community" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              </div>
              <div className="group overflow-hidden rounded-2xl relative aspect-square">
                <img src="https://images.unsplash.com/photo-1529070538774-1843cb3265df?q=80&w=1000&auto=format&fit=crop" alt="Youth Group" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              </div>
              <div className="group overflow-hidden rounded-2xl relative aspect-square">
                <img src="https://images.unsplash.com/photo-1473186578172-c141e6798cf4?q=80&w=1000&auto=format&fit=crop" alt="Baptism" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              </div>
              <div className="group overflow-hidden rounded-2xl relative aspect-square">
                <img src="https://images.unsplash.com/photo-1454165833267-02300a496031?q=80&w=1000&auto=format&fit=crop" alt="Outreach" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              </div>
            </div>
          )}

          <div className="mt-12 text-center sm:hidden">
            <Link 
              to="/gallery"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-full font-bold shadow-lg shadow-primary-500/20"
            >
              View Full Gallery
              <ArrowRight className="w-4 h-4" />
            </Link>
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
