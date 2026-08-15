'use client';

import { useState, useEffect } from 'react';
import { Globe2 } from 'lucide-react';

const CAROUSEL_ITEMS = [
  {
    title: "Track expenses across 90+ currencies",
    description: "Earn in AED, spend in BDT. Track exactly where your money goes across different borders with country-specific reporting.",
    testimonial: {
      quote: "ExpatFi is the only app that truly understands the expat financial lifestyle. I earn in AED and send money home in BDT — it handles everything flawlessly.",
      author: "Sarah M.",
      role: "Software Engineer · Dubai"
    }
  },
  {
    title: "Smart insights with live exchange rates",
    description: "Every transaction locks in the exchange rate. See expenses in the original currency and your reporting currency instantly.",
    testimonial: {
      quote: "The dual-currency display is a game-changer. I can see exactly what I spent in SGD and what that means in INR with zero manual work.",
      author: "Ravi K.",
      role: "Finance Analyst · Singapore"
    }
  },
  {
    title: "Bank-level security for your data",
    description: "Your financial data is encrypted and secure. We never sell your data or share it with third parties.",
    testimonial: {
      quote: "I used to keep 3 separate spreadsheets. Now I use ExpatFi and my entire financial picture is one dashboard. Absolutely worth it.",
      author: "Amira T.",
      role: "Nurse · Qatar"
    }
  }
];

export function AuthCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((current) => (current + 1) % CAROUSEL_ITEMS.length);
    }, 5000); // Change slide every 5 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative z-10 flex flex-col justify-between h-full space-y-10">
      <div>
        <h2 className="text-4xl font-extrabold text-white leading-tight mb-4">
          Your money,{' '}
          <span className="landing-gradient-text">everywhere it goes</span>
        </h2>
        <p className="text-white/50 text-lg leading-relaxed max-w-sm">
          The expense tracker built for expats, remote workers, and global citizens.
        </p>
      </div>

      <div className="flex-1 flex flex-col justify-center min-h-[300px]">
        {CAROUSEL_ITEMS.map((item, index) => (
          <div
            key={index}
            className={`transition-all duration-700 absolute w-full max-w-md ${
              index === activeIndex ? 'opacity-100 translate-x-0 pointer-events-auto' : 'opacity-0 translate-x-8 pointer-events-none'
            }`}
          >
            <h3 className="text-2xl font-bold text-white mb-2">{item.title}</h3>
            <p className="text-white/60 mb-8 leading-relaxed">{item.description}</p>
            
            <div className="glass-card rounded-2xl p-5 relative">
              {/* Decorative quote mark */}
              <div className="absolute -top-3 -left-2 text-4xl text-violet-500/30 font-serif">&quot;</div>
              <p className="text-sm text-white/75 italic leading-relaxed mb-4 relative z-10">
                {item.testimonial.quote}
              </p>
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-sm font-bold text-white shadow-lg shadow-violet-500/20">
                  {item.testimonial.author[0]}
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">{item.testimonial.author}</div>
                  <div className="text-xs text-white/40">{item.testimonial.role}</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Carousel Indicators */}
      <div className="flex items-center gap-2 pt-8">
        {CAROUSEL_ITEMS.map((_, index) => (
          <button
            key={index}
            onClick={() => setActiveIndex(index)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              index === activeIndex ? 'w-8 bg-violet-500' : 'w-2 bg-white/20 hover:bg-white/40'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
