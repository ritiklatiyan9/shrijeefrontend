// src/components/HorizontalScrollCarousel.jsx

import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useMediaQuery } from 'react-responsive';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MoveRight } from 'lucide-react';

// Register the ScrollTrigger plugin with GSAP
gsap.registerPlugin(ScrollTrigger);

// Dummy data for the cards
const cards = [
    { id: 1, url: "https://picsum.photos/seed/p1/800/600", title: "Forest Retreat", description: "Discover the beauty of untouched landscapes." },
    { id: 2, url: "https://picsum.photos/seed/p2/800/600", title: "City Lights", description: "Explore vibrant cityscapes that never sleep." },
    { id: 3, url: "https://picsum.photos/seed/p3/800/600", title: "Aurora Borealis", description: "Witness the serene dance of the northern lights." },
    { id: 4, url: "https://picsum.photos/seed/p4/800/600", title: "Jungle Adventure", description: "Adventure awaits in the dense, green jungles." },
    { id: 5, url: "https://picsum.photos/seed/p5/800/600", title: "Mountain Lake", description: "Find tranquility by the crystal-clear mountain lakes." },
    { id: 6, url: "https://picsum.photos/seed/p6/800/600", title: "Golden Desert", description: "Experience the vastness of the golden deserts." },
    { id: 7, url: "https://picsum.photos/seed/p7/800/600", title: "Ocean Voyage", description: "Sail across the endless, azure oceans." },
    { id: 8, url: "https://picsum.photos/seed/p8/800/600", title: "Ancient Town", description: "Get lost in the charm of ancient, historic towns." },
    { id: 9, url: "https://picsum.photos/seed/p9/800/600", title: "Summit View", description: "Hike to the summit for breathtaking panoramic views." },
    { id: 10, url: "https://picsum.photos/seed/p10/800/600", title: "Pristine Beach", description: "Relax on pristine beaches with powdery white sand." },
];

const HorizontalScrollCarousel = () => {
    const sectionRef = useRef(null); // The element that will move horizontally (the "track")
    const triggerRef = useRef(null); // The element that will be pinned (the "viewport")

    // Use media query to apply the animation only on desktop
    const isDesktop = useMediaQuery({
        query: "(min-width: 1024px)",
    });

    useEffect(() => {
        // Only run the animation on desktop screens
        if (!isDesktop) {
            return; // Exit if not on a desktop-sized screen
        }

        // Use GSAP Context for proper cleanup
        const ctx = gsap.context(() => {
            const scrollingElement = sectionRef.current;

            // Calculate the total horizontal distance the track needs to move
            const scrollAmount = scrollingElement.scrollWidth - window.innerWidth;

            // If there's nothing to scroll, don't create the animation
            if (scrollAmount <= 0) return;

            // --- ANIMATION LOGIC FROM FLAVORSLIDER APPLIED HERE ---

            // The 'overscroll' adds extra scroll distance, making the horizontal scroll
            // feel more spread out and allowing the final item to scroll off-screen.
            const overscroll = 1500;

            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: triggerRef.current,
                    pin: true,
                    // 1. Start animation slightly later for a smoother entry
                    start: "2% top",
                    // 2. End animation after scrolling the content width + the overscroll distance
                    end: `+=${scrollAmount + overscroll}`,
                    scrub: true, // Use `true` or a number like 1 for smooth scrubbing
                    invalidateOnRefresh: true, // Recalculates values on window resize
                },
            });

            tl.to(scrollingElement, {
                // 3. Move the track to the left by the same amount as the 'end' distance
                x: `-${scrollAmount + overscroll}px`,
                // 4. Use a non-linear ease for a more polished, dynamic feel
                ease: "power1.inOut",
            });

            // --- END OF APPLIED LOGIC ---

        }, triggerRef); // Scope the GSAP context to our component

        return () => ctx.revert(); // Cleanup GSAP animations and ScrollTriggers
    }, [isDesktop]); // Re-run the effect if the isDesktop value changes

    return (
        // This is the trigger element that will be pinned to the viewport
        <section ref={triggerRef} className="relative h-screen overflow-hidden bg-background">
            {/* 
                This is the element that will be animated horizontally.
                - It's a flex container that holds all the content in a single row.
                - 'w-max' allows it to grow as wide as its content.
            */}
            <div ref={sectionRef} className="h-full w-max flex items-center relative flex-nowrap">
                {/* Optional: Add a "starter" screen before the cards */}
                <div className="w-screen h-full flex items-center justify-center text-center px-8 flex-shrink-0">
                    <div>
                        <h2 className="text-4xl md:text-6xl font-bold mb-6">
                            Scroll to Discover Our Features
                        </h2>
                        <p className="text-lg text-muted-foreground mb-8">
                            Experience a seamless journey through our curated content.
                        </p>
                        <MoveRight className='mx-auto h-16 w-16 text-primary animate-pulse' />
                    </div>
                </div>

                {/* The cards */}
                {cards.map((card) => (
                    // Each card container is 20vw wide. 'flex-shrink-0' is important.
                    <div key={card.id} className="w-[20vw] px-2 flex-shrink-0">
                        <Card className="h-[60vh] flex flex-col group hover:border-primary transition-colors duration-300 shadow-lg">
                            <CardHeader>
                                <CardTitle className="text-lg">{card.title}</CardTitle>
                            </CardHeader>
                            <CardContent className="flex-grow flex flex-col">
                                <div className="flex-grow w-full h-40 mb-4 overflow-hidden rounded-md">
                                    <img
                                        src={card.url}
                                        alt={card.title}
                                        className="w-full h-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-110"
                                    />
                                </div>
                                <p className="text-sm text-muted-foreground">{card.description}</p>
                            </CardContent>
                        </Card>
                    </div>
                ))}
                {/* 
                  You can add extra padding here if you want space after the last card 
                  before the overscroll effect finishes and the section unpins.
                  For example: <div className="w-[50vw] flex-shrink-0" />
                */}
            </div>
        </section>
    );
};

export default HorizontalScrollCarousel;