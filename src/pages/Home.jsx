// src/Pages/Home.jsx
import { ArrowLeft, ArrowRight, Search, Play } from 'lucide-react';
import Header from './Header/Header'; // Adjust path as needed based on your folder structure
import Footer from './Footer/Footer'; // Adjust path as needed based on your folder structure
const mainPhoto = "/assets/mainvilla.jpg";
import Home2 from './Home2';
import Home3 from './Home3';
import { motion } from 'framer-motion';

const customFontStyle = {
  fontFamily: "'Neue Montreal Regular', sans-serif",
  fontWeight: 600,
  fontStyle: "normal",
};

function Home() {
  return (
    <div style={customFontStyle} className="flex flex-col min-h-screen bg-white">
      {/* Render the Header directly without a wrapper */}
      <Header />

      {/* Main content takes the rest of the screen height */}
      <main className="flex-grow">
        {/* Main Hero Section */}
        <div className="relative w-full h-screen overflow-hidden">

          {/* Full Background Image */}
          <div className="absolute inset-0 z-0">
            <img
              src={mainPhoto}
              alt="Modern Luxury Home"
              className="w-full h-full object-cover object-center"
            />
            {/* White Shadow/Overlay Effect for Text Readability */}
            <div className="absolute inset-0 bg-gradient-to-r from-white via-white/70 to-transparent z-10" />
          </div>

          {/* Main Content */}
          <div className="relative z-10 flex flex-col justify-center h-full max-w-7xl mx-auto px-6 md:px-12 pt-20">

            {/* Hero Text & CTA */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="max-w-2xl"
            >
              <div className="mb-6">
                <span className="bg-white/60 backdrop-blur-md border border-white/40 text-indigo-900 px-5 py-2 rounded-full text-sm font-semibold tracking-wide shadow-sm">
                  BUILT TO INSPIRE
                </span>
              </div>
              <h1 style={customFontStyle} className="text-5xl md:text-7xl font-bold text-slate-900 leading-[1.1] mb-8 tracking-tight">
                Your Real Estate <span className='text-green-600/80 relative inline-block'>
                  Journey
                  <svg className="absolute w-full h-3 -bottom-1 left-0 text-indigo-200 -z-10" viewBox="0 0 100 10" preserveAspectRatio="none">
                    <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" />
                  </svg>
                </span> starts here
              </h1>
              <p className="text-xl md:text-2xl text-slate-600 font-medium mb-10 max-w-lg leading-relaxed">
                Discover properties that match your lifestyle. From city condos to suburban homes, we've got you covered.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full sm:w-auto bg-slate-900 text-white font-semibold px-8 py-4 rounded-full flex items-center justify-center space-x-3 hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-5 h-5" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full sm:w-auto bg-white/50 backdrop-blur-sm border border-white/60 text-slate-900 font-semibold px-8 py-4 rounded-full flex items-center justify-center space-x-3 hover:bg-white/80 transition-all shadow-sm"
                >
                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                    <Play className="w-4 h-4 text-indigo-600 ml-0.5" fill="currentColor" />
                  </div>
                  <span>Watch Demo</span>
                </motion.button>
              </div>
            </motion.div>

            {/* Bottom Controls / Indicators */}
            <div className="absolute bottom-12 left-0 right-0 px-6 md:px-12 flex justify-between items-end">
              {/* Left: Stats */}


              {/* Right: Slide Controls */}

            </div>

          </div>
        </div>

        {/* Render the Home Components */}
        <Home2 />
        <Home3 />
      </main>

      <footer>
        <Footer />
      </footer>
    </div>
  );
}

export default Home;