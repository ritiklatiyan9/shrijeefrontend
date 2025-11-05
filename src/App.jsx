import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } /* Add useAuth here */ from './context/AuthContext';
import Header from './Pages/Header/Header.jsx';
import DashboardLayout from './Pages/Home/DashboardLayout.jsx';

// Public Pages
import Home from './Pages/Home';
import Login from './Pages/Login/Login.jsx';
import Signup from './Pages/Signup/Signup.jsx';
import AboutUsPage from './Pages/Header/Aboutus';
import PropertyPage from './Pages/Property/Properties';
import AgentsPage from './Pages/Agents/AgentsPage';
import ContactUs from './Pages/Header/ContactUs';

// Dashboard Pages
import DashboardHome from './Pages/Home/Dashboard.jsx';
import Profile from './Pages/Kyc/Profile.jsx';
import KYCPage from './Pages/Kyc/Kyc.jsx';
import MyUsers from './Pages/Dashboard/MyUsers.jsx';
import AdminDashboard from './Pages/Dashboard/AdminDashboard';
import GeneologyTree from './Pages/Dashboard/GeneologyTree';
import LeftGeneology from './Pages/Geneology/LeftGeneology';
import RightGeneology from './Pages/Geneology/RightGeneology';
import AllMember from './Pages/Geneology/AllMember';
import WelcomeLetter from './Pages/Home/WelcomeLetter';
import AdminUserManagement from './Pages/Dashboard/AdminUserManagement';
import AdminKYCManagement from './Pages/Dashboard/AdminKYCManagement';
import CreatePlotForm from './Pages/Dashboard/CreatePlotForm';
import GetPlots from './Pages/Dashboard/GetPlots';
import LeftTeamBookings from './Pages/Geneology/LeftTeamBooking';
import RightTeamBookings from './Pages/Geneology/RightTeamBooking';
import MyBookings from './Pages/Geneology/MyBookings';
import AdminPlotManagement from './Pages/Dashboard/AdminPlotManagement';
import AdminBookings from './Pages/Dashboard/AdminBookings';

import MatchingIncomeDashboard from './Pages/Dashboard/MatchingIncomeDashboard';
import AdminApproveIncome from './Pages/Dashboard/AdminApproveIncome';
import TeamIncomeDashboard from './Pages/Dashboard/TeamIncomeDashboard';

import './fonts.css';
// Protected Route Component
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }
  
  return user ? children : <Navigate to="/login" replace />;
}

// Public Route Component (redirects to dashboard if logged in)
function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }
  
  return !user ? children : <Navigate to="/dashboard/profile" replace />;
}

// Layout for Public Pages
function PublicLayout({ children }) {
  return (
    <>
      <Header />
      <div className="pt-16">
        {children}
      </div>
    </>
  );
}

function App() {
  const appRef = useRef();

  useEffect(() => {
    gsap.fromTo(appRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 1, ease: 'power3.out' }
    );
  }, []);

  return (
    <Router>
      <AuthProvider>
        <div ref={appRef}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={
              <PublicLayout>
                <Home />
              </PublicLayout>
            } />
            
            <Route path="/about" element={
              <PublicLayout>
                <AboutUsPage />
              </PublicLayout>
            } />
            
            <Route path="/property" element={
              <PublicLayout>
                <PropertyPage />
              </PublicLayout>
            } />
            
            <Route path="/property/:type" element={
              <PublicLayout>
                <PropertyPage />
              </PublicLayout>
            } />
            
            <Route path="/agents" element={
              <PublicLayout>
                <AgentsPage />
              </PublicLayout>
            } />
            
            <Route path="/contact" element={
              <PublicLayout>
                <ContactUs />
              </PublicLayout>
            } />

            {/* Auth Routes - Only accessible when NOT logged in */}
      <Route path="/login" element={
  <PublicRoute>
    <PublicLayout>
      <Login />
    </PublicLayout>
  </PublicRoute>
} />

<Route path="/signup" element={
  <PublicRoute>
    <PublicLayout>
      <Signup />
    </PublicLayout>
  </PublicRoute>
} />

            {/* Protected Dashboard Routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }>
              <Route index element={<DashboardHome />} />
              <Route path="profile" element={<Profile />} />
              <Route path="kyc" element={<KYCPage />} />

              <Route path="my-users" element={<MyUsers />} />
              <Route path="admin-dashboard" element={<AdminDashboard />} />
              <Route path="geneology-tree" element={<GeneologyTree />} />
              <Route path="geneology-left" element={<LeftGeneology />} />
              <Route path="geneology-right" element={<RightGeneology />} />
              <Route path="geneology-all" element={<AllMember />} />
              <Route path="welcome-letter" element={<WelcomeLetter />} />
              <Route path="admin-user-management" element={<AdminUserManagement />} />
              <Route path="admin-kyc-management" element={<AdminKYCManagement />} />
              <Route path="create-plot" element={<CreatePlotForm />} />
              <Route path="get-plots" element={<GetPlots />} />

              <Route path="left-team-bookings" element={<LeftTeamBookings />} />
              <Route path="right-team-bookings" element={<RightTeamBookings />} />
              <Route path="my-bookings" element={<MyBookings />} />

              <Route path="admin-plot-management" element={<AdminPlotManagement />} />
              <Route path="admin-bookings" element={<AdminBookings />} />
              <Route path="matching-income" element={<MatchingIncomeDashboard />} />
              <Route path="admin-approve-income" element={<AdminApproveIncome />} />
              <Route path="team-income" element={<TeamIncomeDashboard />} />
             
            </Route>

            {/* Redirect any unknown routes */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;