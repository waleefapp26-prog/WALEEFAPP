import { motion } from "motion/react";
import { useState } from "react";
import { Button } from "../Button";
import { Input } from "../Input";
import { ProgressBar } from "../ProgressBar";
import { Tag } from "../Tag";

interface ProfileCreationProps {
  onComplete: () => void;
}

export function ProfileCreation({ onComplete }: ProfileCreationProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    location: "",
    prayerFrequency: [] as string[],
    hijabPreference: "",
    education: "",
    occupation: "",
    interests: [] as string[],
    lookingFor: "",
  });

  const prayerOptions = ["5 times daily", "Regularly", "Occasionally", "Learning"];
  const hijabOptions = ["Yes", "No", "In progress", "Prefer not to say"];
  const interestOptions = [
    "Reading",
    "Sports",
    "Travel",
    "Cooking",
    "Art",
    "Technology",
    "Nature",
    "Music",
  ];

  const toggleSelection = (field: string, value: string) => {
    const current = formData[field as keyof typeof formData] as string[];
    if (current.includes(value)) {
      setFormData({
        ...formData,
        [field]: current.filter((v) => v !== value),
      });
    } else {
      setFormData({ ...formData, [field]: [...current, value] });
    }
  };

  const nextStep = () => {
    if (step < 4) {
      setStep(step + 1);
    } else {
      onComplete();
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div>
              <h2 className="text-3xl mb-2">Tell us about yourself</h2>
              <p className="text-[#6B6B6B]">Let's start with the basics</p>
            </div>
            <Input
              label="Full Name"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={(v) => setFormData({ ...formData, name: v })}
            />
            <Input
              label="Age"
              type="number"
              placeholder="Your age"
              value={formData.age}
              onChange={(v) => setFormData({ ...formData, age: v })}
            />
            <Input
              label="Location"
              placeholder="City, Country"
              value={formData.location}
              onChange={(v) => setFormData({ ...formData, location: v })}
            />
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div>
              <h2 className="text-3xl mb-2">Your Faith Journey</h2>
              <p className="text-[#6B6B6B]">
                Help us understand your religious practice
              </p>
            </div>
            <div>
              <label className="block text-sm text-[#6B6B6B] mb-3">
                How often do you pray?
              </label>
              <div className="flex flex-wrap gap-2">
                {prayerOptions.map((option) => (
                  <Tag
                    key={option}
                    label={option}
                    selected={formData.prayerFrequency.includes(option)}
                    onClick={() => toggleSelection("prayerFrequency", option)}
                  />
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm text-[#6B6B6B] mb-3">
                Do you wear hijab? (For sisters)
              </label>
              <div className="flex flex-wrap gap-2">
                {hijabOptions.map((option) => (
                  <Tag
                    key={option}
                    label={option}
                    selected={formData.hijabPreference === option}
                    onClick={() =>
                      setFormData({ ...formData, hijabPreference: option })
                    }
                  />
                ))}
              </div>
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div>
              <h2 className="text-3xl mb-2">Lifestyle & Education</h2>
              <p className="text-[#6B6B6B]">Share your professional background</p>
            </div>
            <Input
              label="Education Level"
              placeholder="e.g., Bachelor's Degree"
              value={formData.education}
              onChange={(v) => setFormData({ ...formData, education: v })}
            />
            <Input
              label="Occupation"
              placeholder="Your profession"
              value={formData.occupation}
              onChange={(v) => setFormData({ ...formData, occupation: v })}
            />
            <div>
              <label className="block text-sm text-[#6B6B6B] mb-3">
                Interests & Hobbies
              </label>
              <div className="flex flex-wrap gap-2">
                {interestOptions.map((option) => (
                  <Tag
                    key={option}
                    label={option}
                    selected={formData.interests.includes(option)}
                    onClick={() => toggleSelection("interests", option)}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        );

      case 4:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div>
              <h2 className="text-3xl mb-2">Your Preferences</h2>
              <p className="text-[#6B6B6B]">
                What are you looking for in a partner?
              </p>
            </div>
            <div>
              <label className="block text-sm text-[#6B6B6B] mb-3">
                Describe your ideal match
              </label>
              <textarea
                value={formData.lookingFor}
                onChange={(e) =>
                  setFormData({ ...formData, lookingFor: e.target.value })
                }
                placeholder="Share what qualities matter most to you..."
                className="w-full h-40 px-6 py-4 rounded-[16px] border-2 border-gray-200 focus:border-[#FF6B9D] outline-none resize-none transition-all"
              />
            </div>
          </motion.div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF8F0] to-white p-6 flex items-center justify-center">
      <div className="w-full max-w-md">
        <ProgressBar currentStep={step} totalSteps={4} className="mb-8" />
        {renderStep()}
        <div className="flex gap-4 mt-8">
          {step > 1 && (
            <Button
              variant="secondary"
              onClick={() => setStep(step - 1)}
              className="flex-1"
            >
              Back
            </Button>
          )}
          <Button onClick={nextStep} className="flex-1">
            {step === 4 ? "Complete Profile" : "Continue"}
          </Button>
        </div>
      </div>
    </div>
  );
}
