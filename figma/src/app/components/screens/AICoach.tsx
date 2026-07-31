import { motion } from "motion/react";
import { useState } from "react";
import { Send, Sparkles, Heart, Users, MessageCircle } from "lucide-react";
import { Card } from "../Card";

const suggestionChips = [
  "How should I start a conversation?",
  "What questions should I ask?",
  "When to involve my wali?",
  "Red flags to watch for",
];

const mockConversation = [
  {
    id: 1,
    sender: "ai",
    text: "Assalamu alaikum! I'm here to help guide you through your marriage journey. What questions do you have today?",
  },
  {
    id: 2,
    sender: "user",
    text: "I matched with someone but I'm not sure how to start the conversation.",
  },
  {
    id: 3,
    sender: "ai",
    text: "Great question! Here are some thoughtful conversation starters:\n\n1. Ask about their faith journey and what strengthens their connection with Allah\n2. Discuss family values and what family means to them\n3. Share your vision for marriage and ask about theirs\n\nRemember to keep it respectful and purposeful. Focus on understanding compatibility for marriage, not casual chat.",
  },
];

export function AICoach() {
  const [messages, setMessages] = useState(mockConversation);
  const [inputMessage, setInputMessage] = useState("");

  const handleSend = () => {
    if (inputMessage.trim()) {
      setMessages([
        ...messages,
        { id: messages.length + 1, sender: "user", text: inputMessage },
      ]);
      setInputMessage("");

      // Simulate AI response
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: prev.length + 1,
            sender: "ai",
            text: "That's a thoughtful question. Let me help you with that...",
          },
        ]);
      }, 1000);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputMessage(suggestion);
  };

  return (
    <div className="h-screen bg-gradient-to-br from-[#FFF8F0] to-white flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#FF6B9D] to-[#FF8A5C] px-6 py-8 text-white">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <Sparkles size={24} />
            </div>
            <div>
              <h1 className="text-2xl">AI Marriage Coach</h1>
              <p className="text-white/80 text-sm">Your guide to halal courtship</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Topics */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-2xl mx-auto">
          <p className="text-sm text-[#6B6B6B] mb-3">Quick topics:</p>
          <div className="flex gap-2 overflow-x-auto pb-2">
            <button className="px-4 py-2 bg-pink-50 text-[#FF6B9D] rounded-full text-sm whitespace-nowrap flex items-center gap-2 hover:bg-pink-100 transition-colors">
              <Heart size={14} />
              Communication
            </button>
            <button className="px-4 py-2 bg-orange-50 text-[#FF8A5C] rounded-full text-sm whitespace-nowrap flex items-center gap-2 hover:bg-orange-100 transition-colors">
              <Users size={14} />
              Family Involvement
            </button>
            <button className="px-4 py-2 bg-purple-50 text-purple-600 rounded-full text-sm whitespace-nowrap flex items-center gap-2 hover:bg-purple-100 transition-colors">
              <MessageCircle size={14} />
              First Meeting
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="max-w-2xl mx-auto space-y-6">
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.sender === "ai" && (
                <div className="w-10 h-10 bg-gradient-to-br from-[#FF6B9D] to-[#FF8A5C] rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                  <Sparkles className="text-white" size={18} />
                </div>
              )}
              <div
                className={`max-w-[75%] ${
                  msg.sender === "user"
                    ? "bg-gradient-to-r from-[#FF6B9D] to-[#FF8A5C] text-white"
                    : "bg-white border border-gray-200 text-[#1A1A1A]"
                } rounded-[20px] px-5 py-4 shadow-sm`}
              >
                <p className="text-sm leading-relaxed whitespace-pre-line">
                  {msg.text}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Suggestions */}
      {messages.length <= 3 && (
        <div className="px-6 pb-4">
          <div className="max-w-2xl mx-auto">
            <p className="text-sm text-[#6B6B6B] mb-3">Suggested questions:</p>
            <div className="grid grid-cols-2 gap-2">
              {suggestionChips.map((suggestion) => (
                <Card
                  key={suggestion}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="cursor-pointer p-3 text-sm text-[#6B6B6B] hover:border-[#FF6B9D] border-2 border-transparent transition-all"
                >
                  {suggestion}
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Input */}
      <div className="bg-white border-t border-gray-200 px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask me anything about your marriage journey..."
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
