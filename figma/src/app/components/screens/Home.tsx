import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";
import { Heart, X, MapPin, Briefcase, BookOpen, Star } from "lucide-react";
import { Card } from "../Card";
import { Badge } from "../Badge";
import { MatchPercentage } from "../MatchPercentage";

const mockProfiles = [
  {
    id: 1,
    name: "Sarah",
    age: 26,
    location: "New York, USA",
    education: "Master's in Psychology",
    occupation: "Clinical Therapist",
    bio: "Practicing Muslim seeking a partner who values faith, family, and personal growth.",
    matchPercentage: 87,
    verified: true,
    premium: true,
    interests: ["Reading", "Volunteering", "Hiking"],
  },
  {
    id: 2,
    name: "Amira",
    age: 24,
    location: "London, UK",
    education: "Bachelor's in Computer Science",
    occupation: "Software Engineer",
    bio: "Tech-savvy and faith-focused, looking for someone to build a future with.",
    matchPercentage: 92,
    verified: true,
    premium: false,
    interests: ["Technology", "Art", "Travel"],
  },
  {
    id: 3,
    name: "Zainab",
    age: 28,
    location: "Dubai, UAE",
    education: "MBA",
    occupation: "Business Consultant",
    bio: "Career-driven with strong family values. Seeking a committed relationship.",
    matchPercentage: 78,
    verified: true,
    premium: true,
    interests: ["Business", "Fitness", "Cooking"],
  },
];

interface HomeProps {
  onMatchClick: () => void;
}

export function Home({ onMatchClick }: HomeProps) {
  const [profiles, setProfiles] = useState(mockProfiles);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleLike = () => {
    if (currentIndex < profiles.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePass = () => {
    if (currentIndex < profiles.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const currentProfile = profiles[currentIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF8F0] to-white p-6">
      {/* Header */}
      <div className="max-w-md mx-auto mb-8">
        <h1 className="text-4xl mb-2 bg-gradient-to-r from-[#FF6B9D] to-[#FF8A5C] bg-clip-text text-transparent">
          Waleef
        </h1>
        <p className="text-[#6B6B6B]">Today's matches for you</p>
      </div>

      {/* Match Cards */}
      <div className="max-w-md mx-auto relative" style={{ height: "600px" }}>
        <AnimatePresence>
          {currentProfile && (
            <motion.div
              key={currentProfile.id}
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, x: -100 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="absolute inset-0"
            >
              <Card
                variant="match"
                onClick={onMatchClick}
                className="h-full flex flex-col justify-between relative overflow-hidden"
              >
                {/* Match Percentage Badge */}
                <div className="absolute top-4 right-4 z-10">
                  <MatchPercentage
                    percentage={currentProfile.matchPercentage}
                    size="sm"
                  />
                </div>

                {/* Profile Image Placeholder */}
                <div className="h-80 bg-gradient-to-br from-pink-200 to-orange-200 rounded-[16px] mb-4 flex items-center justify-center relative">
                  <div className="text-8xl text-white">
                    {currentProfile.name[0]}
                  </div>
                  <div className="absolute top-4 left-4 flex gap-2">
                    {currentProfile.verified && <Badge variant="verified" />}
                    {currentProfile.premium && <Badge variant="premium" />}
                  </div>
                </div>

                {/* Profile Info */}
                <div className="flex-1 space-y-4">
                  <div>
                    <h2 className="text-3xl">
                      {currentProfile.name}, {currentProfile.age}
                    </h2>
                    <div className="flex items-center gap-2 text-[#6B6B6B] mt-2">
                      <MapPin size={16} />
                      <span className="text-sm">{currentProfile.location}</span>
                    </div>
                  </div>

                  <p className="text-[#6B6B6B] leading-relaxed">
                    {currentProfile.bio}
                  </p>

                  <div className="space-y-2">
                    <div className="flex items-center gap-3 text-sm">
                      <BookOpen size={18} className="text-[#FF6B9D]" />
                      <span>{currentProfile.education}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Briefcase size={18} className="text-[#FF6B9D]" />
                      <span>{currentProfile.occupation}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {currentProfile.interests.map((interest) => (
                      <span
                        key={interest}
                        className="px-3 py-1 bg-[#F5F1E8] rounded-full text-sm text-[#6B6B6B]"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {!currentProfile && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Star size={64} className="text-[#D4AF37] mx-auto mb-4" />
              <h3 className="text-2xl mb-2">No More Matches Today</h3>
              <p className="text-[#6B6B6B]">Check back tomorrow for new profiles!</p>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      {currentProfile && (
        <div className="max-w-md mx-auto flex justify-center gap-6 mt-8">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handlePass}
            className="w-16 h-16 rounded-full bg-white shadow-lg flex items-center justify-center border-2 border-gray-200 hover:border-red-300"
          >
            <X size={32} className="text-red-500" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleLike}
            className="w-20 h-20 rounded-full bg-gradient-to-r from-[#FF6B9D] to-[#FF8A5C] shadow-2xl flex items-center justify-center"
          >
            <Heart size={36} className="text-white fill-white" />
          </motion.button>
        </div>
      )}
    </div>
  );
}
