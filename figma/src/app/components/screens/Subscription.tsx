import { motion } from "motion/react";
import { Check, Crown, Sparkles, Shield } from "lucide-react";
import { Card } from "../Card";
import { Button } from "../Button";

const plans = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Start your journey",
    features: [
      "3 matches per day",
      "Basic profile",
      "Standard matching algorithm",
      "Chat with matches",
      "Profile verification",
    ],
    notIncluded: [
      "Advanced filters",
      "See who liked you",
      "Priority support",
      "AI coach access",
    ],
  },
  {
    id: "premium",
    name: "Premium",
    price: "$29",
    period: "month",
    description: "Most popular choice",
    featured: true,
    features: [
      "Unlimited matches",
      "Advanced profile options",
      "Enhanced matching algorithm",
      "See who liked you",
      "Advanced filters",
      "Priority chat placement",
      "Profile boost (2x/month)",
      "Read receipts",
      "AI coach access",
      "Priority support",
    ],
    notIncluded: [],
  },
  {
    id: "gold",
    name: "Gold",
    price: "$49",
    period: "month",
    description: "Complete experience",
    features: [
      "Everything in Premium",
      "Dedicated relationship counselor",
      "Family introduction mediation",
      "Background verification service",
      "Unlimited profile boosts",
      "VIP badge",
      "Early access to features",
      "Monthly compatibility reports",
    ],
    notIncluded: [],
  },
];

export function Subscription() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF8F0] to-white py-12 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-100 to-orange-100 rounded-full mb-4"
          >
            <Crown className="text-[#D4AF37]" size={20} />
            <span className="text-sm font-medium text-[#1A1A1A]">
              Choose Your Plan
            </span>
          </motion.div>
          <h1 className="text-5xl mb-4">Find Your Life Partner</h1>
          <p className="text-lg text-[#6B6B6B] max-w-2xl mx-auto">
            Invest in your future. Choose a plan that works for your journey to
            marriage.
          </p>
        </div>

        {/* Trust Badge */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex items-center gap-6 px-6 py-3 bg-white rounded-full shadow-md">
            <div className="flex items-center gap-2">
              <Shield className="text-green-600" size={18} />
              <span className="text-sm">Secure & Private</span>
            </div>
            <div className="w-px h-6 bg-gray-200" />
            <div className="flex items-center gap-2">
              <Sparkles className="text-[#D4AF37]" size={18} />
              <span className="text-sm">Islamic Values</span>
            </div>
            <div className="w-px h-6 bg-gray-200" />
            <div className="flex items-center gap-2">
              <Check className="text-blue-600" size={18} />
              <span className="text-sm">Cancel Anytime</span>
            </div>
          </div>
        </div>

        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card
                className={`h-full flex flex-col relative ${
                  plan.featured
                    ? "border-2 border-[#FF6B9D] shadow-2xl scale-105"
                    : ""
                }`}
              >
                {plan.featured && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <div className="px-4 py-1.5 bg-gradient-to-r from-[#FF6B9D] to-[#FF8A5C] text-white text-sm font-medium rounded-full shadow-lg">
                      Most Popular
                    </div>
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-2xl mb-2">{plan.name}</h3>
                  <p className="text-sm text-[#6B6B6B] mb-4">
                    {plan.description}
                  </p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-bold">{plan.price}</span>
                    <span className="text-[#6B6B6B]">/ {plan.period}</span>
                  </div>
                </div>

                <div className="flex-1 space-y-3 mb-6">
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-start gap-3">
                      <Check
                        className="text-green-600 flex-shrink-0 mt-0.5"
                        size={18}
                      />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                  {plan.notIncluded.map((feature) => (
                    <div key={feature} className="flex items-start gap-3 opacity-40">
                      <div className="w-[18px] h-[18px] flex-shrink-0 mt-0.5">
                        <div className="w-3 h-0.5 bg-gray-400" />
                      </div>
                      <span className="text-sm line-through">{feature}</span>
                    </div>
                  ))}
                </div>

                <Button
                  variant={plan.featured ? "primary" : "outline"}
                  className="w-full"
                >
                  {plan.id === "free" ? "Current Plan" : "Upgrade Now"}
                </Button>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* FAQ / Note */}
        <Card className="max-w-3xl mx-auto text-center bg-gradient-to-r from-pink-50 to-orange-50">
          <h3 className="text-xl mb-3">Our Commitment to You</h3>
          <p className="text-[#6B6B6B] leading-relaxed">
            We're dedicated to helping you find a compatible partner in a halal,
            respectful way. All our services prioritize your privacy, safety, and
            adherence to Islamic values. Cancel anytime, no questions asked.
          </p>
        </Card>
      </div>
    </div>
  );
}
