import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { MapPin, Bath, Bed, Ruler, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card'; // ShadCN Card

function NearbyProperties() {
  const cardRef = useRef();

  useEffect(() => {
    gsap.fromTo(cardRef.current,
      { x: 50, opacity: 0 },
      { x: 0, opacity: 1, duration: 1, delay: 1.4, ease: 'power2.out' }
    );
  }, []);

  return (
    <Card ref={cardRef} className="bg-white dark:bg-gray-800 rounded-3xl overflow-hidden shadow-md relative">
      <CardHeader className="p-0">
        <div className="relative h-48 w-full">
          <img
            src="./src/assets/Luxury Real Estate Background.jpg"
            alt="Golden Springfield Property"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute top-4 left-4 bg-orange-500 text-white text-xs font-semibold px-3 py-1 rounded-full flex items-center space-x-1">
            <MapPin size={12} />
            <span>Nearby</span>
          </div>
          <Button variant="ghost" size="icon" className="absolute top-4 right-4 bg-white/70 hover:bg-white/90 backdrop-blur-sm rounded-full">
            <Heart size={18} className="text-gray-700" />
          </Button>
          <div className="absolute bottom-4 right-4 bg-white/70 hover:bg-white/90 backdrop-blur-sm text-gray-700 text-xs px-3 py-1 rounded-full">
            +28 Images
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">Golden Springfield</h3>
        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 flex items-center">
          <MapPin size={16} className="mr-2" /> 26212, Lake Sevilla, Beverly Hills, LA
        </p>

        <div className="flex items-center space-x-4 mb-4 text-gray-700 dark:text-gray-200">
          <div className="flex items-center space-x-1">
            <Bed size={16} />
            <span>4</span>
          </div>
          <div className="flex items-center space-x-1">
            <Bath size={16} />
            <span>2</span>
          </div>
          <div className="flex items-center space-x-1">
            <Ruler size={16} />
            <span>6x78.5 m²</span>
          </div>
        </div>

        <div className="flex justify-between items-center text-gray-700 dark:text-gray-200">
          <div className="flex items-center space-x-2">
            <MapPin size={16} />
            <span>Distance</span>
            <span className="font-semibold text-gray-900 dark:text-gray-100">18.2 KM</span>
          </div>
          <Button variant="ghost" size="icon" className="text-gray-500 dark:text-gray-400">
            &gt;
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default NearbyProperties;