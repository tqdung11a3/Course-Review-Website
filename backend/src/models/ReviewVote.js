const mongoose = require("mongoose");

const VOTE_TYPES = ["helpful", "not_helpful"];

const reviewVoteSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    reviewId: { type: mongoose.Schema.Types.ObjectId, ref: "Review", required: true },
    voteType: { type: String, enum: VOTE_TYPES, required: true },
  },
  { timestamps: true }
);

reviewVoteSchema.index({ userId: 1, reviewId: 1 }, { unique: true });
reviewVoteSchema.index({ reviewId: 1 });

module.exports = mongoose.model("ReviewVote", reviewVoteSchema);
module.exports.VOTE_TYPES = VOTE_TYPES;
