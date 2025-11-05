// shrijeefrontend/src/Pages/Property/Properties.jsx
import React, { useState } from 'react';
import { Search, MapPin, Filter, Grid, List, Heart, Star } from 'lucide-react';

function PropertyPage() {
  const [activeTab, setActiveTab] = useState('All Properties');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Mock property data
  const properties = [
    {
      id: 1,
      title: "Luxury Villa in Premium Location",
      type: "Residential",
      price: "₹ 2.5 Cr",
      location: "Mumbai, Maharashtra",
      area: "2,500 sq.ft.",
      bedrooms: 4,
      bathrooms: 3,
      image: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=800",
      featured: true,
      isLiked: false
    },
    {
      id: 2,
      title: "Modern Office Space in Business District",
      type: "Commercial",
      price: "₹ 80 L",
      location: "Bangalore, Karnataka",
      area: "1,200 sq.ft.",
      bedrooms: 0,
      bathrooms: 2,
      image: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=800",
      featured: false,
      isLiked: true
    },
    {
      id: 3,
      title: "Spacious 3BHK Apartment",
      type: "Residential",
      price: "₹ 75 L",
      location: "Delhi, India",
      area: "1,800 sq.ft.",
      bedrooms: 3,
      bathrooms: 2,
      image: "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?auto=format&fit=crop&w=800",
      featured: true,
      isLiked: false
    },
    {
      id: 4,
      title: "Commercial Plot in Prime Location",
      type: "Plots / Land",
      price: "₹ 1.2 Cr",
      location: "Chennai, Tamil Nadu",
      area: "5,000 sq.ft.",
      bedrooms: 0,
      bathrooms: 0,
      image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=800",
      featured: false,
      isLiked: false
    },
    {
      id: 5,
      title: "Cozy 2BHK for Rent",
      type: "Rent / Lease",
      price: "₹ 25,000/month",
      location: "Pune, Maharashtra",
      area: "1,200 sq.ft.",
      bedrooms: 2,
      bathrooms: 2,
      image: "https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=800",
      featured: false,
      isLiked: true
    },
    {
      id: 6,
      title: "New Residential Project Launch",
      type: "New Projects",
      price: "₹ 45 L - 80 L",
      location: "Hyderabad, Telangana",
      area: "1,000 - 1,800 sq.ft.",
      bedrooms: 2,
      bathrooms: 1,
      image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800",
      featured: true,
      isLiked: false
    }
  ];

  // Filter properties based on active tab
  const filteredProperties = activeTab === 'All Properties' 
    ? properties 
    : properties.filter(property => property.type === activeTab);

  // Tabs configuration
  const tabs = [
    "All Properties",
    "Residential", 
    "Commercial", 
    "Plots / Land", 
    "Rent / Lease", 
    "New Projects"
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16">
      {/* Page Header */}
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Find Your Perfect Property</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover the best properties across India with our comprehensive search and filtering options
          </p>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by location, property name, or keyword..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setFiltersOpen(!filtersOpen)}
                className="flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <Filter size={20} />
                <span>Filters</span>
              </button>
              <button
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                className="p-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
              >
                {viewMode === 'grid' ? <List size={20} /> : <Grid size={20} />}
              </button>
            </div>
          </div>

          {/* Filters Panel */}
          {filtersOpen && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <select className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option>All Types</option>
                  <option>Residential</option>
                  <option>Commercial</option>
                  <option>Land</option>
                </select>
                <select className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option>Any Budget</option>
                  <option>Under ₹ 50L</option>
                  <option>₹ 50L - ₹ 1Cr</option>
                  <option>Above ₹ 1Cr</option>
                </select>
                <select className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option>Any Size</option>
                  <option>Under 1000 sq.ft.</option>
                  <option>1000-2000 sq.ft.</option>
                  <option>Above 2000 sq.ft.</option>
                </select>
                <select className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option>All BHK</option>
                  <option>1 BHK</option>
                  <option>2 BHK</option>
                  <option>3 BHK+</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 mb-8">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                activeTab === tab
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Property Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            Showing {filteredProperties.length} properties in {activeTab}
          </p>
        </div>

        {/* Properties Grid/List */}
        <div className={viewMode === 'grid' 
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
          : "space-y-6"
        }>
          {filteredProperties.map((property) => (
            <div key={property.id} className={`bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-300 ${
              viewMode === 'list' ? 'flex' : ''
            }`}>
              {/* Property Image */}
              <div className={`relative ${viewMode === 'list' ? 'w-80 flex-shrink-0' : ''}`}>
                <img
                  src={property.image}
                  alt={property.title}
                  className={`w-full object-cover ${viewMode === 'list' ? 'h-full' : 'h-48'}`}
                />
                {property.featured && (
                  <div className="absolute top-3 left-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                    Featured
                  </div>
                )}
                <button className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors">
                  <Heart 
                    size={20} 
                    className={property.isLiked ? "fill-red-500 text-red-500" : "text-gray-600"} 
                  />
                </button>
                <div className="absolute bottom-3 left-3 bg-white px-2 py-1 rounded-full text-xs font-medium">
                  {property.type}
                </div>
              </div>
              
              {/* Property Details */}
              <div className="p-6 flex-1">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{property.title}</h3>
                  <span className="text-2xl font-bold text-blue-600">{property.price}</span>
                </div>
                
                <div className="flex items-center text-gray-600 mb-3">
                  <MapPin size={16} className="mr-1" />
                  <span className="text-sm">{property.location}</span>
                </div>
                
                <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
                  <span className="flex items-center">
                    <span className="font-medium">{property.bedrooms}</span> BHK
                  </span>
                  <span className="flex items-center">
                    <span className="font-medium">{property.bathrooms}</span> Bath
                  </span>
                  <span className="flex items-center">
                    <span className="font-medium">{property.area}</span>
                  </span>
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center">
                    <Star size={16} className="fill-yellow-400 text-yellow-400 mr-1" />
                    <span className="text-sm text-gray-600">4.8</span>
                  </div>
                  <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium">
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Load More Button */}
        {filteredProperties.length > 0 && (
          <div className="text-center mt-12">
            <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium">
              Load More Properties
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default PropertyPage;