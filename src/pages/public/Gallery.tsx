import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api, getImageUrl } from '../../services/api';
import { Loader2, ArrowLeft, Image as ImageIcon } from 'lucide-react';
import { motion } from 'framer-motion';

interface GalleryImage {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  uploadedAt: string;
}

export default function Gallery() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const res = await api.get('/gallery/public');
        setImages(res.data);
      } catch (error) {
        console.error('Failed to fetch gallery', error);
      } finally {
        setLoading(false);
      }
    };
    fetchGallery();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      {/* Navbar */}
      <nav className="fixed w-full z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <Link to="/" className="flex items-center gap-2 group">
              <ArrowLeft className="w-5 h-5 text-gray-500 group-hover:text-primary-600 transition-colors" />
              <span className="text-xl font-bold text-gray-900 dark:text-white">Back to Home</span>
            </Link>
            <h1 className="text-2xl font-extrabold bg-gradient-to-r from-primary-600 to-secondary-500 bg-clip-text text-transparent">
              Media Gallery
            </h1>
            <div className="w-10"></div> {/* Spacer */}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Our Community in Action</h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Explore the vibrant life and moments of our church community. From worship services to outreach programs.
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-12 h-12 animate-spin text-primary-500 mb-4" />
            <p className="text-gray-500 font-medium">Loading beautiful moments...</p>
          </div>
        ) : images.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {images.map((image, index) => (
              <motion.div
                key={image.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group relative overflow-hidden rounded-2xl bg-white dark:bg-gray-900 shadow-lg hover:shadow-2xl transition-all duration-500"
              >
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={getImageUrl(image.imageUrl) || ''}
                    alt={image.title}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-6">
                    <h3 className="text-white text-xl font-bold mb-1">{image.title}</h3>
                    <p className="text-gray-200 text-sm line-clamp-2">{image.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-800">
            <ImageIcon className="w-16 h-16 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No images yet</h3>
            <p className="text-gray-500">Check back later for new photos of our events.</p>
          </div>
        )}
      </main>
    </div>
  );
}
