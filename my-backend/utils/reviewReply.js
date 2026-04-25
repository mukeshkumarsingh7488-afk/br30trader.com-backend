//#region ━━━━━ 🚀 WELCOME DEVELOPER | SYSTEM INITIALIZED ━━━━━
function generateSmartReply({
  username = "",
  rating,
  comment,
  customReply = "",
}) {
  const text = comment.toLowerCase(); // ✅ yaha fix

  const positiveWords = [
    "good",
    "great",
    "best",
    "amazing",
    "love",
    "excellent",
  ];

  const negativeWords = ["bad", "worst", "scam", "poor", "refund", "not good"];

  const isNegative = negativeWords.some((w) => text.includes(w));
  const userName = username ? ` ${username}` : ""; // ✅ yaha fix

  // 🔥 1. CUSTOM REPLY (highest priority)
  if (customReply && customReply.trim() !== "") {
    return customReply;
  }

  if (rating >= 4 && !isNegative) {
    const replies = [
      `Thank you${userName}! 🙏 We're glad you loved the experience. 🚀`,
      `Appreciate your feedback${userName}! 😊`,
      `Thanks a lot${userName}! Your support means everything 💯`,
    ];
    return replies[Math.floor(Math.random() * replies.length)];
  }

  if (rating === 3 && !isNegative) {
    return `Thank you${userName}! 🙏 We’re working to improve your experience.`;
  }

  // 🔥 4. NEGATIVE AUTO REPLY (NEW 🔥)
  if (isNegative || rating <= 2) {
    const replies = [
      `Sorry for the experience${userName}. 🙏 Please contact support, we’ll fix this ASAP.`,
      `We apologize${userName}. 😔 Your issue is important to us.`,
      `Thanks for your feedback${userName}. We’ll improve this soon.`,
    ];
    return replies[Math.floor(Math.random() * replies.length)];
  }

  return null; // negative = manual
}

module.exports = { generateSmartReply };
//#endregion
// ==========================================================================
// ✅ ENGAGEMENT STATUS: REVIEW REPLY SYSTEM ORGANIZED & TESTED.
// 💬 FEEDBACK: INTERACTIVE RESPONSE LOGIC READY.
// 🚀 DEPLOYMENT: READY FOR PRODUCTION INTERACTION!
// ==========================================================================
