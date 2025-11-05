import { ArrowLeft, ArrowRight, Search } from 'lucide-react';
// Import Header and Footer components inside the Home component file
import Header from './Header/Header'; // Adjust path as needed based on your folder structure
import Footer from './Footer/Footer'; // Adjust path as needed based on your folder structure
import mainPhoto from '../../public/assets/mainvilla.jpg';

const customFontStyle = {
  fontFamily: "'Neue Montreal Regular', sans-serif",
  fontWeight: 600,
  fontStyle: "normal",
};


function Home() {
  return (
    <div style={customFontStyle} className="flex flex-col min-h-screen">
      {/* Render the Header directly without a wrapper */}
      

      {/* Main content takes the rest of the screen height */}
      <main className="flex-grow">
        {/* Main Hero Section */}
        <div className="relative w-full h-screen overflow-hidden bg-gray-900">
          {/* Background Image */}
          <div className="absolute inset-0">
            <img
              src={mainPhoto}
              alt="Modern Luxury Home at Dusk"
              className="w-full h-full object-cover object-center"
            />
            {/* Black gradient from top to bottom */}
            <div className="absolute inset-0 bg-gradient-to-b from-black via-black/70 via-black/40 to-black/0"></div>
          </div>

          {/* Main Content */}
          <div className="relative z-10 flex flex-col justify-between h-full p-6 md:p-12">

            {/* Hero Text & CTA at the top */}
            <div className="max-w-4xl mt-12 md:mt-20">
              <div className="mb-4">
                <span className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium">
                  BUILT TO INSPIRE
                </span>
              </div>
              <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-tight mb-6">
                Your real estate <span className='text-green-500'>journey</span> starts here
              </h1>
              <p className="text-lg md:text-xl text-gray-200 mb-8 max-w-2xl">
                Discover properties that match your lifestyle from city condos to suburban homes, we've got you covered.
              </p>
              <button className="bg-white text-gray-900 font-semibold px-6 py-3 rounded-full flex items-center space-x-2 hover:bg-gray-100 transition-colors">
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
              <div className="flex items-center space-x-2 text-white/90">
                <button className="p-2 bg-white/20 hover:bg-white/30 rounded-full backdrop-blur-sm transition-colors">
                  <ArrowLeft size={20} />
                </button>
                <span className="text-sm">For More Cases</span>
                <span className="font-bold text-base">Property</span>
                {/* Moved BUILT TO INSPIRE here */}
                <span className="ml-4 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium">
                  BUILT TO INSPIRE
                </span>
              </div>

              {/* Right: Arrow Controls */}
              <div className="flex items-center space-x-2">
                <button className="p-2 bg-white/20 hover:bg-white/30 rounded-full backdrop-blur-sm transition-colors">
                  <ArrowLeft size={20} className="text-white" />
                </button>
                <button className="p-2 bg-white/20 hover:bg-white/30 rounded-full backdrop-blur-sm transition-colors">
                  <ArrowRight size={20} className="text-white" />
                </button>
              </div>
            </div>

            {/* Stats Circles - Right Side */}
            <div className="absolute bottom-8 right-8 flex flex-col space-y-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-full p-6 text-center text-white">
                <div className="text-2xl font-bold">50+</div>
                <div className="text-xs opacity-80">Project complete</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-full p-6 text-center text-white">
                <div className="text-2xl font-bold">$3.5M</div>
                <div className="text-xs opacity-80">Project value</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-full p-6 text-center text-white">
                <div className="text-2xl font-bold">100+</div>
                <div className="text-xs opacity-80">Expert teams</div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer>
        <Footer />
      </footer>
    </div>
  );
}

export default Home;