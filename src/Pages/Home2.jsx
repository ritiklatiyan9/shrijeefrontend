// src/Pages/Home2.jsx
import React from 'react';
import { CardStack } from '@/components/ui/card-stack';

const customFontStyle = {
  fontFamily: "'Neue Montreal Regular', sans-serif",
  fontWeight: 600,
  fontStyle: "normal",
};

const items = [
  {
    id: 1,
    title: "Buy Your Dream Home",
    description: "Find the perfect home for your family with Divine",
    imageSrc: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800",
  },
  {
    id: 2,
    title: "Rent Comfortably",
    description: "Explore rental options in prime locations",
    imageSrc: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800",
  },
  {
    id: 3,
    title: "Check Property Values",
    description: "Get accurate home price estimates instantly",
    imageSrc: "https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=800",
  },
  {
    id: 4,
    title: "Investment Properties",
    description: "Grow your wealth with smart property investments",
    imageSrc: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800",
  },
  {
    id: 5,
    title: "Luxury Estates",
    description: "Live in opulence with Divine's luxury estates",
    imageSrc: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800",
  },
];

function Home2() {
  const [cardDimensions, setCardDimensions] = React.useState({ width: 520, height: 320 });

  React.useEffect(() => {
    const updateDimensions = () => {
      if (typeof window !== 'undefined') {
        const width = Math.min(window.innerWidth * 0.9, 520); // 90% of screen width or max 520px
        const height = width < 520 ? 300 : 320; // Adjust height slightly for smaller screens
        setCardDimensions({ width, height });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  return (
    <div style={customFontStyle} className="flex flex-col min-h-[60vh] bg-white overflow-hidden">
      <main className="flex-grow py-12 px-4 md:px-16 flex items-center justify-center">
        <div className="w-full max-w-4xl mx-auto flex justify-center">
          <CardStack
            items={items}
            initialIndex={0}
            autoAdvance
            intervalMs={3000}
            pauseOnHover
            showDots
            cardWidth={cardDimensions.width}
            cardHeight={cardDimensions.height}
          />
        </div>
      </main>
    </div>
  );
}

export default Home2;