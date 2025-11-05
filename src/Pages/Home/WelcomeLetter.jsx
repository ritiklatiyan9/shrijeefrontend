import { useAuth } from '../../context/AuthContext';
import { Download, Mail, Phone, MapPin, User, Calendar, Hash, Loader2 } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { useState, useEffect } from 'react';

function WelcomeLetter() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState(null);

  const companyInfo = {
    name: "Shree Jee Real Estate",
    logo: "/src/assets/logo.png",
    address: "123 Business District, Real Estate Hub, City 110001",
    phone: "+91 98765 43210",
    email: "info@shreejee.realestate",
    website: "www.shreejee.realestate"
  };

  useEffect(() => {
    if (user) {
      // Extract user data from AuthContext
      setUserData({
        memberId: user.memberId || 'N/A',
        fullName: user.personalInfo?.firstName && user.personalInfo?.lastName 
          ? `${user.personalInfo.firstName} ${user.personalInfo.lastName}`.toUpperCase()
          : user.username?.toUpperCase() || 'VALUED MEMBER',
        address: user.personalInfo?.address || '',
        phone: user.personalInfo?.phone || user.phoneNumber || 'N/A',
        email: user.email || 'N/A',
        profileImage: user.personalInfo?.profileImage || null,
        registrationDate: user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        }) : new Date().toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })
      });
    }
  }, [user]);

  const getCurrentDate = () => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date().toLocaleDateString('en-US', options);
  };

  // Helper function to convert image to base64
  const getBase64FromUrl = async (url) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Error loading image:', error);
      return null;
    }
  };

  const downloadPDF = async () => {
    if (!userData) return;
    
    setLoading(true);
    try {
      const doc = new jsPDF();
      
      // Load images as base64
      let logoBase64 = null;
      let profileBase64 = null;
      
      try {
        logoBase64 = await getBase64FromUrl(companyInfo.logo);
      } catch (error) {
        console.error('Failed to load logo:', error);
      }
      
      if (userData.profileImage) {
        try {
          profileBase64 = await getBase64FromUrl(userData.profileImage);
        } catch (error) {
          console.error('Failed to load profile image:', error);
        }
      }
      
      // Colors
      const primaryColor = [139, 0, 0];
      const accentColor = [168, 85, 247];
      const textColor = [55, 65, 81];
      const lightBg = [252, 231, 243];
      
      // Header Background
      doc.setFillColor(...lightBg);
      doc.rect(0, 0, 210, 45, 'F');
      
      // Add Company Logo (left side)
      if (logoBase64) {
        try {
          doc.addImage(logoBase64, 'PNG', 15, 8, 20, 20, undefined, 'FAST');
        } catch (error) {
          console.error('Error adding logo to PDF:', error);
        }
      }
      
      // Add User Profile Image (right side)
      if (profileBase64) {
        try {
          doc.addImage(profileBase64, 'PNG', 175, 8, 20, 20, undefined, 'FAST');
        } catch (error) {
          console.error('Error adding profile image to PDF:', error);
        }
      }
      
      // Company Name
      doc.setTextColor(...primaryColor);
      doc.setFontSize(26);
      doc.setFont('helvetica', 'bold');
      doc.text(companyInfo.name, 105, 20, { align: 'center' });
      
      // Tagline
      doc.setFontSize(11);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(...accentColor);
      doc.text('Your Trusted Partner in Real Estate Excellence', 105, 28, { align: 'center' });
      
      // Contact info
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...textColor);
      doc.text(`${companyInfo.phone} | ${companyInfo.email} | ${companyInfo.website}`, 105, 35, { align: 'center' });
      
      // Decorative line
      doc.setDrawColor(...accentColor);
      doc.setLineWidth(1);
      doc.line(20, 42, 190, 42);
      
      // Welcome Letter Header Box
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(...primaryColor);
      doc.setLineWidth(0.5);
      doc.roundedRect(20, 50, 170, 25, 2, 2, 'S');
      
      // Member Details
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...primaryColor);
      doc.text('WELCOME LETTER', 105, 58, { align: 'center' });
      
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...textColor);
      doc.text(`Member ID: ${userData.memberId}`, 25, 66);
      doc.text(`Name: ${userData.fullName}`, 25, 71);
      
      // Date and Contact on right side
      doc.setFontSize(9);
      doc.text(`Date: ${getCurrentDate()}`, 145, 66);
      doc.text(`Contact: ${userData.phone}`, 145, 71);
      
      // Salutation
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...textColor);
      doc.text(`Dear ${userData.fullName},`, 20, 85);
      
      // Welcome Title
      doc.setFontSize(14);
      doc.setTextColor(...primaryColor);
      doc.setFont('helvetica', 'bold');
      doc.text('Welcome to Our Prestigious Family!', 105, 98, { align: 'center' });
      
      // Body paragraphs
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...textColor);
      doc.setLineHeightFactor(1.6);
      
      const paragraph1 = 'Our constant concern for the betterment of real estate services in this country has given us a common platform to join hands and lift the real estate industry and our valued partners along with it to new heights, which we believe is overdue!';
      
      const paragraph2 = 'As per information, India is one of the largest consumer markets in the world. It is the best country for real estate investment provided it should suit the Indian values, presented in Indian manner, and the business plan should cater to the requirements of investors, partners, and consumers.';
      
      const paragraph3 = 'Every human being on this planet has dreams. They do everything to fulfill those dreams. Is there any human who does not like living in luxury and getting self-recognition? But self-recognition and the best of finances demand the best of hard work, which in turn depends upon the opportunities available.';
      
      const paragraph4 = `${companyInfo.name} aims to fulfill every Indian's dreams. We can convert our dreams into reality by making "${companyInfo.name}" as one of the best real estate companies, which will produce the maximum successful winners in India with complete freedom of health and wealth.`;
      
      const paragraph5 = `I bring this amazing opportunity to you and invite you to join the wonderful family of ${companyInfo.name} on this breathtaking journey forthwith.`;
      
      // Split and wrap text
      const splitText1 = doc.splitTextToSize(paragraph1, 170);
      const splitText2 = doc.splitTextToSize(paragraph2, 170);
      const splitText3 = doc.splitTextToSize(paragraph3, 170);
      const splitText4 = doc.splitTextToSize(paragraph4, 170);
      const splitText5 = doc.splitTextToSize(paragraph5, 170);
      
      let yPos = 108;
      doc.text(splitText1, 20, yPos);
      yPos += splitText1.length * 5 + 5;
      
      doc.text(splitText2, 20, yPos);
      yPos += splitText2.length * 5 + 5;
      
      doc.text(splitText3, 20, yPos);
      yPos += splitText3.length * 5 + 5;
      
      doc.text(splitText4, 20, yPos);
      yPos += splitText4.length * 5 + 5;
      
      doc.text(splitText5, 20, yPos);
      yPos += splitText5.length * 5 + 10;
      
      // Closing
      doc.setFont('helvetica', 'bold');
      doc.text(`For and on behalf of ${companyInfo.name}`, 20, yPos);
      
      // Signature space
      yPos += 20;
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(9);
      doc.text('Authorized Signatory', 20, yPos);
      
      // Footer
      doc.setFillColor(...lightBg);
      doc.rect(0, 277, 210, 20, 'F');
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...accentColor);
      doc.text('Thank you for choosing Shree Jee Real Estate - Building Dreams Together', 105, 285, { align: 'center' });
      
      // Save PDF
      doc.save(`Welcome_Letter_${userData.fullName.replace(/\s+/g, '_')}_${userData.memberId}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!userData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading user information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Action Button */}
        <div className="flex justify-end mb-6">
          <button
            onClick={downloadPDF}
            disabled={loading}
            className="flex items-center gap-2 bg-gradient-to-r from-red-800 to-purple-600 text-white px-6 py-3 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 font-semibold disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {loading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Generating PDF...
              </>
            ) : (
              <>
                <Download size={20} />
                Download PDF
              </>
            )}
          </button>
        </div>

        {/* Letter Container */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-pink-100 via-purple-100 to-blue-100 p-8 border-b-4 border-purple-500">
            <div className="flex items-center justify-between mb-4">
              {/* Company Logo */}
              <div className="flex items-center gap-3">
                <img 
                  src={companyInfo.logo} 
                  alt={companyInfo.name} 
                  className="w-16 h-16 rounded-full border-4 border-white shadow-lg object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-red-800">{companyInfo.name}</h1>
                  <p className="text-purple-600 italic text-xs md:text-sm">Your Trusted Partner in Real Estate Excellence</p>
                </div>
              </div>
              
              {/* User Profile Image */}
              {userData?.profileImage && (
                <div className="flex-shrink-0">
                  <img 
                    src={userData.profileImage} 
                    alt={userData.fullName} 
                    className="w-16 h-16 rounded-full border-4 border-white shadow-lg object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>
            <div className="flex justify-center gap-6 text-xs text-gray-600 flex-wrap">
              <span className="flex items-center gap-1"><Phone size={12} /> {companyInfo.phone}</span>
              <span className="flex items-center gap-1"><Mail size={12} /> {companyInfo.email}</span>
              <span className="flex items-center gap-1"><MapPin size={12} /> {companyInfo.website}</span>
            </div>
          </div>

          {/* Member Info Box */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 m-8 rounded-xl border-2 border-purple-200 shadow-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-red-800">WELCOME LETTER</h2>
              {userData?.profileImage && (
                <img 
                  src={userData.profileImage} 
                  alt={userData.fullName} 
                  className="w-12 h-12 rounded-full border-2 border-purple-300 shadow-md object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Hash className="text-purple-600" size={16} />
                <span className="font-semibold text-gray-700">Member ID:</span>
                <span className="text-red-800 font-bold">{userData.memberId}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="text-purple-600" size={16} />
                <span className="font-semibold text-gray-700">Date:</span>
                <span className="text-gray-600">{getCurrentDate()}</span>
              </div>
              <div className="flex items-center gap-2">
                <User className="text-purple-600" size={16} />
                <span className="font-semibold text-gray-700">Name:</span>
                <span className="text-gray-800 font-semibold">{userData.fullName}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="text-purple-600" size={16} />
                <span className="font-semibold text-gray-700">Contact:</span>
                <span className="text-gray-600">{userData.phone}</span>
              </div>
              {userData.address && (
                <div className="flex items-start gap-2 md:col-span-2">
                  <MapPin className="text-purple-600 mt-0.5" size={16} />
                  <span className="font-semibold text-gray-700">Address:</span>
                  <span className="text-gray-600">{userData.address}</span>
                </div>
              )}
            </div>
          </div>

          {/* Letter Content */}
          <div className="p-8 md:p-12 space-y-6 text-gray-700 leading-relaxed">
            <p className="text-lg font-semibold text-gray-800">
              Dear <span className="text-red-800">{userData.fullName}</span>,
            </p>

            <h3 className="text-2xl font-bold text-center text-red-800 my-6">
              Welcome to Our Prestigious Family!
            </h3>

            <p className="text-justify">
              Our constant concern for the betterment of real estate services in this country has given us a common platform to join hands and lift the real estate industry and our valued partners along with it to new heights, which we believe is overdue!
            </p>

            <p className="text-justify">
              As per information, India is one of the largest consumer markets in the world. It is the best country for real estate investment provided it should suit the Indian values, presented in Indian manner, and the business plan should cater to the requirements of investors, partners, and consumers.
            </p>

            <p className="text-justify">
              Every human being on this planet has dreams. They do everything to fulfill those dreams. Is there any human who does not like living in luxury and getting self-recognition? But self-recognition and the best of finances demand the best of hard work, which in turn depends upon the opportunities available.
            </p>

            <p className="text-justify">
              <span className="font-semibold text-red-800">{companyInfo.name}</span> aims to fulfill every Indian's dreams. We can convert our dreams into reality by making "<span className="font-semibold text-red-800">{companyInfo.name}</span>" as one of the best real estate companies, which will produce the maximum successful winners in India with complete freedom of health and wealth.
            </p>

            <p className="text-justify">
              I bring this amazing opportunity to you and invite you to join the wonderful family of <span className="font-semibold text-red-800">{companyInfo.name}</span> on this breathtaking journey forthwith.
            </p>

            {/* Signature Section */}
            <div className="mt-12 pt-8">
              <p className="font-semibold text-gray-800">
                For and on behalf of {companyInfo.name}
              </p>
              <div className="mt-12 mb-4">
                <div className="w-48 border-t-2 border-gray-400"></div>
              </div>
              <p className="italic text-gray-600 text-sm">Authorized Signatory</p>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gradient-to-r from-pink-100 via-purple-100 to-blue-100 p-6 text-center border-t-4 border-purple-500">
            <p className="text-purple-700 font-semibold flex items-center justify-center gap-2 flex-wrap">
              <span className="text-green-600 text-xl">✓</span>
              Thank you for choosing {companyInfo.name} - Building Dreams Together
            </p>
          </div>
        </div>

        {/* User Info Card */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-800">Member Information</h3>
            {userData?.profileImage && (
              <img 
                src={userData.profileImage} 
                alt={userData.fullName} 
                className="w-16 h-16 rounded-full border-2 border-purple-300 shadow-md object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-semibold text-gray-600">Member ID:</span>
              <p className="text-gray-800">{userData.memberId}</p>
            </div>
            <div>
              <span className="font-semibold text-gray-600">Email:</span>
              <p className="text-gray-800">{userData.email}</p>
            </div>
            <div>
              <span className="font-semibold text-gray-600">Phone:</span>
              <p className="text-gray-800">{userData.phone}</p>
            </div>
            <div>
              <span className="font-semibold text-gray-600">Registration Date:</span>
              <p className="text-gray-800">{userData.registrationDate}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WelcomeLetter;