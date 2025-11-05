import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  MessageCircle,
  Send,
  User,
  Mail as MailIcon,
  Edit3,
  Globe,
  Smartphone,
  Calendar,
} from "lucide-react";

// Import background image
import backgroundImage from "../../../public/assets/twentyfour.jpeg";

// Custom font styles
const customFontStyle = {
  fontFamily: "'Neue Montreal Regular', sans-serif",
  fontWeight: 600,
  fontStyle: "normal",
};

const customFontStyle2 = {
  fontFamily: "'Travel October', sans-serif",
  fontWeight: 600,
  fontStyle: "normal",
};

export default function ContactUs() {
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Get form data
    const firstName = e.target[0].value;
    const lastName = e.target[1].value;
    const country = e.target[2].value;
    const phone = e.target[3].value;
    const email = e.target[4].value;
    const inquiryType = Array.from(e.target.elements)
      .filter(el => el.type === 'button' && el.classList.contains('active'))
      .map(el => el.textContent)[0] || 'Not specified';
    const message = e.target[6].value;
    const newsletter = e.target[7].checked;

    // Format WhatsApp message
    const whatsappNumber = "9760302690"; // Remove spaces and +91 prefix
    const messageText = encodeURIComponent(
      `New Contact Form Submission:\n\n` +
      `Name: ${firstName} ${lastName}\n` +
      `Country: ${country}\n` +
      `Phone: ${phone}\n` +
      `Email: ${email}\n` +
      `Inquiry Type: ${inquiryType}\n` +
      `Message: ${message}\n` +
      `Newsletter: ${newsletter ? 'Yes' : 'No'}`
    );

    // Open WhatsApp with pre-filled message
    window.open(`https://wa.me/${whatsappNumber}?text=${messageText}`, '_blank');
  };

  // Handle inquiry type selection
  const handleInquiryTypeClick = (e) => {
    // Remove active class from all buttons
    document.querySelectorAll('.inquiry-type-btn').forEach(btn => {
      btn.classList.remove('active');
      btn.classList.remove('bg-blue-100', 'text-blue-700');
      btn.classList.add('border', 'border-gray-200');
    });
    
    // Add active class to clicked button
    e.target.classList.add('bg-blue-100', 'text-blue-700');
    e.target.classList.remove('border');
    e.target.classList.add('active');
  };

  return (
    <div
      className="relative min-h-screen flex pt-[20px] flex-col"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/50"></div>

      {/* Content Container */}
      <div className="relative z-10 container mx-auto px-4 pt-[104px] pb-12 flex flex-col md:flex-row gap-8">
        
        {/* Left Side: Headline + Info */}
        <div className="flex-1 text-white space-y-6">
          <h1 
            className="text-4xl md:text-5xl font-bold leading-tight"
            style={customFontStyle2} // Applied Travel October font
          >
            Contact <br />
            Shree Jee Real Estate
          </h1>
          <p 
            className="text-lg max-w-xl opacity-90"
            style={customFontStyle} // Applied Neue Montreal Regular font
          >
            Discover properties that match your lifestyle from city condos to suburban homes, we've got you covered.
          </p>

          {/* Contact Info Grid */}
          <div className="grid md:grid-cols-2 gap-8 mt-12 text-sm">
            {/* Location */}
            <div>
              <h3 
                className="font-semibold mb-2"
                style={customFontStyle2} // Applied Travel October font
              >
                Location
              </h3>
              <p 
                className="opacity-80"
                style={customFontStyle} // Applied Neue Montreal Regular font
              >
                Shree Jee Real Estate<br />
                New Delhi<br />
                India
              </p>
            </div>

            {/* Social Media */}
            <div>
              <h3 
                className="font-semibold mb-2"
                style={customFontStyle2} // Applied Travel October font
              >
                Social Media
              </h3>
              <div 
                className="space-y-1 opacity-80"
                style={customFontStyle} // Applied Neue Montreal Regular font
              >
                <p>Instagram</p>
                <p>Facebook</p>
                <p>LinkedIn</p>
              </div>
            </div>

            {/* Email */}
            <div>
              <h3 
                className="font-semibold mb-2"
                style={customFontStyle2} // Applied Travel October font
              >
                Email
              </h3>
              <p 
                className="opacity-80"
                style={customFontStyle} // Applied Neue Montreal Regular font
              >
                info@shreejeerealestate.com
              </p>
            </div>

            {/* Contact */}
            <div>
              <h3 
                className="font-semibold mb-2"
                style={customFontStyle2} // Applied Travel October font
              >
                Contact
              </h3>
              <p 
                className="opacity-80"
                style={customFontStyle} // Applied Neue Montreal Regular font
              >
                +91 97603 02690
              </p> 
            </div>
          </div>
        </div>

        {/* Right Side: Contact Form Card */}
        <div className="md:w-[420px]">
          <Card className="bg-white shadow-xl rounded-2xl p-6">
            <CardHeader className="pb-4">
              <CardTitle 
                className="text-xl font-bold"
                style={customFontStyle2} // Applied Travel October font
              >
                Get In Touch
              </CardTitle>
              <p 
                className="text-sm text-muted-foreground"
                style={customFontStyle} // Applied Neue Montreal Regular font
              >
                Our team is ready to assist you with every detail, big or small.
              </p>
            </CardHeader>

            <CardContent className="space-y-6">
              <form className="space-y-4" onSubmit={handleSubmit}>
                {/* Name Fields */}
                <div className="grid grid-cols-2 gap-4">
                  <Input 
                    placeholder="First Name" 
                    className="rounded-full" 
                    style={customFontStyle} // Applied Neue Montreal Regular font
                    required
                  />
                  <Input 
                    placeholder="Last Name" 
                    className="rounded-full" 
                    style={customFontStyle} // Applied Neue Montreal Regular font
                    required
                  />
                </div>

                {/* Country & Phone */}
                <div className="grid grid-cols-2 gap-4">
                  <Input 
                    placeholder="Country" 
                    className="rounded-full" 
                    style={customFontStyle} // Applied Neue Montreal Regular font
                    required
                  />
                  <Input 
                    placeholder="Phone Number" 
                    className="rounded-full" 
                    style={customFontStyle} // Applied Neue Montreal Regular font
                    required
                  />
                </div>

                {/* Email */}
                <Input 
                  placeholder="Email Address" 
                  className="rounded-full" 
                  style={customFontStyle} // Applied Neue Montreal Regular font
                  type="email"
                  required
                />

                {/* Inquiry Type Buttons */}
                <div>
                  <Label 
                    className="block text-sm font-medium mb-2"
                    style={customFontStyle2} // Applied Travel October font
                  >
                    Type of Inquiry
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {["Property", "General", "Commercial", "Residential", "Others"].map((type) => (
                      <Button
                        key={type}
                        variant="outline"
                        size="sm"
                        className="rounded-full text-xs px-3 py-1 inquiry-type-btn"
                        style={customFontStyle} // Applied Neue Montreal Regular font
                        type="button"
                        onClick={handleInquiryTypeClick}
                      >
                        {type}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Message */}
                <Textarea
                  placeholder="Message"
                  rows={4}
                  className="rounded-xl resize-none"
                  style={customFontStyle} // Applied Neue Montreal Regular font
                  required
                />

                {/* Newsletter Checkbox */}
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="newsletter" className="w-4 h-4" />
                  <label 
                    htmlFor="newsletter" 
                    className="text-sm text-muted-foreground"
                    style={customFontStyle} // Applied Neue Montreal Regular font
                  >
                    I'd like to receive exclusive offers and updates
                  </label>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full rounded-full bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600 text-white"
                  style={customFontStyle2} // Applied Travel October font
                >
                  Submit
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}