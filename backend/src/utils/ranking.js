/**
 * Score for recommended reviews (0–1 scale components).
 * score = profileMatch * 0.4 + helpful * 0.3 + evidence * 0.2 + recency * 0.1
 */

function profileMatchScore(review, query) {
  const lp = review.learnerProfile || {};
  const keys = [
    "selfRatedLevel",
    "targetGrade",
    "learningStyle",
    "workloadTolerance",
    "studyOrientation",
  ];
  let matches = 0;
  let compared = 0;
  for (const k of keys) {
    const q = query[k];
    if (!q) continue;
    compared += 1;
    if (String(lp[k] || "").toLowerCase() === String(q).toLowerCase()) {
      matches += 1;
    }
  }
  if (compared === 0) return 0.5;
  return matches / compared;
}

function helpfulScore(review, maxHelpful) {
  const h = Number(review.helpfulCount || 0);
  if (!maxHelpful || maxHelpful <= 0) return h > 0 ? 1 : 0;
  return Math.min(1, h / maxHelpful);
}

function evidenceScore(review) {
  const n = Array.isArray(review.evidenceFiles) ? review.evidenceFiles.length : 0;
  return n > 0 ? 1 : 0;
}

function recencyScore(createdAt, newest, oldest) {
  const t = new Date(createdAt).getTime();
  const tn = new Date(newest).getTime();
  const to = new Date(oldest).getTime();
  if (tn === to) return 1;
  return (t - to) / (tn - to);
}

function rankReviews(reviews, query) {
  if (!reviews.length) return [];
  const maxHelpful = Math.max(...reviews.map((r) => Number(r.helpfulCount || 0)), 1);
  const dates = reviews.map((r) => new Date(r.createdAt).getTime());
  const newest = new Date(Math.max(...dates));
  const oldest = new Date(Math.min(...dates));

  return reviews
    .map((r) => {
      const plain = typeof r.toObject === "function" ? r.toObject() : { ...r };
      const pm = profileMatchScore(plain, query);
      const hs = helpfulScore(plain, maxHelpful);
      const es = evidenceScore(plain);
      const rs = recencyScore(plain.createdAt, newest, oldest);
      const score = pm * 0.4 + hs * 0.3 + es * 0.2 + rs * 0.1;
      return { ...plain, _rankScore: score };
    })
    .sort((a, b) => b._rankScore - a._rankScore);
}

module.exports = {
  profileMatchScore,
  helpfulScore,
  evidenceScore,
  recencyScore,
  rankReviews,
};
