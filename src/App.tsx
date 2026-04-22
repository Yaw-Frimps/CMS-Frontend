import { Toaster } from 'react-hot-toast';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import MainLayout from './components/layout/MainLayout';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import DashboardRouter from './pages/dashboard/DashboardRouter';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';

import MembersList from './pages/members/MembersList';
import DonationsList from './pages/donations/DonationsList';
import EventsList from './pages/events/EventsList';
import GroupsList from './pages/groups/GroupsList';
import Settings from './pages/settings/Settings';
import Landing from './pages/public/Landing';
import Gallery from './pages/public/Gallery';
import GalleryManager from './pages/admin/GalleryManager';
import AttendanceManager from './pages/admin/AttendanceManager';
import Analytics from './pages/admin/Analytics';
import ExpenditureList from './pages/finances/ExpenditureList';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Toaster position="top-right" toastOptions={{ duration: 4000, style: { borderRadius: '1rem', background: '#333', color: '#fff' } }} />
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            
            {/* Protected Routes Wrapper */}
            <Route element={<ProtectedRoute />}>
              <Route element={<MainLayout />}>
                <Route path="/dashboard" element={<DashboardRouter />} />
                <Route path="/events" element={<EventsList />} />
                <Route path="/groups" element={<GroupsList />} />
                <Route path="/settings" element={<Settings />} />
                
                {/* Admin Only Routes */}
                <Route element={<ProtectedRoute requireAdmin />}>
                  <Route path="/members" element={<MembersList />} />
                  <Route path="/donations" element={<DonationsList />} />
                  <Route path="/gallery-manager" element={<GalleryManager />} />
                  <Route path="/attendance" element={<AttendanceManager />} />
                  <Route path="/expenditures" element={<ExpenditureList />} />
                  <Route path="/analytics" element={<Analytics />} />
                </Route>
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
