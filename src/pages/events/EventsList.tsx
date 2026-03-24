import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Calendar as CalendarIcon, MapPin, Clock, Users, Plus, X, Loader2, Trash2, ClipboardCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function EventsList() {
  const { isAdmin } = useAuth();
  const [events, setEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    imageUrl: '',
    startTime: '',
    endTime: ''
  });

  // Attendance State
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
    setFormData({
      title: '',
      description: '',
      location: '',
      imageUrl: '',
      startTime: '',
      endTime: ''
    });
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
    
    // Fetch members if not already fetched
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
      setAttendanceSuccess('Attendance recorded successfully!');
      setSelectedMemberId('');
    } catch (error) {
      console.error('Failed to mark attendance', error);
      alert('Failed to record attendance or member already checked in.');
    } finally {
      setAttendanceLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await api.post('/events', {
        title: formData.title,
        description: formData.description,
        location: formData.location,
        imageUrl: formData.imageUrl,
        startTime: new Date(formData.startTime).toISOString(),
        endTime: new Date(formData.endTime).toISOString()
      });
      setIsModalOpen(false);
      fetchEvents();
    } catch (error) {
      console.error('Failed to create event', error);
      alert('Failed to create event. Check console for details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2 transition-colors duration-300">Events & Calendar</h1>
          <p className="text-gray-500 dark:text-gray-400 transition-colors duration-300">Manage church services, meetings, and special events.</p>
        </div>
        {isAdmin && (
          <button onClick={handleOpenAdd} className="px-5 py-2.5 bg-primary-600 text-white rounded-lg shadow-md hover:bg-primary-700 transition font-medium flex items-center">
            <Plus className="w-5 h-5 mr-2" /> Create Event
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* New Event Card Design */}
        {isLoading ? (
          <div className="col-span-full py-12 flex justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
          </div>
        ) : events.length > 0 ? events.map(event => (
          <div key={event.id} className="glass rounded-2xl flex flex-col group hover:shadow-xl transition-all duration-300 relative overflow-hidden">
            {/* Header / Background Image area */}
            <div className="relative h-48 w-full bg-gray-100 overflow-hidden rounded-t-2xl">
              {event.imageUrl ? (
                <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
              ) : (
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary-100 rounded-bl-full z-0 transition-transform duration-500 group-hover:scale-110"></div>
              )}
              {/* Overlay gradient for text readability if image exists */}
              {event.imageUrl && <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>}
            </div>

            <div className="p-6 flex flex-col flex-grow relative z-10 -mt-12 transition-colors duration-300">
              <div className="flex items-start justify-between mb-4">
                <div className="bg-white dark:bg-gray-800 px-3 py-2 rounded-xl text-center shadow-md border border-gray-100 dark:border-gray-700 transition-colors duration-300">
                  <p className="text-xs font-bold text-red-500 uppercase">{new Date(event.startTime).toLocaleString('default', { month: 'short' })}</p>
                  <p className="text-xl font-extrabold text-gray-800 dark:text-gray-100">{new Date(event.startTime).getDate()}</p>
                </div>
                <span className="px-3 py-1 bg-green-100/90 dark:bg-green-900/40 backdrop-blur-sm text-green-700 dark:text-green-400 text-xs font-semibold rounded-full shadow-sm transition-colors duration-300">
                  {new Date(event.startTime) > new Date() ? 'Upcoming' : 'Past'}
                </span>
              </div>
            
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2 relative z-10 transition-colors duration-300">{event.title}</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 line-clamp-2 relative z-10 break-words transition-colors duration-300">{event.description}</p>
            
            <div className="mt-auto space-y-3 relative z-10">
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-300 transition-colors duration-300">
                <Clock className="w-4 h-4 mr-2 text-primary-500" /> 
                {new Date(event.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
                {new Date(event.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-300 transition-colors duration-300">
                <MapPin className="w-4 h-4 mr-2 text-primary-500" /> {event.location}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center relative z-10 transition-colors duration-300">
              <div className="flex items-center text-sm font-medium text-gray-500 dark:text-gray-400">
                <Users className="w-4 h-4 mr-1.5" /> 0 Registered
              </div>
              {isAdmin && (
                <div className="flex space-x-3">
                  <button 
                    onClick={() => handleOpenAttendance(event.id)}
                    className="text-primary-600 dark:text-primary-400 font-medium text-sm flex items-center hover:text-primary-700 dark:hover:text-primary-300 transition-colors duration-300"
                    title="Take Attendance"
                  >
                    <ClipboardCheck className="w-4 h-4 mr-1" />
                    Attendance
                  </button>
                  <button className="text-gray-600 dark:text-gray-400 font-medium text-sm hover:text-gray-900 dark:hover:text-gray-200 transition-colors duration-300">Manage</button>
                  <button onClick={() => handleDelete(event.id)} className="text-red-500 hover:text-red-700 dark:hover:text-red-400 transition-colors duration-300">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        )) : (
          <div className="col-span-full glass p-12 text-center rounded-2xl flex flex-col items-center justify-center transition-colors duration-300">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4 text-gray-400 dark:text-gray-500 transition-colors duration-300">
              <CalendarIcon className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">No Events Scheduled</h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-sm transition-colors duration-300">Get started by creating your first church event, service, or group meeting.</p>
          </div>
        )}
      </div>

      {/* Event Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity duration-300">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl transition-colors duration-300">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Create Event</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-300">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Event Title</label>
                <input 
                  required 
                  type="text" 
                  value={formData.title} 
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  className="w-full px-4 py-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-colors duration-300"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location</label>
                <input 
                  required 
                  type="text" 
                  value={formData.location} 
                  onChange={e => setFormData({...formData, location: e.target.value})}
                  className="w-full px-4 py-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-colors duration-300"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Image URL (Optional)</label>
                <input 
                  type="url" 
                  value={formData.imageUrl} 
                  onChange={e => setFormData({...formData, imageUrl: e.target.value})}
                  className="w-full px-4 py-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-colors duration-300"
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Time</label>
                  <input 
                    required 
                    type="datetime-local" 
                    value={formData.startTime} 
                    onChange={e => setFormData({...formData, startTime: e.target.value})}
                    className="w-full px-4 py-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-colors duration-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">End Time</label>
                  <input 
                    required 
                    type="datetime-local" 
                    value={formData.endTime} 
                    onChange={e => setFormData({...formData, endTime: e.target.value})}
                    className="w-full px-4 py-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-colors duration-300"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea 
                  required 
                  rows={3}
                  value={formData.description} 
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full px-4 py-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none resize-none transition-colors duration-300"
                />
              </div>

              <div className="pt-4 flex justify-end space-x-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg font-medium transition-colors">
                  Cancel
                </button>
                <button disabled={isSubmitting} type="submit" className="px-4 py-2 bg-primary-600 text-white hover:bg-primary-700 rounded-lg font-medium transition-colors flex items-center">
                  {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Create Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Attendance Modal */}
      {isAttendanceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity duration-300">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md p-6 shadow-2xl transition-colors duration-300">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Mark Attendance</h2>
              <button onClick={() => setIsAttendanceModalOpen(false)} className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-300">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            {attendanceSuccess && (
              <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg text-sm font-medium">
                {attendanceSuccess}
              </div>
            )}

            <form onSubmit={handleMarkAttendance} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Select Member</label>
                <select 
                  required
                  value={selectedMemberId}
                  onChange={(e) => setSelectedMemberId(Number(e.target.value))}
                  className="w-full px-4 py-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-colors duration-300"
                >
                  <option value="" disabled>-- Choose a member --</option>
                  {members.map(member => (
                    <option key={member.id} value={member.id}>
                      {member.firstName} {member.lastName} ({member.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-4 flex justify-end space-x-3">
                <button type="button" onClick={() => setIsAttendanceModalOpen(false)} className="px-4 py-2 text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg font-medium transition-colors">
                  Close
                </button>
                <button disabled={attendanceLoading || !selectedMemberId} type="submit" className="px-4 py-2 bg-primary-600 text-white hover:bg-primary-700 rounded-lg font-medium transition-colors flex items-center disabled:opacity-50">
                  {attendanceLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Record Attendance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
