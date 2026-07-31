import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";
import { Heart, Shield, Users } from "lucide-react";
import { Button } from "../Button";

const slides = [
  {
    icon: Heart,
    title: "Find Your Life Partner",
    description:
      "Waleef helps you connect with compatible matches who share your values and vision for a halal marriage.",
    color: "from-pink-500 to-rose-500",
  },
  {
    icon: Shield,
    title: "Privacy & Respect",
    description:
      "Your journey is private and protected. We prioritize your safety and dignity every step of the way.",
    color: "from-amber-500 to-orange-500",
  },
  {
    icon: Users,
    title: "Family Involvement",
    description:
      "Involve your wali or guardian at your pace. We support traditional values in a modern way.",
    color: "from-purple-500 to-pink-500",
  },
];

interface OnboardingProps {
  onComplete: () => void;
}

export function Onboarding({ onComplete }: OnboardingProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      onComplete();
    }
  };

  const slide = slides[currentSlide];
  const Icon = slide.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF8F0] via-[#F5F1E8] to-white flex flex-col items-center justify-between p-8">
      <div className="w-full max-w-md flex-1 flex flex-col items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center text-center"
          >
            <motion.div
              className={`w-32 h-32 rounded-full bg-gradient-to-br ${slide.color} flex items-center justify-center mb-12 shadow-2xl`}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            >
              <Icon size={64} className="text-white" />
            </motion.div>

            <h1 className="text-4xl mb-6 text-[#1A1A1A]">{slide.title}</h1>
            <p className="text-lg text-[#6B6B6B] leading-relaxed px-4">
              {slide.description}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="w-full max-w-md space-y-6">
        <div className="flex justify-center gap-2">
          {slides.map((_, index) => (
            <motion.div
              key={index}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentSlide
                  ? "w-8 bg-gradient-to-r from-[#FF6B9D] to-[#FF8A5C]"
                  : "w-2 bg-gray-300"
              }`}
              animate={{ scale: index === currentSlide ? 1 : 0.8 }}
            />
          ))}
        </div>

        <Button onClick={nextSlide} className="w-full">
          {currentSlide === slides.length - 1 ? "Get Started" : "Continue"}
        </Button>

        {currentSlide > 0 && (
          <button
            onClick={() => setCurrentSlide(currentSlide - 1)}
            className="w-full text-[#6B6B6B] text-sm"
          >
            Back
          </button>
        )}
      </div>
    </div>
  );
}
