import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import MainLayout from './components/layout/MainLayout';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import DashboardRouter from './pages/dashboard/DashboardRouter';

import MembersList from './pages/members/MembersList';
import DonationsList from './pages/donations/DonationsList';
import EventsList from './pages/events/EventsList';
import GroupsList from './pages/groups/GroupsList';
import Settings from './pages/settings/Settings';
import Landing from './pages/public/Landing';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected Routes Wrapper */}
            <Route element={<ProtectedRoute />}>
              <Route element={<MainLayout />}>
                <Route path="/dashboard" element={<DashboardRouter />} />
                <Route path="/events" element={<EventsList />} />
                <Route path="/settings" element={<Settings />} />
                
                {/* Admin Only Routes */}
                <Route element={<ProtectedRoute requireAdmin />}>
                  <Route path="/members" element={<MembersList />} />
                  <Route path="/donations" element={<DonationsList />} />
                  <Route path="/groups" element={<GroupsList />} />
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
