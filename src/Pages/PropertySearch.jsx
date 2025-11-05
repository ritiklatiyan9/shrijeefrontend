import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { Button } from '@/components/ui/button';
import { Bed, Bath, Home } from 'lucide-react';

function PropertySearch() {
  const sectionRef = useRef();

  useEffect(() => {
    gsap.fromTo(sectionRef.current,
      { x: -50, opacity: 0 },
      { x: 0, opacity: 1, duration: 1, delay: 1.2, ease: 'power2.out' }
    );
  }, []);

  return (
    <section ref={sectionRef} className="bg-white dark:bg-gray-800 rounded-3xl p-6 md:p-8 shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 leading-tight">
          Find Nearby <br /> Luxurious Estates
        </h2>
        <Button variant="ghost" size="icon" className="text-gray-500 dark:text-gray-400">
          +
        </Button>
      </div>
      <p className="text-gray-600 dark:text-gray-300 mb-6 text-sm md:text-base">
        Enhances the experience of finding and dealing luxury houses
      </p>

      <div className="flex flex-wrap gap-3 mb-8">
        <Button variant="outline" className="flex items-center space-x-2 rounded-full px-4 py-2 text-gray-700 dark:text-gray-300 dark:border-gray-700">
          <Bed size={16} />
          <span>3-Bedroom</span>
        </Button>
        <Button variant="outline" className="flex items-center space-x-2 rounded-full px-4 py-2 text-gray-700 dark:text-gray-300 dark:border-gray-700">
          <Bath size={16} />
          <span>2-Bathroom</span>
        </Button>
        <Button variant="outline" className="flex items-center space-x-2 rounded-full px-4 py-2 text-gray-700 dark:text-gray-300 dark:border-gray-700">
          <Home size={16} />
          <span>Villa</span>
        </Button>
        {/* Add more filter buttons as needed */}
      </div>

      <Button className="bg-orange-500 hover:bg-orange-600 text-white w-full rounded-lg py-3">
        Search Recent
      </Button>
    </section>
  );
}

export default PropertySearch;