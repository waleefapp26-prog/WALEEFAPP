import { motion } from "motion/react";
import { useState } from "react";
import { Users, UserCheck, MessageSquare, CheckCircle } from "lucide-react";
import { Card } from "../Card";
import { Button } from "../Button";
import { ProgressBar } from "../ProgressBar";

const approachOptions = [
  {
    id: "self",
    icon: UserCheck,
    title: "Manage Myself",
    description: "Handle the proposal process independently and involve family later",
  },
  {
    id: "wali",
    icon: Users,
    title: "Direct to Wali",
    description: "Connect your wali directly with the other party's family",
  },
  {
    id: "mediator",
    icon: MessageSquare,
    title: "Waleef Mediator",
    description: "Let our Islamic counselor facilitate the introduction",
  },
];

export function ProposalFlow() {
  const [step, setStep] = useState(1);
  const [selectedApproach, setSelectedApproach] = useState<string | null>(null);
  const [waliInfo, setWaliInfo] = useState({
    name: "",
    relation: "",
    phone: "",
    email: "",
  });

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl mb-3">Choose Your Approach</h2>
              <p className="text-[#6B6B6B]">
                How would you like to proceed with this match?
              </p>
            </div>

            <div className="space-y-4">
              {approachOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <Card
                    key={option.id}
                    onClick={() => setSelectedApproach(option.id)}
                    className={`cursor-pointer transition-all ${
                      selectedApproach === option.id
                        ? "border-2 border-[#FF6B9D] shadow-lg"
                        : "border-2 border-transparent hover:border-gray-200"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`w-14 h-14 rounded-full flex items-center justify-center ${
                          selectedApproach === option.id
                            ? "bg-gradient-to-r from-[#FF6B9D] to-[#FF8A5C]"
                            : "bg-[#F5F1E8]"
                        }`}
                      >
                        <Icon
                          className={
                            selectedApproach === option.id
                              ? "text-white"
                              : "text-[#6B6B6B]"
                          }
                          size={24}
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-medium mb-1">
                          {option.title}
                        </h3>
                        <p className="text-sm text-[#6B6B6B]">
                          {option.description}
                        </p>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl mb-3">Wali Information</h2>
              <p className="text-[#6B6B6B]">
                Please provide your guardian's details
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-[#6B6B6B] mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={waliInfo.name}
                  onChange={(e) =>
                    setWaliInfo({ ...waliInfo, name: e.target.value })
                  }
                  placeholder="Guardian's full name"
                  className="w-full px-6 py-4 rounded-[16px] border-2 border-gray-200 focus:border-[#FF6B9D] outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm text-[#6B6B6B] mb-2">
                  Relation
                </label>
                <select
                  value={waliInfo.relation}
                  onChange={(e) =>
                    setWaliInfo({ ...waliInfo, relation: e.target.value })
                  }
                  className="w-full px-6 py-4 rounded-[16px] border-2 border-gray-200 focus:border-[#FF6B9D] outline-none transition-all"
                >
                  <option value="">Select relation</option>
                  <option value="father">Father</option>
                  <option value="brother">Brother</option>
                  <option value="uncle">Uncle</option>
                  <option value="grandfather">Grandfather</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-[#6B6B6B] mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={waliInfo.phone}
                  onChange={(e) =>
                    setWaliInfo({ ...waliInfo, phone: e.target.value })
                  }
                  placeholder="Guardian's phone"
                  className="w-full px-6 py-4 rounded-[16px] border-2 border-gray-200 focus:border-[#FF6B9D] outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm text-[#6B6B6B] mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={waliInfo.email}
                  onChange={(e) =>
                    setWaliInfo({ ...waliInfo, email: e.target.value })
                  }
                  placeholder="Guardian's email"
                  className="w-full px-6 py-4 rounded-[16px] border-2 border-gray-200 focus:border-[#FF6B9D] outline-none transition-all"
                />
              </div>
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-24 h-24 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <CheckCircle className="text-white" size={48} />
            </motion.div>

            <h2 className="text-3xl mb-4">Request Submitted!</h2>
            <p className="text-[#6B6B6B] mb-8 max-w-md mx-auto">
              Your proposal request has been sent. We'll notify both families and
              guide you through the next steps.
            </p>

            <div className="max-w-md mx-auto">
              <Card variant="info" className="text-left mb-4">
                <h4 className="font-medium mb-2">What happens next?</h4>
                <ol className="space-y-2 text-sm text-[#6B6B6B]">
                  <li>1. Both families will be notified</li>
                  <li>2. Initial introduction meeting will be scheduled</li>
                  <li>3. Our counselor will facilitate the discussion</li>
                  <li>4. You'll receive guidance throughout the process</li>
                </ol>
              </Card>

              <p className="text-sm text-[#6B6B6B]">
                Expected response time: 2-3 business days
              </p>
            </div>
          </motion.div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF8F0] to-white p-6 flex items-center justify-center">
      <div className="w-full max-w-2xl">
        {step < 3 && (
          <ProgressBar currentStep={step} totalSteps={3} className="mb-8" />
        )}

        {renderStep()}

        {step < 3 && (
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
            <Button
              onClick={() => setStep(step + 1)}
              className="flex-1"
              disabled={step === 1 && !selectedApproach}
            >
              {step === 2 ? "Submit Request" : "Continue"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
