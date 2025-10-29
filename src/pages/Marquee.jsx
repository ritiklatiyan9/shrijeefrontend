import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { Star } from 'lucide-react'; // A nice separator icon from lucide-react

// The list of taglines you provided
const taglines = [
  "Turning your property dreams into reality.",
  "Your trusted partner in real estate.",
  "Where trust meets real estate.",
  "Building relationships, not just deals.",
  "Find your perfect home with confidence.",
  "Real homes. Real value. Real trust.",
  "Driven by integrity, defined by results.",
  "Your journey home starts here.",
  "Experience real estate done right.",
  "Guiding you home, every step of the way.",
];

const Marquee = () => {
  const marqueeRef = useRef(null);

  useEffect(() => {
    // We use a GSAP context for safe cleanup
    const ctx = gsap.context(() => {
      const marqueeElement = marqueeRef.current;
      if (!marqueeElement) return;

      // The magic of a seamless loop is to duplicate the content.
      // GSAP's xPercent is perfect for this. -50% means move left by half the total width.
      // Since we have two copies of the content, moving by 50% brings the second copy
      // perfectly into the starting position of the first, creating the illusion of an endless loop.
      const tween = gsap.to(marqueeElement, {
        xPercent: -50,
        ease: 'none', // A linear ease creates a constant, smooth scroll
        duration: 40, // Adjust duration for speed (higher number = slower)
        repeat: -1,   // -1 creates an infinite loop
      });

      // Optional: Pause animation on hover
      marqueeElement.addEventListener('mouseenter', () => tween.pause());
      marqueeElement.addEventListener('mouseleave', () => tween.play());

      // Cleanup function to kill the animation when the component unmounts
      return () => {
        tween.kill();
      };

    }, marqueeRef); // Scope the context to our component

    return () => ctx.revert(); // Cleanup GSAP context
  }, []);

  return (
    <section className="w-full py-8 md:py-12 bg-secondary/50 overflow-hidden border-y">
      {/* 
        The outer container has 'overflow-hidden' to act as a "viewport",
        clipping the content that moves outside its bounds.
      */}
      <div className="flex">
        {/* 
          The inner container (ref) holds the content. We use 'w-max' to ensure it doesn't wrap
          and 'flex' to lay out the items horizontally.
        */}
        <div ref={marqueeRef} className="flex w-max items-center">
          {/* We render the list of taglines twice for the seamless loop */}
          {[...taglines, ...taglines].map((text, index) => (
            <div key={index} className="flex items-center mx-4">
              <p className="whitespace-nowrap text-xl md:text-2xl lg:text-3xl font-medium text-foreground">
                {text}
              </p>
              <Star className="h-5 w-5 md:h-6 md:w-6 text-primary ml-8" fill="currentColor" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Marquee;