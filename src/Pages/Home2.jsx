// src/Pages/Home2.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Search, Home, Key, TrendingUp } from 'lucide-react';

const customFontStyle = {
  fontFamily: "'Neue Montreal Regular', sans-serif",
  fontWeight: 600,
  fontStyle: "normal",
};

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const cardAnimation = {
  initial: { opacity: 0, y: 20 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: { 
      duration: 0.5,
      ease: [0.43, 0.13, 0.23, 0.96]
    }
  }
};

const cardHover = {
  scale: 1.03,
  y: -10,
  boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
  transition: { duration: 0.3, ease: "easeOut" }
};

const stepAnimation = {
  initial: { scale: 0, opacity: 0 },
  animate: { 
    scale: 1, 
    opacity: 1,
    transition: { 
      duration: 0.5,
      ease: [0.43, 0.13, 0.23, 0.96]
    }
  }
};

const lineAnimation = {
  initial: { scaleX: 0 },
  animate: { 
    scaleX: 1,
    transition: { 
      duration: 1,
      delay: 0.8,
      ease: "easeInOut"
    }
  }
};

function Home2() {
  return (
    <div style={customFontStyle} className="flex flex-col min-h-screen bg-white">
      {/* Main content */}
      <main className="flex-grow py-12 px-6 md:px-16">

        {/* Section 1: Headline & Subtitle with animation */}
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <motion.h1 
            className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            See how Divine Home can help
          </motion.h1>
          <motion.p 
            className="text-lg text-gray-500 max-w-3xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Let Divine Do the Heavy Lifting — Making Your Experience Effortless and Enjoyable.
          </motion.p>
        </motion.div>

        {/* Section 2: Three Service Cards with stagger animation */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          {/* Card 1: Buy Home */}
          <motion.div 
            className="bg-gray-100 p-6 rounded-xl cursor-pointer"
            variants={cardAnimation}
            whileHover={cardHover}
            whileTap={{ scale: 0.98 }}
          >
            <motion.div 
              className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-4"
              whileHover={{ rotate: 360, scale: 1.1 }}
              transition={{ duration: 0.5 }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>
            </motion.div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Buy Home</h3>
            <p className="text-gray-600">
              With over 1 million+ homes for sale, find the perfect match for your lifestyle.
            </p>
            <motion.div 
              className="mt-4 flex items-center text-green-600 font-medium opacity-0"
              whileHover={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <span className="text-sm">Learn more</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </motion.div>
          </motion.div>

          {/* Card 2: Rent a home */}
          <motion.div 
            className="bg-gray-100 p-6 rounded-xl cursor-pointer"
            variants={cardAnimation}
            whileHover={cardHover}
            whileTap={{ scale: 0.98 }}
          >
            <motion.div 
              className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-4"
              whileHover={{ rotate: 360, scale: 1.1 }}
              transition={{ duration: 0.5 }}
            >
              <Key className="w-6 h-6" />
            </motion.div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Rent a home</h3>
            <p className="text-gray-600">
              Browse through thousands of rental options to suit every budget and need.
            </p>
            <motion.div 
              className="mt-4 flex items-center text-blue-600 font-medium opacity-0"
              whileHover={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <span className="text-sm">Learn more</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </motion.div>
          </motion.div>

          {/* Card 3: See Home Prices */}
          <motion.div 
            className="bg-gray-100 p-6 rounded-xl cursor-pointer"
            variants={cardAnimation}
            whileHover={cardHover}
            whileTap={{ scale: 0.98 }}
          >
            <motion.div 
              className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-4"
              whileHover={{ rotate: 360, scale: 1.1 }}
              transition={{ duration: 0.5 }}
            >
              <TrendingUp className="w-6 h-6" />
            </motion.div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">See Home Prices</h3>
            <p className="text-gray-600">
              List your property in minutes and reach millions of serious buyers instantly.
            </p>
            <motion.div 
              className="mt-4 flex items-center text-purple-600 font-medium opacity-0"
              whileHover={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <span className="text-sm">Learn more</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Section 3: Journey Timeline with animations */}
        <motion.div 
          className="mb-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <motion.h2 
            className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            Peace of mind at every step of your journey home
          </motion.h2>

          <div className="relative max-w-4xl mx-auto px-4">
            <motion.div 
              className="flex flex-col md:flex-row items-center justify-between relative"
              variants={staggerContainer}
              initial="initial"
              animate="animate"
            >
              {/* Animated Connector Line */}
              <motion.div 
                className="hidden md:block absolute top-6 left-0 right-0 h-0.5 bg-gradient-to-r from-green-400 via-blue-500 to-purple-500 z-0 origin-left"
                variants={lineAnimation}
                initial="initial"
                animate="animate"
              />

              {/* Step 1 */}
              <motion.div 
                className="flex flex-col items-center mb-6 md:mb-0 z-10"
                variants={stepAnimation}
                custom={0}
                whileHover={{ scale: 1.1 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <motion.div 
                  className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center font-bold text-lg shadow-lg"
                  whileHover={{ 
                    boxShadow: "0 0 20px rgba(0,0,0,0.3)",
                    rotate: 5
                  }}
                >
                  1
                </motion.div>
                <motion.div 
                  className="mt-4 text-center text-gray-700 font-medium"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                >
                  Discover House
                </motion.div>
              </motion.div>

              {/* Step 2 */}
              <motion.div 
                className="flex flex-col items-center mb-6 md:mb-0 z-10"
                variants={stepAnimation}
                custom={1}
                whileHover={{ scale: 1.1 }}
                transition={{ type: "spring", stiffness: 400, delay: 0.1 }}
              >
                <motion.div 
                  className="w-12 h-12 bg-gray-200 text-gray-800 rounded-full flex items-center justify-center font-bold text-lg"
                  whileHover={{ 
                    backgroundColor: "#1f2937",
                    color: "#ffffff",
                    rotate: 5
                  }}
                >
                  2
                </motion.div>
                <motion.div 
                  className="mt-4 text-center text-gray-700 font-medium"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.1 }}
                >
                  Schedule to visit
                </motion.div>
              </motion.div>

              {/* Step 3 */}
              <motion.div 
                className="flex flex-col items-center mb-6 md:mb-0 z-10"
                variants={stepAnimation}
                custom={2}
                whileHover={{ scale: 1.1 }}
                transition={{ type: "spring", stiffness: 400, delay: 0.2 }}
              >
                <motion.div 
                  className="w-12 h-12 bg-gray-200 text-gray-800 rounded-full flex items-center justify-center font-bold text-lg"
                  whileHover={{ 
                    backgroundColor: "#1f2937",
                    color: "#ffffff",
                    rotate: 5
                  }}
                >
                  3
                </motion.div>
                <motion.div 
                  className="mt-4 text-center text-gray-700 font-medium"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.2 }}
                >
                  Hassle free purchase
                </motion.div>
              </motion.div>

              {/* Step 4 */}
              <motion.div 
                className="flex flex-col items-center z-10"
                variants={stepAnimation}
                custom={3}
                whileHover={{ scale: 1.1 }}
                transition={{ type: "spring", stiffness: 400, delay: 0.3 }}
              >
                <motion.div 
                  className="w-12 h-12 bg-gray-200 text-gray-800 rounded-full flex items-center justify-center font-bold text-lg"
                  whileHover={{ 
                    backgroundColor: "#1f2937",
                    color: "#ffffff",
                    rotate: 5
                  }}
                >
                  4
                </motion.div>
                <motion.div 
                  className="mt-4 text-center text-gray-700 font-medium"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.3 }}
                >
                  Buy back guarantee
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>

        {/* Section 4: CTA Banner with Image animations */}
        <motion.div 
         className="relative rounded-2xl overflow-hidden mb-12 w-4/5 mx-auto"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          whileHover={{ scale: 1.01 }}
        >
          {/* Background Image with parallax effect */}
          <motion.div
            className="relative overflow-hidden"
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1.2 }}
          >
            <img
              src="https://coralhomes.com.au/wp-content/uploads/Atlanta-Series.png"
              alt="Modern house exterior"
              className="w-full h-80 md:h-96 object-cover"
            />
            {/* Gradient Overlay */}
            <motion.div 
              className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-transparent"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.5 }}
            />
          </motion.div>

          {/* Overlay Text Card with slide animation */}
          <motion.div 
            className="absolute inset-0 flex items-center justify-center md:justify-end p-6 md:p-12 w-4/5 mx-auto"
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.6, ease: "easeOut" }}
          >
            <motion.div 
              className="bg-white p-6 rounded-lg shadow-sm max-w-md w-full"
              whileHover={{ 
                boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
                y: -5
              }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                Find a home just right for you
              </h2>
              <p className="text-gray-600 mb-6">
                Discover the power of Divine, Unveiling How divine Can Simplify and Enhance Your Experience.
              </p>
              <motion.button 
                className="text-green-600 font-semibold underline hover:text-green-700 transition-colors inline-flex items-center group"
                whileHover={{ x: 5 }}
                whileTap={{ scale: 0.95 }}
              >
                Explore All Property
                <motion.span
                  className="ml-2 inline-block"
                  animate={{ x: [0, 5, 0] }}
                  transition={{ 
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  →
                </motion.span>
              </motion.button>
            </motion.div>
          </motion.div>
        </motion.div>

      </main>
    </div>
  );
}

export default Home2;