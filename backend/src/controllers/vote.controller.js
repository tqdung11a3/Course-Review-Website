const ReviewVote = require("../models/ReviewVote");
const Review = require("../models/Review");
const { success, fail } = require("../utils/response");

exports.upsertVote = async (req, res) => {
  const { voteType } = req.body;
  if (!["helpful", "not_helpful"].includes(voteType)) {
    return fail(res, { message: "Invalid voteType", status: 400 });
  }

  const review = await Review.findById(req.params.id);
  if (!review) return fail(res, { message: "Review not found", status: 404 });
  if (String(review.userId) === String(req.user._id)) {
    return fail(res, { message: "You cannot vote on your own review", status: 400 });
  }

  const existing = await ReviewVote.findOne({
    userId: req.user._id,
    reviewId: review._id,
  });

  const inc = { helpfulCount: 0, notHelpfulCount: 0 };

  if (!existing) {
    await ReviewVote.create({ userId: req.user._id, reviewId: review._id, voteType });
    if (voteType === "helpful") inc.helpfulCount = 1;
    else inc.notHelpfulCount = 1;
  } else if (existing.voteType !== voteType) {
    if (existing.voteType === "helpful") {
      inc.helpfulCount = -1;
      inc.notHelpfulCount = 1;
    } else {
      inc.helpfulCount = 1;
      inc.notHelpfulCount = -1;
    }
    existing.voteType = voteType;
    await existing.save();
  }

  if (inc.helpfulCount || inc.notHelpfulCount) {
    await Review.updateOne(
      { _id: review._id },
      {
        $inc: {
          helpfulCount: inc.helpfulCount,
          notHelpfulCount: inc.notHelpfulCount,
        },
      }
    );
  }

  const updated = await Review.findById(review._id).select("helpfulCount notHelpfulCount");
  return success(res, { message: "Vote recorded", data: { vote: { voteType }, review: updated } });
};

exports.removeVote = async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) return fail(res, { message: "Review not found", status: 404 });

  const existing = await ReviewVote.findOneAndDelete({
    userId: req.user._id,
    reviewId: review._id,
  });

  if (!existing) {
    return success(res, { message: "No vote to remove", data: {} });
  }

  const inc =
    existing.voteType === "helpful"
      ? { helpfulCount: -1 }
      : { notHelpfulCount: -1 };

  await Review.updateOne({ _id: review._id }, { $inc: inc });
  return success(res, { message: "Vote removed", data: {} });
};
