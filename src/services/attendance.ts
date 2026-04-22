import { api } from './api';

export interface MeetingAttendance {
  id?: number;
  meetingName: string;
  meetingDate: string;
  attendeeCount: number;
}

export const attendanceService = {
  createAttendance: async (attendance: MeetingAttendance) => {
    const response = await api.post<MeetingAttendance>('/attendance', attendance);
    return response.data;
  },

  getAttendances: async () => {
    const response = await api.get<MeetingAttendance[]>('/attendance');
    return response.data;
  },

  updateAttendance: async (id: number, attendance: MeetingAttendance) => {
    const response = await api.put<MeetingAttendance>(`/attendance/${id}`, attendance);
    return response.data;
  },

  deleteAttendance: async (id: number) => {
    await api.delete(`/attendance/${id}`);
  },
};
