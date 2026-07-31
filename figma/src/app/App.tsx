import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Menu, Home as HomeIcon, MessageCircle, Users, Sparkles, Crown, Heart, X } from "lucide-react";

// Screens
import { LandingPage } from "./components/screens/LandingPage";
import { Onboarding } from "./components/screens/Onboarding";
import { Authentication } from "./components/screens/Authentication";
import { ProfileCreation } from "./components/screens/ProfileCreation";
import { Home } from "./components/screens/Home";
import { ProfileView } from "./components/screens/ProfileView";
import { MatchResult } from "./components/screens/MatchResult";
import { Chat } from "./components/screens/Chat";
import { FamilyPanel } from "./components/screens/FamilyPanel";
import { ProposalFlow } from "./components/screens/ProposalFlow";
import { AICoach } from "./components/screens/AICoach";
import { Subscription } from "./components/screens/Subscription";
import { DesignSystem } from "./components/screens/DesignSystem";

type Screen =
  | "landing"
  | "onboarding"
  | "auth"
  | "profile-creation"
  | "home"
  | "profile-view"
  | "match-result"
  | "chat"
  | "family-panel"
  | "proposal-flow"
  | "ai-coach"
  | "subscription"
  | "design-system";

const navItems = [
  { id: "home", label: "Matches", icon: Heart },
  { id: "chat", label: "Chats", icon: MessageCircle },
  { id: "ai-coach", label: "AI Coach", icon: Sparkles },
  { id: "family-panel", label: "Family", icon: Users },
  { id: "subscription", label: "Premium", icon: Crown },
];

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("landing");
  const [showNav, setShowNav] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleComplete = (nextScreen: Screen) => {
    setCurrentScreen(nextScreen);
    if (nextScreen === "home") {
      setShowNav(true);
    }
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case "landing":
        return <LandingPage onGetStarted={() => handleComplete("onboarding")} />;
      case "onboarding":
        return <Onboarding onComplete={() => handleComplete("auth")} />;
      case "auth":
        return <Authentication onComplete={() => handleComplete("profile-creation")} />;
      case "profile-creation":
        return <ProfileCreation onComplete={() => handleComplete("home")} />;
      case "home":
        return <Home onMatchClick={() => setCurrentScreen("profile-view")} />;
      case "profile-view":
        return <ProfileView />;
      case "match-result":
        return <MatchResult onContinue={() => setCurrentScreen("chat")} />;
      case "chat":
        return <Chat />;
      case "family-panel":
        return <FamilyPanel />;
      case "proposal-flow":
        return <ProposalFlow />;
      case "ai-coach":
        return <AICoach />;
      case "subscription":
        return <Subscription />;
      case "design-system":
        return <DesignSystem />;
      default:
        return <LandingPage onGetStarted={() => handleComplete("onboarding")} />;
    }
  };

  // Screens that shouldn't show navigation
  const hideNavScreens: Screen[] = ["landing", "onboarding", "auth", "profile-creation", "chat"];

  return (
    <div className="size-full bg-gradient-to-br from-[#FFF8F0] to-white relative">
      {/* Main Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentScreen}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="size-full overflow-auto"
        >
          {renderScreen()}
        </motion.div>
      </AnimatePresence>

      {/* Desktop Navigation */}
      {showNav && !hideNavScreens.includes(currentScreen) && (
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="hidden md:block fixed bottom-8 left-1/2 -translate-x-1/2 z-50"
        >
          <div className="bg-white/90 backdrop-blur-lg rounded-full px-6 py-4 shadow-2xl border border-gray-200">
            <div className="flex items-center gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentScreen === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setCurrentScreen(item.id as Screen)}
                    className={`flex items-center gap-2 px-6 py-3 rounded-full transition-all ${
                      isActive
                        ? "bg-gradient-to-r from-[#FF6B9D] to-[#FF8A5C] text-white shadow-lg"
                        : "text-[#6B6B6B] hover:bg-[#F5F1E8]"
                    }`}
                  >
                    <Icon size={20} />
                    <span className="text-sm font-medium">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}

      {/* Mobile Navigation */}
      {showNav && !hideNavScreens.includes(currentScreen) && (
        <>
          {/* Mobile Bottom Nav */}
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200"
          >
            <div className="flex justify-around items-center px-4 py-3">
              {navItems.slice(0, 4).map((item) => {
                const Icon = item.icon;
                const isActive = currentScreen === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setCurrentScreen(item.id as Screen)}
                    className={`flex flex-col items-center gap-1 py-2 px-4 rounded-lg transition-all ${
                      isActive ? "text-[#FF6B9D]" : "text-[#6B6B6B]"
                    }`}
                  >
                    <Icon size={22} />
                    <span className="text-xs font-medium">{item.label}</span>
                  </button>
                );
              })}
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="flex flex-col items-center gap-1 py-2 px-4 rounded-lg text-[#6B6B6B]"
              >
                <Menu size={22} />
                <span className="text-xs font-medium">More</span>
              </button>
            </div>
          </motion.div>

          {/* Mobile Menu Modal */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setMobileMenuOpen(false)}
                  className="md:hidden fixed inset-0 bg-black/50 z-[60]"
                />
                <motion.div
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "100%" }}
                  transition={{ type: "spring", damping: 30, stiffness: 300 }}
                  className="md:hidden fixed bottom-0 left-0 right-0 z-[70] bg-white rounded-t-[32px] p-6"
                >
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl">Menu</h3>
                    <button
                      onClick={() => setMobileMenuOpen(false)}
                      className="p-2 hover:bg-gray-100 rounded-full"
                    >
                      <X size={24} />
                    </button>
                  </div>

                  <div className="space-y-2">
                    {navItems.map((item) => {
                      const Icon = item.icon;
                      const isActive = currentScreen === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            setCurrentScreen(item.id as Screen);
                            setMobileMenuOpen(false);
                          }}
                          className={`w-full flex items-center gap-4 px-6 py-4 rounded-[16px] transition-all ${
                            isActive
                              ? "bg-gradient-to-r from-[#FF6B9D] to-[#FF8A5C] text-white"
                              : "bg-[#F5F1E8] text-[#1A1A1A] hover:bg-[#E8E4D8]"
                          }`}
                        >
                          <Icon size={24} />
                          <span className="font-medium">{item.label}</span>
                        </button>
                      );
                    })}

                    <button
                      onClick={() => {
                        setCurrentScreen("proposal-flow");
                        setMobileMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-4 px-6 py-4 rounded-[16px] bg-[#F5F1E8] text-[#1A1A1A] hover:bg-[#E8E4D8] transition-all"
                    >
                      <Users size={24} />
                      <span className="font-medium">Proposal Flow</span>
                    </button>

                    <button
                      onClick={() => {
                        setCurrentScreen("match-result");
                        setMobileMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-4 px-6 py-4 rounded-[16px] bg-[#F5F1E8] text-[#1A1A1A] hover:bg-[#E8E4D8] transition-all"
                    >
                      <Heart size={24} />
                      <span className="font-medium">Match Result</span>
                    </button>

                    <div className="border-t border-gray-200 my-4 pt-4">
                      <p className="text-xs text-[#6B6B6B] mb-2 px-6">Design Resources</p>
                      <button
                        onClick={() => {
                          setCurrentScreen("design-system");
                          setMobileMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-4 px-6 py-4 rounded-[16px] bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 hover:from-purple-200 hover:to-pink-200 transition-all"
                      >
                        <Sparkles size={24} />
                        <span className="font-medium">Design System</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </>
      )}

      {/* Quick Access - Floating Actions for Demo */}
      {currentScreen === "home" && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5 }}
          className="fixed top-6 right-6 z-40"
        >
          <button
            onClick={() => setCurrentScreen("match-result")}
            className="w-14 h-14 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full shadow-2xl flex items-center justify-center text-white hover:scale-110 transition-transform"
            title="View Match Result (Demo)"
          >
            <Sparkles size={24} />
          </button>
        </motion.div>
      )}

      {currentScreen === "landing" && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 1 }}
          className="fixed bottom-6 right-6 z-40"
        >
          <button
            onClick={() => setCurrentScreen("design-system")}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full shadow-2xl text-white font-medium hover:scale-105 transition-transform flex items-center gap-2"
            title="View Design System"
          >
            <Sparkles size={20} />
            View Design System
          </button>
        </motion.div>
      )}
    </div>
  );
}