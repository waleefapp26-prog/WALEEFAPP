import { motion } from "motion/react";
import {
  MapPin,
  Briefcase,
  BookOpen,
  Heart,
  MessageCircle,
  Users,
  Calendar,
  Award,
} from "lucide-react";
import { Card } from "../Card";
import { Badge } from "../Badge";
import { MatchPercentage } from "../MatchPercentage";
import { Button } from "../Button";

const profile = {
  name: "Sarah",
  age: 26,
  location: "New York, USA",
  education: "Master's in Psychology",
  occupation: "Clinical Therapist",
  bio: "Practicing Muslim seeking a partner who values faith, family, and personal growth. I believe in building a relationship on mutual respect, shared values, and commitment to growing together spiritually.",
  matchPercentage: 87,
  verified: true,
  premium: true,
  interests: ["Reading", "Volunteering", "Hiking", "Cooking", "Art"],
  religiousValues: {
    prayer: "5 times daily",
    quranReading: "Daily",
    hijab: "Yes",
    communityInvolvement: "Active",
  },
  lifestyle: {
    smoking: "No",
    drinking: "No",
    diet: "Halal only",
    exercise: "Regularly",
  },
  familyGoals: "Seeking marriage with the intention of building a family. Values include strong Islamic foundation, mutual respect, and partnership in both deen and dunya.",
  compatibility: [
    { label: "Religious Values", score: 95 },
    { label: "Lifestyle", score: 88 },
    { label: "Family Goals", score: 82 },
    { label: "Personality", score: 85 },
  ],
};

export function ProfileView() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF8F0] to-white pb-24">
      {/* Header Image */}
      <div className="h-96 bg-gradient-to-br from-pink-300 to-orange-300 relative flex items-center justify-center">
        <div className="text-9xl text-white">{profile.name[0]}</div>
        <div className="absolute top-6 left-6 flex gap-2">
          {profile.verified && <Badge variant="verified" />}
          {profile.premium && <Badge variant="premium" />}
        </div>
        <div className="absolute top-6 right-6">
          <MatchPercentage percentage={profile.matchPercentage} size="sm" />
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 -mt-12">
        {/* Main Info Card */}
        <Card variant="profile" className="mb-6">
          <h1 className="text-4xl mb-2">
            {profile.name}, {profile.age}
          </h1>
          <div className="flex items-center gap-2 text-[#6B6B6B] mb-4">
            <MapPin size={18} />
            <span>{profile.location}</span>
          </div>
          <p className="text-[#6B6B6B] leading-relaxed mb-6">{profile.bio}</p>
          <div className="flex flex-wrap gap-2">
            {profile.interests.map((interest) => (
              <span
                key={interest}
                className="px-4 py-2 bg-gradient-to-r from-pink-50 to-orange-50 rounded-full text-sm text-[#FF6B9D]"
              >
                {interest}
              </span>
            ))}
          </div>
        </Card>

        {/* Professional Info */}
        <Card className="mb-6 space-y-4">
          <h3 className="text-2xl mb-4">Professional Background</h3>
          <div className="flex items-start gap-4">
            <BookOpen size={24} className="text-[#FF6B9D] mt-1" />
            <div>
              <p className="font-medium">Education</p>
              <p className="text-[#6B6B6B]">{profile.education}</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <Briefcase size={24} className="text-[#FF6B9D] mt-1" />
            <div>
              <p className="font-medium">Occupation</p>
              <p className="text-[#6B6B6B]">{profile.occupation}</p>
            </div>
          </div>
        </Card>

        {/* Religious Values */}
        <Card className="mb-6">
          <h3 className="text-2xl mb-4">Religious Practice</h3>
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(profile.religiousValues).map(([key, value]) => (
              <div key={key} className="p-4 bg-[#FFF8F0] rounded-[12px]">
                <p className="text-sm text-[#6B6B6B] mb-1 capitalize">
                  {key.replace(/([A-Z])/g, " $1")}
                </p>
                <p className="font-medium">{value}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Lifestyle */}
        <Card className="mb-6">
          <h3 className="text-2xl mb-4">Lifestyle</h3>
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(profile.lifestyle).map(([key, value]) => (
              <div key={key} className="p-4 bg-[#FFF8F0] rounded-[12px]">
                <p className="text-sm text-[#6B6B6B] mb-1 capitalize">{key}</p>
                <p className="font-medium">{value}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Family Goals */}
        <Card className="mb-6">
          <h3 className="text-2xl mb-4">Marriage & Family Goals</h3>
          <p className="text-[#6B6B6B] leading-relaxed">{profile.familyGoals}</p>
        </Card>

        {/* Compatibility Breakdown */}
        <Card className="mb-6">
          <h3 className="text-2xl mb-6">Compatibility Breakdown</h3>
          <div className="space-y-4">
            {profile.compatibility.map((item) => (
              <div key={item.label}>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">{item.label}</span>
                  <span className="text-sm font-bold text-[#FF6B9D]">
                    {item.score}%
                  </span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${item.score}%` }}
                    transition={{ delay: 0.2, duration: 1 }}
                    className="h-full bg-gradient-to-r from-[#FF6B9D] to-[#FF8A5C]"
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Fixed Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-6">
        <div className="max-w-2xl mx-auto flex gap-4">
          <Button variant="secondary" className="flex-1 flex items-center justify-center gap-2">
            <Users size={20} />
            Involve Family
          </Button>
          <Button className="flex-1 flex items-center justify-center gap-2">
            <MessageCircle size={20} />
            Express Interest
          </Button>
        </div>
      </div>
    </div>
  );
}
