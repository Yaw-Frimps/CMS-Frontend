import { useState, useEffect } from 'react';
import { api, getImageUrl } from '../../services/api';
import { Calendar as CalendarIcon, MapPin, Clock, Users, Plus, X, Loader2, Trash2, ClipboardCheck, Edit2, Info } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import ImageUpload from '../../components/common/ImageUpload';

export default function EventsList() {
  const { isAdmin, user } = useAuth();
  const [events, setEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEventId, setEditingEventId] = useState<number | null>(null);
  const [viewingEvent, setViewingEvent] = useState<any | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    imageUrl: '',
    startTime: '',
    endTime: ''
  });
  const [selectedEventImage, setSelectedEventImage] = useState<File | null>(null);

  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [selectedMemberId, setSelectedMemberId] = useState<number | ''>('');
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [attendanceSuccess, setAttendanceSuccess] = useState('');

  const fetchEvents = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/events');
      setEvents(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleOpenAdd = () => {
    setEditingEventId(null);
    setFormData({
      title: '',
      description: '',
      location: '',
      imageUrl: '',
      startTime: '',
      endTime: ''
    });
    setSelectedEventImage(null);
    setIsModalOpen(true);
  };

  const handleEdit = (event: any) => {
    setEditingEventId(event.id);
    const formatDate = (dateString: string) => {
      if (!dateString) return '';
      const date = new Date(dateString);
      return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    };
    
    setFormData({
      title: event.title,
      description: event.description,
      location: event.location,
      imageUrl: event.imageUrl || '',
      startTime: formatDate(event.startTime),
      endTime: formatDate(event.endTime)
    });
    setSelectedEventImage(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        await api.delete(`/events/${id}`);
        fetchEvents();
      } catch (error) {
        console.error('Failed to delete event', error);
      }
    }
  };

  const handleOpenAttendance = async (eventId: number) => {
    setSelectedEventId(eventId);
    setSelectedMemberId('');
    setAttendanceSuccess('');
    setIsAttendanceModalOpen(true);
    if (members.length === 0) {
      try {
        const res = await api.get('/members');
        setMembers(res.data);
      } catch (error) {
        console.error("Failed to fetch members", error);
      }
    }
  };

  const handleMarkAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEventId || !selectedMemberId) return;
    try {
      setAttendanceLoading(true);
      setAttendanceSuccess('');
      await api.post('/attendance/checkin', {
        eventId: selectedEventId,
        memberId: selectedMemberId,
        notes: "Marked by Admin",
        checkInTime: new Date().toISOString()
      });
      setAttendanceSuccess('Attendance recorded!');
      setSelectedMemberId('');
    } catch (error) {
      console.error('Failed to mark attendance', error);
      alert('Failed to record attendance.');
    } finally {
      setAttendanceLoading(false);
    }
  };

  const handleToggleRegistration = async (eventId: number, isRegistered: boolean) => {
    if (!user?.memberId) return;
    try {
      if (isRegistered) {
        await api.delete(`/events/${eventId}/register/${user.memberId}`);
      } else {
        await api.post(`/events/${eventId}/register/${user.memberId}`);
      }
      fetchEvents();
    } catch (error) {
      console.error("Failed to toggle registration", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      let finalImageUrl = formData.imageUrl;
      
      if (selectedEventImage) {
        const imageFormData = new FormData();
        imageFormData.append('file', selectedEventImage);
        const uploadRes = await api.post('/events/upload-image', imageFormData, {
          headers: { 'Content-Type': undefined }
        });
        finalImageUrl = uploadRes.data;
      }

      if (editingEventId) {
        await api.put(`/events/${editingEventId}`, {
          ...formData,
          imageUrl: finalImageUrl,
          startTime: new Date(formData.startTime).toISOString(),
          endTime: new Date(formData.endTime).toISOString()
        });
      } else {
        await api.post('/events', {
          ...formData,
          imageUrl: finalImageUrl,
          startTime: new Date(formData.startTime).toISOString(),
          endTime: new Date(formData.endTime).toISOString()
        });
      }
      setIsModalOpen(false);
      fetchEvents();
    } catch (error) {
      console.error('Failed to create event', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight mb-2">Events & <span className="text-gradient">Calendar</span></h1>
          <p className="text-zinc-500 font-medium">Coordinate services, community outreach, and special gatherings.</p>
        </div>
        {isAdmin && (
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleOpenAdd} 
            className="px-6 py-3 bg-primary-600 text-white rounded-2xl shadow-xl shadow-primary-600/20 hover:bg-primary-500 transition-all font-bold flex items-center group"
          >
            <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform" /> Create Event
          </motion.button>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-primary-500" />
        </div>
      ) : (
        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8"
        >
          {events.length > 0 ? events.map(event => (
            <motion.div 
              variants={item}
              key={event.id} 
              onClick={() => setViewingEvent(event)}
              className="glass-card flex flex-col group overflow-hidden border border-white/40 dark:border-zinc-800/50 cursor-pointer hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
            >
              <div className="relative h-56 w-full bg-zinc-100 dark:bg-zinc-900">
                {event.imageUrl ? (
                  <img src={event.imageUrl.startsWith('http') || event.imageUrl.startsWith('data:') ? event.imageUrl : getImageUrl(event.imageUrl) || ''} alt={event.title} className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-zinc-100 dark:bg-zinc-800">
                    <CalendarIcon className="w-12 h-12 text-zinc-300 dark:text-zinc-700" />
                  </div>
                )}
                <div className="absolute top-4 left-4">
                  <div className="glass px-3 py-2 rounded-2xl text-center shadow-xl border border-white/20">
                    <p className="text-[10px] font-black text-primary-500 uppercase tracking-widest">{new Date(event.startTime).toLocaleString('default', { month: 'short' })}</p>
                    <p className="text-xl font-black text-zinc-900 dark:text-zinc-50">{new Date(event.startTime).getDate()}</p>
                  </div>
                </div>
                <div className="absolute bottom-4 right-4">
                  <span className={`px-4 py-1.5 backdrop-blur-md text-[10px] font-black uppercase tracking-widest rounded-full border border-white/20 shadow-xl ${
                    new Date(event.startTime) > new Date() 
                    ? 'bg-emerald-500/80 text-white' 
                    : 'bg-zinc-800/80 text-zinc-300'
                  }`}>
                    {new Date(event.startTime) > new Date() ? 'Upcoming' : 'Completed'}
                  </span>
                </div>
              </div>

              <div className="p-8 flex flex-col flex-grow">
                <h3 className="text-2xl font-black text-zinc-900 dark:text-zinc-50 mb-3 leading-tight transition-colors group-hover:text-primary-600 dark:group-hover:text-primary-400">{event.title}</h3>
                <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-8 line-clamp-2 leading-relaxed font-medium">{event.description}</p>
                
                <div className="mt-auto space-y-4">
                  <div className="flex items-center text-sm font-bold text-zinc-600 dark:text-zinc-300">
                    <div className="w-8 h-8 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mr-3">
                      <Clock className="w-4 h-4 text-primary-500" />
                    </div>
                    {new Date(event.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
                    {new Date(event.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div className="flex items-center text-sm font-bold text-zinc-600 dark:text-zinc-300">
                    <div className="w-8 h-8 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mr-3">
                      <MapPin className="w-4 h-4 text-primary-500" />
                    </div>
                    {event.location}
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
                  {isAdmin ? (
                    <>
                      <div className="flex items-center text-xs font-black text-zinc-400 uppercase tracking-widest">
                        <Users className="w-3.5 h-3.5 mr-2" /> {event.registeredCount || 0} Registered
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleOpenAttendance(event.id); }}
                          className="p-2.5 rounded-xl bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 hover:bg-primary-600 hover:text-white transition-all shadow-sm"
                          title="Mark Attendance"
                        >
                          <ClipboardCheck className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleEdit(event); }}
                          className="p-2.5 rounded-xl bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 hover:bg-orange-600 hover:text-white transition-all shadow-sm"
                          title="Edit Event"
                        >
                          <Edit2 className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleDelete(event.id); }}
                          className="p-2.5 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-600 hover:text-white transition-all shadow-sm"
                          title="Delete Event"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="w-full">
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleToggleRegistration(event.id, event.registeredMemberIds?.includes(user?.memberId)); }}
                        className={`w-full py-3.5 rounded-xl text-sm font-black uppercase tracking-widest transition-all ${
                          event.registeredMemberIds?.includes(user?.memberId) 
                            ? 'bg-zinc-100 dark:bg-zinc-800/50 text-zinc-400 border border-zinc-200 dark:border-zinc-700 hover:bg-red-50 hover:text-red-500 hover:border-red-200 dark:hover:bg-red-900/10 dark:hover:border-red-900/30 dark:hover:text-red-400' 
                            : 'bg-primary-600 text-white hover:bg-primary-500 shadow-xl shadow-primary-500/20 hover:shadow-primary-500/30 hover:-translate-y-0.5'
                        }`}
                      >
                        {event.registeredMemberIds?.includes(user?.memberId) ? 'Withdraw RSV' : 'Register Now'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )) : (
            <div className="col-span-full glass-card p-20 text-center flex flex-col items-center justify-center">
              <div className="w-20 h-20 bg-zinc-100 dark:bg-zinc-800 rounded-3xl flex items-center justify-center mb-6 text-zinc-300">
                <CalendarIcon className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-black text-zinc-900 dark:text-zinc-50 mb-3">No Events Scheduled</h3>
              <p className="text-zinc-500 font-medium max-w-xs mb-8">Ready to bring the community together? Create your first event now.</p>
              {isAdmin && (
                <button onClick={handleOpenAdd} className="px-8 py-3 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-2xl font-black transition-all hover:scale-105 active:scale-95">
                  Get Started
                </button>
              )}
            </div>
          )}
        </motion.div>
      )}

      {/* Modals with AnimatePresence */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-zinc-950/40 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="glass p-8 rounded-[2.5rem] w-full max-w-2xl shadow-2xl border border-white/20 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight">{editingEventId ? 'Edit Event' : 'Create Event'}</h2>
                <button type="button" onClick={() => setIsModalOpen(false)} className="p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-black text-zinc-500 uppercase tracking-widest ml-1">Event Title</label>
                  <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} 
                    className="w-full px-5 py-3.5 bg-white/50 dark:bg-zinc-900/50 text-zinc-900 dark:text-zinc-50 rounded-2xl border border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-black text-zinc-500 uppercase tracking-widest ml-1">Location</label>
                    <input required type="text" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} 
                      className="w-full px-5 py-3.5 bg-white/50 dark:bg-zinc-900/50 text-zinc-900 dark:text-zinc-50 rounded-2xl border border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-black text-zinc-500 uppercase tracking-widest ml-1">Event Image</label>
                    <ImageUpload 
                      onImageSelect={(file) => setSelectedEventImage(file)} 
                      currentImageUrl={formData.imageUrl}
                      label=""
                      helpText="Recommended size: 1080x1080px. Max 5MB."
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-black text-zinc-500 uppercase tracking-widest ml-1">Start Time</label>
                    <input required type="datetime-local" value={formData.startTime} onChange={e => setFormData({...formData, startTime: e.target.value})} 
                      className="w-full px-5 py-3.5 bg-white/50 dark:bg-zinc-900/50 text-zinc-900 dark:text-zinc-50 rounded-2xl border border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-black text-zinc-500 uppercase tracking-widest ml-1">End Time</label>
                    <input required type="datetime-local" value={formData.endTime} onChange={e => setFormData({...formData, endTime: e.target.value})} 
                      className="w-full px-5 py-3.5 bg-white/50 dark:bg-zinc-900/50 text-zinc-900 dark:text-zinc-50 rounded-2xl border border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-black text-zinc-500 uppercase tracking-widest ml-1">Description</label>
                  <textarea required rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} 
                    className="w-full px-5 py-3.5 bg-white/50 dark:bg-zinc-900/50 text-zinc-900 dark:text-zinc-50 rounded-2xl border border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none resize-none transition-all"
                  />
                </div>

                <div className="pt-4 flex justify-end gap-4">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 text-zinc-600 dark:text-zinc-400 font-bold hover:text-zinc-900 transition-colors">
                    Cancel
                  </button>
                  <button disabled={isSubmitting} type="submit" className="px-8 py-3 bg-primary-600 text-white rounded-2xl font-black shadow-xl shadow-primary-600/20 hover:bg-primary-500 transition-all flex items-center">
                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : (editingEventId ? 'Save Changes' : 'Create Event')}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Attendance Modal */}
      <AnimatePresence>
        {isAttendanceModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-zinc-950/40 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="glass p-8 rounded-[2.5rem] w-full max-w-md shadow-2xl border border-white/20"
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight">Mark Attendance</h2>
                <button onClick={() => setIsAttendanceModalOpen(false)} className="p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              {attendanceSuccess && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 font-bold rounded-2xl border border-emerald-100 dark:border-emerald-900/30"
                >
                  {attendanceSuccess}
                </motion.div>
              )}

              <form onSubmit={handleMarkAttendance} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-black text-zinc-500 uppercase tracking-widest ml-1">Select Member</label>
                  <select 
                    required
                    value={selectedMemberId}
                    onChange={(e) => setSelectedMemberId(Number(e.target.value))}
                    className="w-full px-5 py-3.5 bg-white/50 dark:bg-zinc-900/50 text-zinc-900 dark:text-zinc-50 rounded-2xl border border-zinc-200 dark:border-zinc-800 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all appearance-none"
                  >
                    <option value="" disabled>Choose a member</option>
                    {members.map(member => (
                      <option key={member.id} value={member.id}>
                        {member.firstName} {member.lastName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="pt-4 flex justify-end gap-4">
                  <button type="button" onClick={() => setIsAttendanceModalOpen(false)} className="px-6 py-3 text-zinc-600 dark:text-zinc-400 font-bold hover:text-zinc-900 transition-colors">
                    Close
                  </button>
                  <button disabled={attendanceLoading || !selectedMemberId} type="submit" className="px-8 py-3 bg-primary-600 text-white rounded-2xl font-black shadow-xl shadow-primary-600/20 hover:bg-primary-500 transition-all flex items-center disabled:opacity-50">
                    {attendanceLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Record Check-in'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* View Event Details Modal */}
      <AnimatePresence>
        {viewingEvent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-zinc-950/40 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="glass rounded-[2.5rem] w-full max-w-2xl shadow-2xl border border-white/20 overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="relative h-64 w-full bg-zinc-100 dark:bg-zinc-900 flex-shrink-0">
                {viewingEvent.imageUrl ? (
                  <img src={viewingEvent.imageUrl.startsWith('http') || viewingEvent.imageUrl.startsWith('data:') ? viewingEvent.imageUrl : getImageUrl(viewingEvent.imageUrl) || ''} alt={viewingEvent.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <CalendarIcon className="w-16 h-16 text-zinc-300 dark:text-zinc-700" />
                  </div>
                )}
                <div className="absolute top-4 right-4 flex gap-2">
                  {isAdmin && (
                    <button 
                      onClick={() => { setViewingEvent(null); handleEdit(viewingEvent); }}
                      className="p-2.5 rounded-xl bg-white/20 hover:bg-white text-white hover:text-orange-600 backdrop-blur-md transition-all shadow-sm"
                      title="Edit Event"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                  )}
                  <button 
                    onClick={() => setViewingEvent(null)}
                    className="p-2.5 rounded-xl bg-white/20 hover:bg-white text-white hover:text-zinc-900 backdrop-blur-md transition-all shadow-sm"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="p-8 overflow-y-auto">
                <div className="flex items-center gap-3 mb-2">
                  <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full ${
                    new Date(viewingEvent.startTime) > new Date() 
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' 
                    : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
                  }`}>
                    {new Date(viewingEvent.startTime) > new Date() ? 'Upcoming' : 'Completed'}
                  </span>
                </div>
                <h2 className="text-3xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight mb-6">{viewingEvent.title}</h2>
                
                <div className="space-y-6 mb-8">
                  <div className="flex items-center text-zinc-600 dark:text-zinc-300 p-4 bg-zinc-50 dark:bg-zinc-900/40 rounded-2xl border border-zinc-100 dark:border-zinc-800/50">
                    <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mr-4 flex-shrink-0">
                      <Clock className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-1">Date & Time</p>
                      <p className="font-bold">
                        {new Date(viewingEvent.startTime).toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}<br/>
                        {new Date(viewingEvent.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
                        {new Date(viewingEvent.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center text-zinc-600 dark:text-zinc-300 p-4 bg-zinc-50 dark:bg-zinc-900/40 rounded-2xl border border-zinc-100 dark:border-zinc-800/50">
                    <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center mr-4 flex-shrink-0">
                      <MapPin className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-1">Location</p>
                      <p className="font-bold">{viewingEvent.location}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-black text-zinc-500 uppercase tracking-widest mb-4 flex items-center">
                    <Info className="w-4 h-4 mr-2" /> Description
                  </h3>
                  <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap font-medium">
                    {viewingEvent.description}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
