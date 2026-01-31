const geminiService = require("../services/geminiService");

exports.getDailyFeed = async (req, res) => {
  try {
    const { mood, userId } = req.body; // mood can be 'anxious', 'lazy', 'happy', etc.

    const userContext = {
      mood: mood || "neutral",
      userId: userId,
    };

    const feed = await geminiService.getDailyWellnessFeed(userContext);

    // Optional: Save generated feed to DB to avoid re-generating on each refresh (cache)
    // For MVP, dynamic generation on load is fine.

    res.json(feed);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to generate wellness feed" });
  }
};
