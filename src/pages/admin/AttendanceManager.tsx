import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Users, Plus, Save, Loader2, History, Edit2, Trash2, X } from 'lucide-react';
import { attendanceService, type MeetingAttendance } from '../../services/attendance';
import ConfirmModal from '../../components/common/ConfirmModal';
import toast from 'react-hot-toast';

export default function AttendanceManager() {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [attendances, setAttendances] = useState<MeetingAttendance[]>([]);
  const [editingRecord, setEditingRecord] = useState<MeetingAttendance | null>(null);
  const [formData, setFormData] = useState({
    meetingName: '',
    meetingDate: new Date().toISOString().split('T')[0],
    attendeeCount: '',
  });

  const [confirmDelete, setConfirmDelete] = useState<{ isOpen: boolean; id: number | null }>({
    isOpen: false,
    id: null
  });

  useEffect(() => {
    loadAttendances();
  }, []);

  const loadAttendances = async () => {
    try {
      const data = await attendanceService.getAttendances();
      setAttendances(data.reverse()); // Show latest first
    } catch (error) {
      console.error('Failed to load attendances', error);
    } finally {
      setFetching(false);
    }
  };

  const handleEdit = (record: MeetingAttendance) => {
    setEditingRecord(record);
    setFormData({
      meetingName: record.meetingName,
      meetingDate: record.meetingDate,
      attendeeCount: record.attendeeCount.toString(),
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: number) => {
    setConfirmDelete({ isOpen: true, id });
  };

  const handleConfirmDelete = async () => {
    if (!confirmDelete.id) return;
    try {
      await attendanceService.deleteAttendance(confirmDelete.id);
      loadAttendances();
      toast.success('Record deleted successfully!');
    } catch (error) {
      toast.error('Failed to delete record.');
    }
  };

  const cancelEdit = () => {
    setEditingRecord(null);
    setFormData({
      meetingName: '',
      meetingDate: new Date().toISOString().split('T')[0],
      attendeeCount: '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = {
        meetingName: formData.meetingName,
        meetingDate: formData.meetingDate,
        attendeeCount: parseInt(formData.attendeeCount),
      };

      if (editingRecord?.id) {
        await attendanceService.updateAttendance(editingRecord.id, data);
        toast.success('Attendance updated successfully!');
      } else {
        await attendanceService.createAttendance(data);
        toast.success('Attendance recorded successfully!');
      }
      
      setFormData({
        meetingName: '',
        meetingDate: new Date().toISOString().split('T')[0],
        attendeeCount: '',
      });
      setEditingRecord(null);
      loadAttendances();
    } catch (error) {
      toast.error('Failed to save attendance. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Header Section */}
      <div className="relative">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-6"
        >
          <div>
            <h1 className="text-4xl font-black font-headline text-zinc-900 dark:text-white tracking-tight">
              Attendance <span className="text-primary-600 dark:text-primary-400">Tracking</span>
            </h1>
            <p className="mt-2 text-zinc-500 dark:text-zinc-400 max-w-2xl text-lg font-medium">
              Log and monitor meeting attendance to track the growth of our congregation.
            </p>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Record Form */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-1"
        >
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 shadow-2xl shadow-zinc-200/50 dark:shadow-none border border-zinc-100 dark:border-zinc-800 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-primary-500/10 transition-colors duration-500" />
            
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary-50 dark:bg-primary-900/20 rounded-2xl">
                  {editingRecord ? <Edit2 className="w-6 h-6 text-primary-600 dark:text-primary-400" /> : <Plus className="w-6 h-6 text-primary-600 dark:text-primary-400" />}
                </div>
                <h2 className="text-xl font-bold text-zinc-800 dark:text-zinc-100">
                  {editingRecord ? 'Edit Record' : 'Record Attendance'}
                </h2>
              </div>
              {editingRecord && (
                <button 
                  onClick={cancelEdit}
                  className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl text-zinc-400 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2 ml-1">
                  Meeting Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-400">
                    <History className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sunday Service"
                    className="w-full pl-11 pr-4 py-3.5 bg-zinc-50 dark:bg-zinc-800/50 border-0 ring-1 ring-zinc-200 dark:ring-zinc-700 focus:ring-2 focus:ring-primary-500 rounded-2xl text-zinc-900 dark:text-white transition-all duration-300"
                    value={formData.meetingName}
                    onChange={(e) => setFormData({ ...formData, meetingName: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2 ml-1">
                  Meeting Date
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-400">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <input
                    type="date"
                    required
                    className="w-full pl-11 pr-4 py-3.5 bg-zinc-50 dark:bg-zinc-800/50 border-0 ring-1 ring-zinc-200 dark:ring-zinc-700 focus:ring-2 focus:ring-primary-500 rounded-2xl text-zinc-900 dark:text-white transition-all duration-300"
                    value={formData.meetingDate}
                    onChange={(e) => setFormData({ ...formData, meetingDate: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2 ml-1">
                  Attendance Count
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-400">
                    <Users className="w-5 h-5" />
                  </div>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="0"
                    className="w-full pl-11 pr-4 py-3.5 bg-zinc-50 dark:bg-zinc-800/50 border-0 ring-1 ring-zinc-200 dark:ring-zinc-700 focus:ring-2 focus:ring-primary-500 rounded-2xl text-zinc-900 dark:text-white transition-all duration-300"
                    value={formData.attendeeCount}
                    onChange={(e) => setFormData({ ...formData, attendeeCount: e.target.value })}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl font-bold flex items-center justify-center gap-3 shadow-lg shadow-primary-500/20 transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <>
                    <Save className="w-6 h-6" />
                    {editingRecord ? 'Update Record' : 'Record Attendance'}
                  </>
                )}
              </button>
            </form>
          </div>
        </motion.div>

        {/* Recent History */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2"
        >
          <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl shadow-zinc-200/50 dark:shadow-none border border-zinc-100 dark:border-zinc-800 overflow-hidden">
            <div className="p-8 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-zinc-50 dark:bg-zinc-800 rounded-2xl text-zinc-500">
                  <History className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-bold text-zinc-800 dark:text-zinc-100">Recent Attendance</h2>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-zinc-50/50 dark:bg-zinc-800/30">
                    <th className="px-8 py-5 text-left text-xs font-bold text-zinc-500 uppercase tracking-wider">Meeting Name</th>
                    <th className="px-8 py-5 text-left text-xs font-bold text-zinc-500 uppercase tracking-wider">Date</th>
                    <th className="px-8 py-5 text-right text-xs font-bold text-zinc-500 uppercase tracking-wider">Attendance</th>
                    <th className="px-8 py-5 text-right text-xs font-bold text-zinc-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {fetching ? (
                    <tr>
                      <td colSpan={4} className="px-8 py-12 text-center">
                        <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary-500" />
                      </td>
                    </tr>
                  ) : attendances.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-8 py-12 text-center text-zinc-500 font-medium">
                        No records found yet.
                      </td>
                    </tr>
                  ) : (
                    attendances.map((record) => (
                      <tr key={record.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/50 transition-colors group">
                        <td className="px-8 py-6">
                          <span className="font-bold text-zinc-800 dark:text-zinc-200 group-hover:text-primary-600 transition-colors">
                            {record.meetingName}
                          </span>
                        </td>
                        <td className="px-8 py-6 text-zinc-500 dark:text-zinc-400 font-medium">
                          {new Date(record.meetingDate).toLocaleDateString(undefined, { dateStyle: 'long' })}
                        </td>
                        <td className="px-8 py-6 text-right">
                          <span className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 rounded-xl font-bold">
                            <Users className="w-4 h-4" />
                            {record.attendeeCount.toLocaleString()}
                          </span>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => handleEdit(record)}
                              className="p-2 hover:bg-primary-50 dark:hover:bg-primary-900/20 text-primary-600 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => record.id && handleDelete(record.id)}
                              className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      </div>

      <ConfirmModal
        isOpen={confirmDelete.isOpen}
        title="Delete Record"
        message="Are you sure you want to delete this attendance record? This action cannot be undone."
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmDelete({ isOpen: false, id: null })}
        confirmText="Delete Record"
      />
    </div>
  );
}
