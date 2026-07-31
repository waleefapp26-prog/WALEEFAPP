import { motion } from "motion/react";
import { useState } from "react";
import { Send, Lock, Users, Shield, MoreVertical } from "lucide-react";
import { Card } from "../Card";
import { Button } from "../Button";

const mockMessages = [
  {
    id: 1,
    sender: "them",
    text: "Assalamu alaikum! Thank you for expressing interest. I'd love to learn more about you.",
    timestamp: "10:30 AM",
  },
  {
    id: 2,
    sender: "me",
    text: "Wa alaikum assalam! I'm glad we matched. What made you interested in connecting?",
    timestamp: "10:35 AM",
  },
  {
    id: 3,
    sender: "them",
    text: "I really appreciated your approach to balancing career and faith. It's important to me too.",
    timestamp: "10:38 AM",
  },
  {
    id: 4,
    sender: "me",
    text: "That's wonderful! May I ask about your vision for family life?",
    timestamp: "10:42 AM",
  },
];

export function Chat() {
  const [message, setMessage] = useState("");
  const [waliInvolved, setWaliInvolved] = useState(false);

  const handleSend = () => {
    if (message.trim()) {
      // Handle send
      setMessage("");
    }
  };

  return (
    <div className="h-screen bg-gradient-to-br from-[#FFF8F0] to-white flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-300 to-orange-300 flex items-center justify-center text-white text-lg">
              S
            </div>
            <div>
              <h3 className="font-medium">Sarah</h3>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span className="text-xs text-[#6B6B6B]">Online</span>
              </div>
            </div>
          </div>
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <MoreVertical size={20} />
          </button>
        </div>
      </div>

      {/* Privacy Notice */}
      {!waliInvolved && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-50 to-cyan-50 border-b border-blue-100"
        >
          <div className="max-w-2xl mx-auto px-6 py-4 flex items-start gap-3">
            <Shield className="text-blue-600 mt-1 flex-shrink-0" size={20} />
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-900">
                Respectful Communication
              </p>
              <p className="text-xs text-blue-700 mt-1">
                Keep conversations halal and respectful. You can involve your wali
                anytime.
              </p>
            </div>
            <Button
              variant="outline"
              className="text-xs py-2 px-4 border-blue-600 text-blue-600"
              onClick={() => setWaliInvolved(true)}
            >
              Involve Wali
            </Button>
          </div>
        </motion.div>
      )}

      {waliInvolved && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100"
        >
          <div className="max-w-2xl mx-auto px-6 py-3 flex items-center gap-3">
            <Users className="text-green-600" size={20} />
            <p className="text-sm text-green-900">
              Your guardian has been added to this conversation
            </p>
          </div>
        </motion.div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="max-w-2xl mx-auto space-y-4">
          {mockMessages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.sender === "me" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[70%] ${
                  msg.sender === "me"
                    ? "bg-gradient-to-r from-[#FF6B9D] to-[#FF8A5C] text-white"
                    : "bg-white border border-gray-200 text-[#1A1A1A]"
                } rounded-[16px] px-4 py-3 shadow-sm`}
              >
                <p className="text-sm leading-relaxed">{msg.text}</p>
                <p
                  className={`text-xs mt-1 ${
                    msg.sender === "me" ? "text-white/70" : "text-[#6B6B6B]"
                  }`}
                >
                  {msg.timestamp}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
            placeholder="Type your message..."
            className="flex-1 px-6 py-3 rounded-full border-2 border-gray-200 focus:border-[#FF6B9D] outline-none transition-all"
          />
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleSend}
            className="w-12 h-12 rounded-full bg-gradient-to-r from-[#FF6B9D] to-[#FF8A5C] flex items-center justify-center shadow-lg"
          >
            <Send className="text-white" size={20} />
          </motion.button>
        </div>
      </div>
    </div>
  );
}
