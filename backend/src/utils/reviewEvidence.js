function mergeEvidenceFiles(review, proof) {
  const seen = new Set();
  const merged = [];

  for (const f of [...(review?.evidenceFiles || []), ...(proof?.proofFiles || [])]) {
    if (!f?.fileUrl || seen.has(f.fileUrl)) continue;
    seen.add(f.fileUrl);
    merged.push(f);
  }

  return merged;
}

module.exports = { mergeEvidenceFiles };
