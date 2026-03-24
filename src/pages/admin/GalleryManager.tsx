import { useState, useEffect } from 'react';
import { api, getImageUrl } from '../../services/api';
import { 
  Plus, 
  Trash2, 
  Globe, 
  Layout, 
  Star, 
  Save, 
  X, 
  Loader2,
  Upload
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface GalleryImage {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  isHeroCarousel: boolean;
  isPublic: boolean;
  isShowOnLanding: boolean;
  sortOrder: number;
  uploadedAt: string;
}

export default function GalleryManager() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    isPublic: true,
    isHeroCarousel: false,
    isShowOnLanding: false,
    sortOrder: 0
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const fetchImages = async () => {
    try {
      setLoading(true);
      const res = await api.get('/gallery');
      setImages(res.data);
    } catch (err) {
      console.error('Failed to fetch images', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert('File size exceeds 10MB limit.');
        return;
      }
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreviewUrl(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    try {
      setUploading(true);
      const data = new FormData();
      data.append('file', selectedFile);
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('isPublic', String(formData.isPublic));
      data.append('isHeroCarousel', String(formData.isHeroCarousel));
      data.append('isShowOnLanding', String(formData.isShowOnLanding));
      data.append('sortOrder', String(formData.sortOrder));

      await api.post('/gallery', data, {
        headers: { 'Content-Type': undefined }
      });
      
      setIsModalOpen(false);
      resetForm();
      fetchImages();
    } catch (err: any) {
      console.error('Upload failed', err);
      const msg = err.response?.data?.message || err.message || 'Unknown error';
      alert(`Failed to upload image: ${msg}`);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this image?')) return;
    try {
      await api.delete(`/gallery/${id}`);
      fetchImages();
    } catch (err) {
      console.error('Delete failed', err);
    }
  };

  const toggleStatus = async (image: GalleryImage, field: keyof GalleryImage) => {
    try {
      const updated = { ...image, [field]: !image[field] };
      await api.put(`/gallery/${image.id}`, updated);
      setImages(images.map(img => img.id === image.id ? updated as GalleryImage : img));
    } catch (err) {
      console.error('Update failed', err);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      isPublic: true,
      isHeroCarousel: false,
      isShowOnLanding: false,
      sortOrder: 0
    });
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Gallery Manager</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage public gallery, hero carousel, and landing page highlights.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl shadow-lg shadow-primary-500/20 transition-all transform hover:-translate-y-0.5"
        >
          <Plus className="w-5 h-5" />
          Add New Image
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-primary-50" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {images.map(image => (
            <div key={image.id} className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden group">
              <div className="relative aspect-video">
                <img 
                  src={getImageUrl(image.imageUrl) || ''} 
                  alt={image.title} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2 flex gap-2">
                  <button 
                    onClick={() => handleDelete(image.id)}
                    className="p-2 bg-red-500/90 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                    aria-label="Delete image"
                    title="Delete image"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-gray-900 dark:text-white truncate">{image.title || 'Untitled'}</h3>
                <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      onClick={() => toggleStatus(image, 'isPublic')}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                        image.isPublic 
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                        : 'bg-gray-100 text-gray-500 dark:bg-gray-800'
                      }`}
                      aria-label={`Toggle public visibility (currently ${image.isPublic ? 'on' : 'off'})`}
                    >
                      <Globe className="w-3 h-3" />
                      Public
                    </button>
                    <button
                      onClick={() => toggleStatus(image, 'isHeroCarousel')}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                        image.isHeroCarousel 
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' 
                        : 'bg-gray-100 text-gray-500 dark:bg-gray-800'
                      }`}
                      aria-label={`Toggle carousel visibility (currently ${image.isHeroCarousel ? 'on' : 'off'})`}
                    >
                      <Layout className="w-3 h-3" />
                      Carousel
                    </button>
                    <button
                      onClick={() => toggleStatus(image, 'isShowOnLanding')}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                        image.isShowOnLanding 
                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' 
                        : 'bg-gray-100 text-gray-500 dark:bg-gray-800'
                      }`}
                      aria-label={`Toggle landing section visibility (currently ${image.isShowOnLanding ? 'on' : 'off'})`}
                    >
                      <Star className="w-3 h-3" />
                      Landing
                    </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-white dark:bg-gray-950 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden"
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Add Gallery Image</h2>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors" aria-label="Close modal">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleUpload} className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="relative aspect-video rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-800 flex flex-col items-center justify-center overflow-hidden bg-gray-50 dark:bg-gray-900/50 group">
                      {previewUrl ? (
                        <img src={previewUrl} className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-center p-6">
                          <Upload className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-500">Click to upload image</p>
                        </div>
                      )}
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleFileChange}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                      <input 
                        type="text"
                        value={formData.title}
                        onChange={e => setFormData({...formData, title: e.target.value})}
                        className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
                        placeholder="Church Service"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                      <textarea 
                        value={formData.description}
                        onChange={e => setFormData({...formData, description: e.target.value})}
                        className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
                        rows={3}
                        placeholder="Brief description..."
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-gray-100 dark:border-gray-800 pt-6">
                  <label className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                    <input 
                      type="checkbox" 
                      className="w-5 h-5 rounded text-primary-600 focus:ring-primary-500"
                      checked={formData.isPublic}
                      onChange={e => setFormData({...formData, isPublic: e.target.checked})}
                    />
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium dark:text-gray-200">Public Gallery</span>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                    <input 
                      type="checkbox" 
                      className="w-5 h-5 rounded text-primary-600 focus:ring-primary-500"
                      checked={formData.isHeroCarousel}
                      onChange={e => setFormData({...formData, isHeroCarousel: e.target.checked})}
                    />
                    <div className="flex items-center gap-2">
                      <Layout className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium dark:text-gray-200">Hero Carousel</span>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                    <input 
                      type="checkbox" 
                      className="w-5 h-5 rounded text-primary-600 focus:ring-primary-500"
                      checked={formData.isShowOnLanding}
                      onChange={e => setFormData({...formData, isShowOnLanding: e.target.checked})}
                    />
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium dark:text-gray-200">Landing Section</span>
                    </div>
                  </label>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button 
                    type="button" 
                    onClick={() => setIsModalOpen(false)}
                    className="px-6 py-2.5 text-gray-600 dark:text-gray-300 font-medium hover:bg-gray-100 dark:hover:bg-gray-900 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={uploading}
                    className="px-8 py-2.5 bg-primary-600 text-white font-bold rounded-xl shadow-lg shadow-primary-500/20 hover:bg-primary-700 transition-all flex items-center gap-2 disabled:opacity-50"
                  >
                    {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    {uploading ? 'Uploading...' : 'Upload Image'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
