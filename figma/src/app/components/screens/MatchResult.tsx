import { motion } from "motion/react";
import { Sparkles, Heart, MessageCircle, Users } from "lucide-react";
import { MatchPercentage } from "../MatchPercentage";
import { Button } from "../Button";
import { Card } from "../Card";

const matchDetails = {
  name: "Sarah",
  percentage: 92,
  strongPoints: [
    { label: "Religious Values", description: "Both prioritize daily prayers and Quran reading" },
    { label: "Family Goals", description: "Aligned vision for marriage and children" },
    { label: "Lifestyle Choices", description: "Similar approach to halal living and health" },
    { label: "Educational Background", description: "Compatible educational and career goals" },
  ],
  considerations: [
    { label: "Location", description: "Different cities - willing to relocate?" },
    { label: "Family Involvement", description: "Different approaches to family engagement" },
  ],
};

interface MatchResultProps {
  onContinue: () => void;
}

export function MatchResult({ onContinue }: MatchResultProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF8F0] to-white p-6 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl"
      >
        {/* Celebration Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="inline-block mb-6"
          >
            <div className="relative">
              <MatchPercentage percentage={matchDetails.percentage} size="lg" />
              <motion.div
                animate={{
                  rotate: [0, 10, -10, 10, 0],
                  scale: [1, 1.2, 1.2, 1.2, 1],
                }}
                transition={{ delay: 1, duration: 0.6 }}
                className="absolute -top-4 -right-4"
              >
                <Sparkles className="text-[#D4AF37]" size={32} />
              </motion.div>
            </div>
          </motion.div>
          <h1 className="text-4xl mb-3">It's a Great Match!</h1>
          <p className="text-lg text-[#6B6B6B]">
            You and {matchDetails.name} have exceptional compatibility
          </p>
        </div>

        {/* Strong Points */}
        <Card className="mb-6">
          <div className="flex items-center gap-2 mb-6">
            <Heart className="text-[#FF6B9D]" size={24} />
            <h3 className="text-2xl">What Makes This Match Strong</h3>
          </div>
          <div className="space-y-4">
            {matchDetails.strongPoints.map((point, index) => (
              <motion.div
                key={point.label}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="p-4 bg-gradient-to-r from-pink-50 to-orange-50 rounded-[16px]"
              >
                <p className="font-medium text-[#1A1A1A] mb-1">{point.label}</p>
                <p className="text-sm text-[#6B6B6B]">{point.description}</p>
              </motion.div>
            ))}
          </div>
        </Card>

        {/* Considerations */}
        <Card className="mb-8">
          <h3 className="text-2xl mb-4">Points to Discuss</h3>
          <div className="space-y-4">
            {matchDetails.considerations.map((point, index) => (
              <motion.div
                key={point.label}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + index * 0.1 }}
                className="p-4 bg-[#FFF8F0] rounded-[16px]"
              >
                <p className="font-medium text-[#1A1A1A] mb-1">{point.label}</p>
                <p className="text-sm text-[#6B6B6B]">{point.description}</p>
              </motion.div>
            ))}
          </div>
        </Card>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-4">
          <Button
            variant="secondary"
            className="flex items-center justify-center gap-2"
          >
            <Users size={20} />
            Involve Family
          </Button>
          <Button
            onClick={onContinue}
            className="flex items-center justify-center gap-2"
          >
            <MessageCircle size={20} />
            Start Conversation
          </Button>
        </div>

        <p className="text-center text-sm text-[#6B6B6B] mt-6">
          Remember: Take your time and involve your wali when you're ready
        </p>
      </motion.div>
    </div>
  );
}
