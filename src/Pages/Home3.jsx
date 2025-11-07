// src/Pages/Home3.jsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Mail, Star, Award, Briefcase } from 'lucide-react';

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
  initial: { opacity: 0, y: 20, scale: 0.95 },
  animate: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { 
      duration: 0.5,
      ease: [0.43, 0.13, 0.23, 0.96]
    }
  },
  hover: {
    y: -8,
    transition: { duration: 0.3, ease: "easeOut" }
  }
};

const imageAnimation = {
  initial: { scale: 1.1, filter: "blur(8px)" },
  animate: { 
    scale: 1, 
    filter: "blur(0px)",
    transition: { duration: 0.8 }
  }
};

function Home3() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [hoveredAgent, setHoveredAgent] = useState(null);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setTimeout(() => {
        setSubscribed(false);
        setEmail('');
      }, 3000);
    }
  };

  const agents = [
    { 
      id: 1,
      name: 'Arjun Singh', 
      role: 'Property manager', 
      rating: 4.9, 
      deals: 127,
      image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400&q=80'
    },
    { 
      id: 2,
      name: 'Mohit Kumar', 
      role: 'Property manager', 
      rating: 4.8, 
      deals: 98,
      image: 'https://images.unsplash.com/photo-1556157382-97eda2d62296?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400&q=80'
    },
    { 
      id: 3,
      name: 'Anushka Gupta', 
      role: 'Property manager', 
      rating: 5.0, 
      deals: 145,
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400&q=80'
    },
    { 
      id: 4,
      name: 'Ananya Sharma', 
      role: 'Property manager', 
      rating: 4.7, 
      deals: 89,
      image: 'https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400&q=80'
    }
  ];

  return (
    <div style={customFontStyle} className="flex flex-col min-h-screen bg-white">
      {/* Main content */}
      <main className="flex-grow py-12 px-6 md:px-16">

        {/* Section 1: Headline & Subtitle - Matching Home2 sizing */}
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.h1 
            className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Start Your Journey With Our Amazing Agents
          </motion.h1>
          <motion.p 
            className="text-lg text-gray-500 max-w-3xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Discover the power of Divine, Unveiling How divine Can Simplify and Enhance Your Experience.
          </motion.p>
        </motion.div>

        {/* Section 2: Agent Cards - Matching Home2 card sizing */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-16"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          {agents.map((agent, index) => (
            <motion.div
              key={agent.id}
              className="bg-gray-100 p-6 rounded-xl hover:shadow-xl transition-all duration-300 cursor-pointer"
              variants={cardAnimation}
              whileHover="hover"
              onMouseEnter={() => setHoveredAgent(agent.id)}
              onMouseLeave={() => setHoveredAgent(null)}
            >
              {/* Image with animation */}
              <motion.div className="relative h-66 mb-4 rounded-lg overflow-hidden">

                <motion.img 
                  src={agent.image} 
                  alt={agent.name} 
                  className="w-full h-full object-cover"
                  initial={{ scale: 1.2 }}
                  animate={{ scale: hoveredAgent === agent.id ? 1.1 : 1 }}
                  transition={{ duration: 0.4 }}
                />
                {/* Gradient Overlay on hover */}
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: hoveredAgent === agent.id ? 1 : 0 }}
                  transition={{ duration: 0.3 }}
                />
                
                {/* Rating Badge */}
                <motion.div 
                  className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-1"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                >
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  <span className="text-sm font-semibold text-gray-800">{agent.rating}</span>
                </motion.div>

                {/* Deals Badge */}
                <motion.div 
                  className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-1"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: hoveredAgent === agent.id ? 1 : 0, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Briefcase className="w-3 h-3 text-green-600" />
                  <span className="text-xs font-medium text-gray-800">{agent.deals} deals</span>
                </motion.div>
              </motion.div>

              {/* Content */}
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {agent.name}
              </h3>
              <p className="text-gray-600 mb-4">
                {agent.role}
              </p>

              {/* Action Button */}
              <div className="flex justify-center">
                <motion.button 
                  className="w-8 h-8 bg-white rounded-full flex items-center justify-center hover:bg-gray-800 hover:text-white transition-all duration-300"
                  whileHover={{ scale: 1.1, rotate: 45 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <ArrowRight size={16} />
                </motion.button>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Section 3: Join Button with animation */}
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <motion.button 
            className="bg-black text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
            whileHover={{ scale: 1.05, boxShadow: "0 10px 30px rgba(0,0,0,0.2)" }}
            whileTap={{ scale: 0.95 }}
          >
            Join with us
          </motion.button>
        </motion.div>

        {/* Section 4: Newsletter Banner - Matching Home2 CTA sizing */}
        <motion.div 
          className="relative rounded-2xl overflow-hidden mb-12 w-4/5 mx-auto"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          {/* Background Image with animation */}
          <motion.div 
            className="relative h-80 md:h-96 overflow-hidden"
            variants={imageAnimation}
            initial="initial"
            animate="animate"
          >
            <img
              src="https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=600&q=80"
              alt="Modern bedroom interior"
              className="w-full h-full object-cover"
            />
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-transparent" />
          </motion.div>

         
        </motion.div>

      </main>
    </div>
  );
}

export default Home3;