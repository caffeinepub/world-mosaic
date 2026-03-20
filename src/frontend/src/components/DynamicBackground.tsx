import { useEffect, useRef, useState } from "react";

const LANDMARKS = [
  {
    url: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1920&q=80",
    label: "Eiffel Tower, France",
  },
  {
    url: "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=1920&q=80",
    label: "Taj Mahal, India",
  },
  {
    url: "https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=1920&q=80",
    label: "Great Wall, China",
  },
  {
    url: "https://images.unsplash.com/photo-1587595431973-160d0d94add1?w=1920&q=80",
    label: "Machu Picchu, Peru",
  },
  {
    url: "https://images.unsplash.com/photo-1523482580672-f109ba8cb9be?w=1920&q=80",
    label: "Sydney Opera House, Australia",
  },
  {
    url: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=1920&q=80",
    label: "Colosseum, Italy",
  },
  {
    url: "https://images.unsplash.com/photo-1569949381669-ecf31ae8e613?w=1920&q=80",
    label: "Santorini, Greece",
  },
  {
    url: "https://images.unsplash.com/photo-1526711657229-e7e080ed7aa1?w=1920&q=80",
    label: "Petra, Jordan",
  },
  {
    url: "https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=1920&q=80",
    label: "Angkor Wat, Cambodia",
  },
  {
    url: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1920&q=80",
    label: "Tokyo, Japan",
  },
  {
    url: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=1920&q=80",
    label: "New York, USA",
  },
  {
    url: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1920&q=80",
    label: "London, United Kingdom",
  },
  {
    url: "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=1920&q=80",
    label: "Pyramids, Egypt",
  },
  {
    url: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1920&q=80",
    label: "Dubai, UAE",
  },
  {
    url: "https://images.unsplash.com/photo-1536697246787-1f7ae568d89a?w=1920&q=80",
    label: "Rio de Janeiro, Brazil",
  },
  {
    url: "https://images.unsplash.com/photo-1534430480872-3498386e7856?w=1920&q=80",
    label: "Barcelona, Spain",
  },
  {
    url: "https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?w=1920&q=80",
    label: "Amsterdam, Netherlands",
  },
  {
    url: "https://images.unsplash.com/photo-1555993539-1732b0258235?w=1920&q=80",
    label: "Maldives",
  },
  {
    url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80",
    label: "Swiss Alps, Switzerland",
  },
  {
    url: "https://images.unsplash.com/photo-1526772662000-3f88f10405ff?w=1920&q=80",
    label: "Bali, Indonesia",
  },
  {
    url: "https://images.unsplash.com/photo-1580654842036-92f6c9e29ea4?w=1920&q=80",
    label: "Serengeti, Tanzania",
  },
  {
    url: "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=1920&q=80",
    label: "Prague, Czech Republic",
  },
  {
    url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1920&q=80",
    label: "Amalfi Coast, Italy",
  },
  {
    url: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=1920&q=80",
    label: "New York City, USA",
  },
];

const INTERVAL_MS = 2 * 60 * 1000; // 2 minutes

export function DynamicBackground() {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [nextIdx, setNextIdx] = useState(1);
  const [transitioning, setTransitioning] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Preload next image
  useEffect(() => {
    const img = new Image();
    img.src = LANDMARKS[nextIdx].url;
  }, [nextIdx]);

  useEffect(() => {
    timerRef.current = setTimeout(() => {
      const upcoming = (currentIdx + 1) % LANDMARKS.length;
      setNextIdx(upcoming);
      setTransitioning(true);
      setTimeout(() => {
        setCurrentIdx(upcoming);
        setNextIdx((upcoming + 1) % LANDMARKS.length);
        setTransitioning(false);
      }, 3000);
    }, INTERVAL_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [currentIdx]);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
      {/* Current image */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-opacity duration-[3000ms] ease-in-out"
        style={{
          backgroundImage: `url(${LANDMARKS[currentIdx].url})`,
          opacity: transitioning ? 0 : 1,
        }}
      />
      {/* Next image (preloaded, fades in) */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-opacity duration-[3000ms] ease-in-out"
        style={{
          backgroundImage: `url(${LANDMARKS[nextIdx].url})`,
          opacity: transitioning ? 1 : 0,
        }}
      />
      {/* Dark overlay for text readability */}
      <div className="absolute inset-0 bg-black/50" />
      {/* Country label */}
      <div
        className="absolute bottom-24 right-4 text-white/70 text-xs font-medium px-2 py-1 rounded bg-black/30 backdrop-blur-sm"
        key={transitioning ? nextIdx : currentIdx}
      >
        📍 {LANDMARKS[transitioning ? nextIdx : currentIdx].label}
      </div>
    </div>
  );
}
