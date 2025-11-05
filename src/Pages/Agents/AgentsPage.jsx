import React, { useState } from 'react';
import { Search, MapPin, Phone, Mail, Star, Filter, Grid, List, Building2, Award, Users } from 'lucide-react';

function AgentsPage() {
  const [viewMode, setViewMode] = useState('grid');
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Mock agent data
  const agents = [
    {
      id: 1,
      name: "Rajesh Sharma",
      company: "Prime Properties",
      location: "Mumbai, Maharashtra",
      rating: 4.9,
      properties: 127,
      experience: "8 years",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
      phone: "+91 98765 43210",
      email: "rajesh@primeproperties.com",
      specialties: ["Residential", "Commercial", "Luxury Properties"]
    },
    {
      id: 2,
      name: "Priya Patel",
      company: "Elite Real Estate",
      location: "Delhi, India",
      rating: 4.8,
      properties: 98,
      experience: "6 years",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80",
      phone: "+91 98765 43211",
      email: "priya@eliterealestate.com",
      specialties: ["Residential", "Investment Properties"]
    },
    {
      id: 3,
      name: "Amit Kumar",
      company: "Skyline Properties",
      location: "Bangalore, Karnataka",
      rating: 4.7,
      properties: 156,
      experience: "10 years",
      image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80",
      phone: "+91 98765 43212",
      email: "amit@skylineproperties.com",
      specialties: ["Commercial", "Industrial", "New Projects"]
    },
    {
      id: 4,
      name: "Sneha Gupta",
      company: "Golden Landmarks",
      location: "Chennai, Tamil Nadu",
      rating: 4.9,
      properties: 89,
      experience: "7 years",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=80",
      phone: "+91 98765 43213",
      email: "sneha@goldenlandmarks.com",
      specialties: ["Luxury Homes", "Villas", "Penthouses"]
    },
    {
      id: 5,
      name: "Vikram Singh",
      company: "Heritage Properties",
      location: "Pune, Maharashtra",
      rating: 4.6,
      properties: 203,
      experience: "12 years",
      image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=200&q=80",
      phone: "+91 98765 43214",
      email: "vikram@heritageproperties.com",
      specialties: ["Land", "Plots", "Residential"]
    },
    {
      id: 6,
      name: "Anjali Reddy",
      company: "Urban Spaces",
      location: "Hyderabad, Telangana",
      rating: 4.8,
      properties: 76,
      experience: "5 years",
      image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80",
      phone: "+91 98765 43215",
      email: "anjali@urbanspaces.com",
      specialties: ["Rental", "Commercial", "New Projects"]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 pt-24 pb-16">
      {/* Page Header */}
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent mb-4">
            Meet Our Expert Agents
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Connect with our experienced real estate professionals who will help you find your dream property or sell your home efficiently.
          </p>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg border border-gray-200/50 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by name, location, or specialty..."
                className="w-full pl-12 pr-4 py-4 border-0 bg-gray-50 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-200"
              />
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setFiltersOpen(!filtersOpen)}
                className="flex items-center gap-2 px-6 py-4 bg-white border-0 rounded-2xl hover:bg-gray-50 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <Filter size={20} className="text-gray-600" />
                <span className="text-gray-700 font-medium">Filters</span>
              </button>
              <button
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                className="p-4 bg-white border-0 rounded-2xl hover:bg-gray-50 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                {viewMode === 'grid' ? <List size={20} className="text-gray-600" /> : <Grid size={20} className="text-gray-600" />}
              </button>
            </div>
          </div>

          {/* Filters Panel */}
          {filtersOpen && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <select className="px-4 py-3 border-0 bg-gray-50 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all duration-200">
                  <option>All Locations</option>
                  <option>Mumbai</option>
                  <option>Delhi</option>
                  <option>Bangalore</option>
                  <option>Chennai</option>
                </select>
                <select className="px-4 py-3 border-0 bg-gray-50 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all duration-200">
                  <option>All Specialties</option>
                  <option>Residential</option>
                  <option>Commercial</option>
                  <option>Luxury</option>
                  <option>Land</option>
                </select>
                <select className="px-4 py-3 border-0 bg-gray-50 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all duration-200">
                  <option>Any Experience</option>
                  <option>0-5 years</option>
                  <option>5-10 years</option>
                  <option>10+ years</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Agent Count */}
        <div className="mb-6">
          <p className="text-gray-600 font-medium">
            Showing <span className="text-blue-600 font-bold">{agents.length}</span> expert agents
          </p>
        </div>

        {/* Agents Grid/List */}
        <div className={viewMode === 'grid' 
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" 
          : "space-y-8"
        }>
          {agents.map((agent) => (
            <div key={agent.id} className={`bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg border border-gray-200/50 overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 ${
              viewMode === 'list' ? 'flex' : ''
            }`}>
              {/* Agent Image */}
              <div className={`relative ${viewMode === 'list' ? 'w-72 flex-shrink-0' : ''}`}>
                <img
                  src={agent.image}
                  alt={agent.name}
                  className={`w-full object-cover ${viewMode === 'list' ? 'h-full' : 'h-56'}`}
                />
                <div className="absolute top-4 left-4 bg-gradient-to-r from-green-500 to-blue-600 text-white px-4 py-2 rounded-2xl text-sm font-bold shadow-lg">
                  {agent.experience}
                </div>
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 shadow-lg">
                  <div className="flex items-center">
                    <Star size={16} className="fill-yellow-400 text-yellow-400 mr-1" />
                    <span className="text-sm font-bold text-gray-800">{agent.rating}</span>
                  </div>
                </div>
              </div>
              
              {/* Agent Details */}
              <div className="p-8 flex-1">
                <div className="mb-4">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{agent.name}</h3>
                  <p className="text-gray-600 text-lg mb-2">{agent.company}</p>
                  <div className="flex items-center text-gray-500 mb-4">
                    <MapPin size={18} className="mr-2 text-blue-500" />
                    <span className="text-sm">{agent.location}</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-2xl">
                    <div className="flex items-center">
                      <Building2 size={20} className="text-blue-600 mr-2" />
                      <div>
                        <p className="text-2xl font-bold text-gray-900">{agent.properties}</p>
                        <p className="text-xs text-gray-600">Properties</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-2xl">
                    <div className="flex items-center">
                      <Award size={20} className="text-green-600 mr-2" />
                      <div>
                        <p className="text-2xl font-bold text-gray-900">{agent.experience.split(' ')[0]}</p>
                        <p className="text-xs text-gray-600">Years Exp</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <h4 className="text-sm font-bold text-gray-700 mb-3">Specialties:</h4>
                  <div className="flex flex-wrap gap-2">
                    {agent.specialties.map((specialty, index) => (
                      <span key={index} className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium hover:from-blue-200 hover:to-purple-200 transition-all duration-200">
                        {specialty}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                  <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-5 py-3 bg-gray-100 hover:bg-gray-200 rounded-2xl transition-all duration-200">
                      <Phone size={18} className="text-gray-600" />
                      <span className="text-sm font-medium text-gray-700">Call</span>
                    </button>
                    <button className="flex items-center gap-2 px-5 py-3 bg-gray-100 hover:bg-gray-200 rounded-2xl transition-all duration-200">
                      <Mail size={18} className="text-gray-600" />
                      <span className="text-sm font-medium text-gray-700">Email</span>
                    </button>
                  </div>
                  <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-bold shadow-lg hover:shadow-xl transform hover:scale-105">
                    Contact Agent
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Load More Button */}
        {agents.length > 0 && (
          <div className="text-center mt-16">
            <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-10 py-4 rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-bold shadow-2xl hover:shadow-3xl transform hover:scale-105">
              Load More Agents
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default AgentsPage;