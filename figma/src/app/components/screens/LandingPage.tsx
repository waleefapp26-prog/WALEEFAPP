import { motion } from "motion/react";
import {
  Heart,
  Shield,
  Users,
  Sparkles,
  CheckCircle,
  Star,
  ArrowRight,
  Menu,
  X,
} from "lucide-react";
import { Button } from "../Button";
import { Card } from "../Card";
import { useState } from "react";

const features = [
  {
    icon: Heart,
    title: "Smart Matching",
    description:
      "Our AI analyzes values, lifestyle, and goals to find your perfect match",
  },
  {
    icon: Shield,
    title: "Privacy First",
    description:
      "Your journey is private and secure. We protect your data and dignity",
  },
  {
    icon: Users,
    title: "Family Support",
    description:
      "Involve your wali at your pace. We honor traditional Islamic values",
  },
  {
    icon: Sparkles,
    title: "AI Guidance",
    description:
      "Get personalized advice from our Islamic marriage counseling AI",
  },
];

const steps = [
  {
    number: "01",
    title: "Create Your Profile",
    description: "Share your values, goals, and what you're looking for in a partner",
  },
  {
    number: "02",
    title: "Get Matched",
    description: "Our algorithm finds compatible matches based on what matters most",
  },
  {
    number: "03",
    title: "Start Your Journey",
    description:
      "Connect respectfully, involve family when ready, and build towards marriage",
  },
];

const testimonials = [
  {
    name: "Ahmed & Fatima",
    location: "London, UK",
    story:
      "Alhamdulillah, we found each other on Waleef. The family involvement feature made the process so much easier and more respectful.",
    match: "95% Match",
  },
  {
    name: "Yusuf & Aisha",
    location: "New York, USA",
    story:
      "The AI coach helped us navigate difficult conversations. We're now happily married with a beautiful family.",
    match: "88% Match",
  },
  {
    name: "Omar & Maryam",
    location: "Dubai, UAE",
    story:
      "We appreciated how Waleef prioritized our Islamic values. The platform made it easy to find someone truly compatible.",
    match: "92% Match",
  },
];

interface LandingPageProps {
  onGetStarted: () => void;
}

export function LandingPage({ onGetStarted }: LandingPageProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF8F0] to-white">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl bg-gradient-to-r from-[#FF6B9D] to-[#FF8A5C] bg-clip-text text-transparent">
              Waleef
            </h1>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-[#6B6B6B] hover:text-[#FF6B9D] transition-colors">
                Features
              </a>
              <a href="#how-it-works" className="text-[#6B6B6B] hover:text-[#FF6B9D] transition-colors">
                How it Works
              </a>
              <a href="#pricing" className="text-[#6B6B6B] hover:text-[#FF6B9D] transition-colors">
                Pricing
              </a>
              <Button onClick={onGetStarted}>Get Started</Button>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="md:hidden pt-4 pb-2 space-y-3"
            >
              <a
                href="#features"
                className="block text-[#6B6B6B] hover:text-[#FF6B9D]"
              >
                Features
              </a>
              <a
                href="#how-it-works"
                className="block text-[#6B6B6B] hover:text-[#FF6B9D]"
              >
                How it Works
              </a>
              <a
                href="#pricing"
                className="block text-[#6B6B6B] hover:text-[#FF6B9D]"
              >
                Pricing
              </a>
              <Button onClick={onGetStarted} className="w-full">
                Get Started
              </Button>
            </motion.div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-24 md:py-32">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-100 to-orange-100 rounded-full mb-6">
              <Heart className="text-[#FF6B9D]" size={18} />
              <span className="text-sm font-medium">
                The Halal Way to Find Your Match
              </span>
            </div>

            <h1 className="text-6xl md:text-7xl mb-6 leading-tight">
              Find Your Life Partner
            </h1>
            <p className="text-xl text-[#6B6B6B] mb-8 leading-relaxed">
              Waleef connects you with compatible Muslims seeking marriage. Built
              on Islamic values, privacy, and family involvement.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button onClick={onGetStarted} className="text-lg px-10 py-5">
                Start Your Journey
                <ArrowRight className="ml-2" size={20} />
              </Button>
              <Button variant="outline" className="text-lg px-10 py-5">
                Learn More
              </Button>
            </div>

            <div className="flex items-center gap-8 mt-12">
              <div>
                <p className="text-3xl font-bold text-[#1A1A1A]">50K+</p>
                <p className="text-sm text-[#6B6B6B]">Active Users</p>
              </div>
              <div className="w-px h-12 bg-gray-300" />
              <div>
                <p className="text-3xl font-bold text-[#1A1A1A]">2,500+</p>
                <p className="text-sm text-[#6B6B6B]">Marriages</p>
              </div>
              <div className="w-px h-12 bg-gray-300" />
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="text-[#D4AF37] fill-[#D4AF37]"
                      size={18}
                    />
                  ))}
                </div>
                <p className="text-sm text-[#6B6B6B]">4.9/5</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            {/* Decorative Elements */}
            <div className="relative h-[600px] rounded-[32px] bg-gradient-to-br from-pink-200 to-orange-200 overflow-hidden shadow-2xl">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-[200px] text-white/20 select-none">W</div>
              </div>

              {/* Floating Cards */}
              <motion.div
                animate={{ y: [0, -20, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute top-12 right-12"
              >
                <Card className="p-4 shadow-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-300 to-orange-300" />
                    <div>
                      <p className="font-medium text-sm">95% Match</p>
                      <p className="text-xs text-[#6B6B6B]">Compatible values</p>
                    </div>
                  </div>
                </Card>
              </motion.div>

              <motion.div
                animate={{ y: [0, 20, 0] }}
                transition={{ duration: 5, repeat: Infinity }}
                className="absolute bottom-12 left-12"
              >
                <Card className="p-4 shadow-xl">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="text-green-600" size={20} />
                    <p className="text-sm font-medium">Verified Profile</p>
                  </div>
                </Card>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-white py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-5xl mb-4">Why Choose Waleef?</h2>
            <p className="text-lg text-[#6B6B6B] max-w-2xl mx-auto">
              We've built the most thoughtful platform for Muslims seeking
              marriage
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="text-center h-full">
                    <div className="w-16 h-16 bg-gradient-to-br from-[#FF6B9D] to-[#FF8A5C] rounded-full flex items-center justify-center mx-auto mb-6">
                      <Icon className="text-white" size={28} />
                    </div>
                    <h3 className="text-xl mb-3">{feature.title}</h3>
                    <p className="text-[#6B6B6B]">{feature.description}</p>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-5xl mb-4">How It Works</h2>
            <p className="text-lg text-[#6B6B6B]">
              Three simple steps to finding your life partner
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="relative"
              >
                <div className="text-8xl font-bold text-[#F5F1E8] mb-4">
                  {step.number}
                </div>
                <h3 className="text-2xl mb-3">{step.title}</h3>
                <p className="text-[#6B6B6B] leading-relaxed">
                  {step.description}
                </p>

                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-12 -right-6 text-[#FF6B9D]">
                    <ArrowRight size={32} />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-gradient-to-br from-pink-50 to-orange-50 py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-5xl mb-4">Success Stories</h2>
            <p className="text-lg text-[#6B6B6B]">
              Alhamdulillah, we've helped thousands find their match
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="text-[#D4AF37] fill-[#D4AF37]"
                        size={16}
                      />
                    ))}
                  </div>
                  <p className="text-[#6B6B6B] leading-relaxed mb-6 italic">
                    "{testimonial.story}"
                  </p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{testimonial.name}</p>
                      <p className="text-sm text-[#6B6B6B]">
                        {testimonial.location}
                      </p>
                    </div>
                    <div className="px-3 py-1 bg-gradient-to-r from-pink-100 to-orange-100 rounded-full text-sm font-medium text-[#FF6B9D]">
                      {testimonial.match}
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-[#FF6B9D] to-[#FF8A5C] rounded-[32px] p-12 md:p-16 text-white shadow-2xl"
          >
            <h2 className="text-4xl md:text-5xl mb-6">
              Ready to Find Your Match?
            </h2>
            <p className="text-xl mb-8 text-white/90">
              Join thousands of Muslims finding their life partners the halal way
            </p>
            <Button
              onClick={onGetStarted}
              variant="secondary"
              className="text-lg px-10 py-5 bg-white text-[#FF6B9D] hover:bg-gray-50"
            >
              Start Your Journey Today
              <ArrowRight className="ml-2" size={20} />
            </Button>
            <p className="text-sm mt-6 text-white/80">
              Free to join • No credit card required
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1A1A1A] text-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-2xl bg-gradient-to-r from-[#FF6B9D] to-[#FF8A5C] bg-clip-text text-transparent mb-4">
                Waleef
              </h3>
              <p className="text-gray-400 text-sm">
                The halal way to find your life partner
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>Features</li>
                <li>How it Works</li>
                <li>Pricing</li>
                <li>Success Stories</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>About Us</li>
                <li>Islamic Values</li>
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>Help Center</li>
                <li>Contact Us</li>
                <li>Safety Tips</li>
                <li>FAQ</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2026 Waleef. All rights reserved. Made with ❤️ for the Ummah</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
