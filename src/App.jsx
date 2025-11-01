import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom'; // Added Outlet
import { AuthProvider } from './context/AuthContext';
import Header from './Pages/Header/Header'; // Add this import - adjust the path to where your Header component is located
// Remove Footer import if you don't want it on all pages, or add it back if needed
import Home from './Pages/Home';
import Login from './Pages/Login/Login.jsx';
import Signup from './Pages/Signup/Signup.jsx';
import KYCPage from './Pages/Kyc/Kyc.jsx';
import AboutUsPage from './Pages/Header/Aboutus';
import PropertyPage from './Pages/Property/Properties';
import AgentsPage from './Pages/Agents/AgentsPage';
import ContactUs from './Pages/Header/ContactUs';

// Optional: Create a Layout component if you want to include Header/Footer consistently
function Layout() {
  return (
    <>
      <Header />
      <Outlet /> {/* This renders the child routes */}
      {/* <Footer /> Add Footer here if needed */}
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
        <div ref={appRef} className="min-h-screen bg-[#F8F9FA] dark:bg-gray-900 font-sans relative overflow-x-hidden">
          {/* Render Header here so it appears on all pages */}
          <Header />
          <main className="relative z-10 min-h-screen pt-20"> {/* Added padding-top to account for fixed header */}
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<AboutUsPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/kyc" element={<KYCPage />} />
              <Route path="/property" element={<PropertyPage />} />
              <Route path="/property/residential" element={<PropertyPage />} />
              <Route path="/property/commercial" element={<PropertyPage />} />
              <Route path="/property/plots" element={<PropertyPage />} />
              <Route path="/property/rent" element={<PropertyPage />} />
              <Route path="/property/new-projects" element={<PropertyPage />} />
              <Route path="/agents" element={<AgentsPage />} />
              <Route path='/contact' element={<ContactUs />} />
            </Routes>
          </main>
          {/* Add Footer here if needed */}
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;