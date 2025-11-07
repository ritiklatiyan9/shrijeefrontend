// src/Pages/Home.jsx
import { ArrowLeft, ArrowRight, Search } from 'lucide-react';
import Header from './Header/Header'; // Adjust path as needed based on your folder structure
import Footer from './Footer/Footer'; // Adjust path as needed based on your folder structure
import mainPhoto from '../../public/assets/mainvilla.jpg';
import Home2 from './Home2';
import Home3 from './Home3';

const customFontStyle = {
  fontFamily: "'Neue Montreal Regular', sans-serif",
  fontWeight: 600,
  fontStyle: "normal",
};

function Home() {
  return (
    <div style={customFontStyle} className="flex flex-col min-h-screen">
      {/* Render the Header directly without a wrapper */}
      <Header />

      {/* Main content takes the rest of the screen height */}
      <main className="flex-grow">
        {/* Main Hero Section */}
        <div className="relative w-full h-screen overflow-hidden bg-gray-900">
          {/* Background Image */}
          <div className="absolute inset-0">
            <img
              src={mainPhoto}
              alt="Modern Luxury Home at Dusk"
              className="w-full h-full object-cover object-center brightness-50"
            />
            {/* White gradient fade at the top */}
            <div className="absolute top-0 left-0 w-full h-1/3 bg-gradient-to-b from-zinc-400 to-transparent"></div>
            {/* White gradient fade at the bottom */}
         
          </div>

          {/* Main Content */}
          <div className="relative z-10 flex flex-col justify-between h-full p-6 md:p-12">

            {/* Hero Text & CTA at the top */}
            <div className="max-w-4xl mt-12 md:mt-20">
              <div className="mb-4">
                <span className="bg-black/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium drop-shadow-[0_2px_6px_rgba(0,0,0,0.5)]">
                  BUILT TO INSPIRE
                </span>
              </div>
              <h1 style={customFontStyle} className="text-4xl md:text-7xl font-extrabold text-white leading-tight mb-6 font-serif drop-shadow-[0_2px_6px_rgba(0,0,0,0.5)]">
                Your real estate <span className='text-[#A3E635]'>journey</span> starts here
              </h1>
              <p className="text-lg md:text-xl text-white font-extrabold mb-8 max-w-2xl [text-shadow:0_0_15px_rgba(0,0,0,1),0_0_25px_rgba(0,0,0,0.9)]">
              Discover properties that match your lifestyle from city condos to suburban homes, we've got you covered.
              </p>

              <button className="bg-black text-white font-semibold px-6 py-3 rounded-full flex items-center space-x-2 hover:bg-gray-800 transition-colors">
                <span>Get Started</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14"></path>
                  <path d="m12 5 7 7-7 7"></path>
                </svg>
              </button>
            </div>

            {/* Top Navigation / Controls at the bottom */}
            <div className="flex justify-between items-start w-full">
              {/* Left: "For More Cases" + Property Label */}
              <div className="flex items-center space-x-2 text-black/90">
                <button className="p-2 bg-black/20 hover:bg-black/30 rounded-full backdrop-blur-sm transition-colors">
                  <ArrowLeft size={20} />
                </button>
                <span className="text-sm font-bold drop-shadow-[0_2px_6px_rgba(0,0,0,0.5)]">For More Cases</span>
                <span className="font-bold text-base drop-shadow-[0_2px_6px_rgba(0,0,0,0.5)]">Property</span>
                {/* Moved BUILT TO INSPIRE here */}
                <span className="ml-4 bg-black/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium drop-shadow-[0_2px_6px_rgba(0,0,0,0.5)]">
                  BUILT TO INSPIRE
                </span>
              </div>

              {/* Right: Arrow Controls */}
              <div className="flex items-center space-x-2">
                <button className="p-2 bg-black/20 hover:bg-black/30 rounded-full backdrop-blur-sm transition-colors">
                  <ArrowLeft size={20} className="text-black" />
                </button>
                <button className="p-2 bg-black/20 hover:bg-black/30 rounded-full backdrop-blur-sm transition-colors">
                  <ArrowRight size={20} className="text-black" />
                </button>
              </div>
            </div>

            {/* Stats Circles - Right Side */}
            <div className="absolute bottom-8 right-8 flex flex-col space-y-4">
              <div className="bg-black/10 backdrop-blur-sm rounded-full p-6 text-center text-black drop-shadow-[0_2px_6px_rgba(0,0,0,0.5)]">
                <div className="text-2xl text-white font-bold">50+</div>
                <div className="text-xs opacity-80 text-white">Project complete</div>
              </div>
              <div className="bg-black/10 backdrop-blur-sm rounded-full p-6 text-center text-black drop-shadow-[0_2px_6px_rgba(0,0,0,0.5)]">
                <div className="text-2xl font-bold text-white">$3.5M</div>
                <div className="text-xs opacity-80 text-white">Project value</div>
              </div>
              <div className="bg-black/10 backdrop-blur-sm rounded-full p-6 text-center text-black drop-shadow-[0_2px_6px_rgba(0,0,0,0.5)]">
                <div className="text-2xl font-bold text-white">100+</div>
                <div className="text-xs opacity-80 text-white">Expert teams</div>
              </div>
            </div>
          </div>
        </div>

        {/* Render the Home2 component below the hero section */}
        <Home2 />
        <Home3/>
      </main>

      <footer>
        <Footer />
      </footer>
    </div>
  );
}

export default Home;