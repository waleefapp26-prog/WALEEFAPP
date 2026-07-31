import { motion } from "motion/react";
import { CheckCircle, XCircle, Clock, Eye } from "lucide-react";
import { Card } from "../Card";
import { Button } from "../Button";
import { MatchPercentage } from "../MatchPercentage";

const pendingMatches = [
  {
    id: 1,
    name: "Sarah",
    age: 26,
    location: "New York, USA",
    matchPercentage: 87,
    requestedDate: "April 12, 2026",
    notes: "Strong religious values, compatible career goals",
  },
  {
    id: 2,
    name: "Amira",
    age: 24,
    location: "London, UK",
    matchPercentage: 92,
    requestedDate: "April 13, 2026",
    notes: "Excellent match, shared interests in community work",
  },
];

const reviewedMatches = [
  {
    id: 3,
    name: "Zainab",
    age: 28,
    location: "Dubai, UAE",
    matchPercentage: 78,
    status: "approved",
    reviewedDate: "April 10, 2026",
  },
  {
    id: 4,
    name: "Fatima",
    age: 25,
    location: "Toronto, Canada",
    matchPercentage: 65,
    status: "declined",
    reviewedDate: "April 8, 2026",
    reason: "Different lifestyle preferences",
  },
];

export function FamilyPanel() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF8F0] to-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl mb-2">Guardian Dashboard</h1>
          <p className="text-[#6B6B6B]">
            Review and approve matches for your family member
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card variant="info">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#6B6B6B]">Pending Review</p>
                <p className="text-3xl font-bold text-[#FF8A5C] mt-1">
                  {pendingMatches.length}
                </p>
              </div>
              <Clock className="text-[#FF8A5C]" size={32} />
            </div>
          </Card>
          <Card variant="info">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#6B6B6B]">Approved</p>
                <p className="text-3xl font-bold text-green-600 mt-1">
                  {reviewedMatches.filter((m) => m.status === "approved").length}
                </p>
              </div>
              <CheckCircle className="text-green-600" size={32} />
            </div>
          </Card>
          <Card variant="info">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#6B6B6B]">Total Reviews</p>
                <p className="text-3xl font-bold text-[#6B6B6B] mt-1">
                  {reviewedMatches.length}
                </p>
              </div>
              <Eye className="text-[#6B6B6B]" size={32} />
            </div>
          </Card>
        </div>

        {/* Pending Matches */}
        <div className="mb-12">
          <h2 className="text-2xl mb-6">Pending Approvals</h2>
          <div className="space-y-4">
            {pendingMatches.map((match) => (
              <motion.div
                key={match.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card variant="profile">
                  <div className="flex items-start gap-6">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-pink-300 to-orange-300 flex items-center justify-center text-white text-2xl flex-shrink-0">
                      {match.name[0]}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-xl font-medium">
                            {match.name}, {match.age}
                          </h3>
                          <p className="text-sm text-[#6B6B6B]">
                            {match.location}
                          </p>
                          <p className="text-xs text-[#6B6B6B] mt-1">
                            Requested on {match.requestedDate}
                          </p>
                        </div>
                        <MatchPercentage
                          percentage={match.matchPercentage}
                          size="sm"
                        />
                      </div>
                      <p className="text-sm text-[#6B6B6B] mb-4">
                        {match.notes}
                      </p>
                      <div className="flex gap-3">
                        <Button className="flex-1 flex items-center justify-center gap-2">
                          <CheckCircle size={18} />
                          Approve Match
                        </Button>
                        <Button
                          variant="outline"
                          className="flex-1 flex items-center justify-center gap-2"
                        >
                          <Eye size={18} />
                          View Full Profile
                        </Button>
                        <Button
                          variant="secondary"
                          className="flex items-center justify-center gap-2 px-6"
                        >
                          <XCircle size={18} />
                          Decline
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Reviewed Matches */}
        <div>
          <h2 className="text-2xl mb-6">Review History</h2>
          <div className="space-y-3">
            {reviewedMatches.map((match) => (
              <Card key={match.id}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-200 to-orange-200 flex items-center justify-center text-white">
                      {match.name[0]}
                    </div>
                    <div>
                      <p className="font-medium">
                        {match.name}, {match.age}
                      </p>
                      <p className="text-sm text-[#6B6B6B]">
                        Reviewed on {match.reviewedDate}
                      </p>
                      {match.status === "declined" && match.reason && (
                        <p className="text-xs text-[#6B6B6B] mt-1">
                          Reason: {match.reason}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium text-[#6B6B6B]">
                      {match.matchPercentage}% Match
                    </span>
                    {match.status === "approved" ? (
                      <div className="px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-medium flex items-center gap-2">
                        <CheckCircle size={16} />
                        Approved
                      </div>
                    ) : (
                      <div className="px-4 py-2 bg-red-100 text-red-700 rounded-full text-sm font-medium flex items-center gap-2">
                        <XCircle size={16} />
                        Declined
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
