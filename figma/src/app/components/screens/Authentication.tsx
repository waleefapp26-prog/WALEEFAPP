import { motion } from "motion/react";
import { useState } from "react";
import { Mail, Phone, Lock } from "lucide-react";
import { Button } from "../Button";
import { Input } from "../Input";

interface AuthenticationProps {
  onComplete: () => void;
}

export function Authentication({ onComplete }: AuthenticationProps) {
  const [mode, setMode] = useState<"login" | "signup">("signup");
  const [step, setStep] = useState<"credentials" | "otp">("credentials");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");

  const handleSendOTP = () => {
    setStep("otp");
  };

  const handleVerifyOTP = () => {
    onComplete();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF8F0] to-white flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-12">
          <h1 className="text-5xl mb-3 bg-gradient-to-r from-[#FF6B9D] to-[#FF8A5C] bg-clip-text text-transparent">
            Waleef
          </h1>
          <p className="text-[#6B6B6B]">Your Journey to Marriage Begins</p>
        </div>

        {/* Auth Form */}
        <div className="bg-white rounded-[24px] p-8 shadow-xl">
          {/* Mode Toggle */}
          <div className="flex gap-2 mb-8 p-1 bg-[#F5F1E8] rounded-[16px]">
            <button
              onClick={() => setMode("login")}
              className={`flex-1 py-3 rounded-[12px] font-medium transition-all ${
                mode === "login"
                  ? "bg-white text-[#FF6B9D] shadow-md"
                  : "text-[#6B6B6B]"
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setMode("signup")}
              className={`flex-1 py-3 rounded-[12px] font-medium transition-all ${
                mode === "signup"
                  ? "bg-white text-[#FF6B9D] shadow-md"
                  : "text-[#6B6B6B]"
              }`}
            >
              Sign Up
            </button>
          </div>

          {step === "credentials" ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              <div className="relative">
                <Phone
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B6B6B]"
                  size={20}
                />
                <input
                  type="tel"
                  placeholder="Phone Number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-12 pr-6 py-4 rounded-[16px] border-2 border-gray-200 focus:border-[#FF6B9D] outline-none transition-all"
                />
              </div>

              <div className="relative">
                <Mail
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B6B6B]"
                  size={20}
                />
                <input
                  type="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-6 py-4 rounded-[16px] border-2 border-gray-200 focus:border-[#FF6B9D] outline-none transition-all"
                />
              </div>

              <Button onClick={handleSendOTP} className="w-full mt-6">
                Continue
              </Button>

              <p className="text-center text-sm text-[#6B6B6B] mt-4">
                By continuing, you agree to our{" "}
                <span className="text-[#FF6B9D]">Terms & Privacy</span>
              </p>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              <div className="text-center mb-6">
                <h3 className="text-2xl mb-2">Verify Your Number</h3>
                <p className="text-[#6B6B6B] text-sm">
                  We sent a code to {phone}
                </p>
              </div>

              <div className="flex justify-center gap-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <input
                    key={i}
                    type="text"
                    maxLength={1}
                    className="w-12 h-14 text-center text-xl font-bold rounded-[12px] border-2 border-gray-200 focus:border-[#FF6B9D] outline-none transition-all"
                  />
                ))}
              </div>

              <Button onClick={handleVerifyOTP} className="w-full mt-6">
                Verify & Continue
              </Button>

              <button
                onClick={() => setStep("credentials")}
                className="w-full text-center text-sm text-[#6B6B6B] mt-4"
              >
                Change number
              </button>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
