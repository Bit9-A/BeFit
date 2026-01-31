const supabase = require("../services/supabaseClient");

/**
 * Add XP to user and handle level up
 * @route POST /api/gamification/xp
 */
exports.addXP = async (req, res) => {
  try {
    const { userId, amount, action } = req.body;

    if (!userId || !amount) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Get current profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("xp, level, current_streak, last_active_at")
      .eq("id", userId)
      .single();

    if (profileError) throw profileError;

    let { xp, level, current_streak, last_active_at } = profile;
    let newXP = xp + amount;
    let leveledUp = false;

    // Level calculation: Base 100 * Level
    // Simple formula: XP needed for next level = Level * 100
    // Total XP for Level L = 50 * L * (L-1) approx.
    // Let's use a simple linear-ish scaling: Level = floor(sqrt(XP/100)) + 1 or just XP threshold.
    // Let's stick to: Threshold = Level * 500.
    const xpThreshold = level * 100 * 2.5; // Example: Level 1 -> 250 XP

    // Better Formula: Level = Math.floor(0.1 * Math.sqrt(XP)) + 1
    // Reverse: XP = 100 * (Level - 1)^2

    // Let's look for level up
    // XP Needed for Level N = 100 * (N-1)^2
    // If newXP >= 100 * (level)^2 -> Level Up

    // Check if newXP triggers level up
    const nextLevelThreshold = 100 * Math.pow(level, 2);

    if (newXP >= nextLevelThreshold) {
      level++;
      leveledUp = true;
    }

    // Streak Logic
    const now = new Date();
    const lastActive = new Date(last_active_at);

    // Check if last active was yesterday
    // (This is a simplified check, ideally use timezone aware finish of day)
    const diffTime = Math.abs(now - lastActive);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // If active today, do nothing. If active yesterday, streak++. Else streak=1.
    const isSameDay = now.toDateString() === lastActive.toDateString();

    // Check if it was yesterday
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const isYesterday = yesterday.toDateString() === lastActive.toDateString();

    if (!isSameDay) {
      if (isYesterday) {
        current_streak++;
      } else {
        current_streak = 1;
      }
    }

    // Update Profile
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        xp: newXP,
        level,
        current_streak,
        last_active_at: now.toISOString(),
      })
      .eq("id", userId);

    if (updateError) throw updateError;

    res.json({
      success: true,
      xp: newXP,
      level,
      current_streak,
      leveledUp,
      xpAdded: amount,
    });
  } catch (error) {
    console.error("[Gamification] Add XP Error:", error);
    res.status(500).json({ error: "Failed to add XP" });
  }
};

/**
 * Get User Gamification Profile
 * @route GET /api/gamification/profile/:userId
 */
exports.getGamificationProfile = async (req, res) => {
  try {
    const { userId } = req.params;

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("xp, level, current_streak, full_name")
      .eq("id", userId)
      .single();

    if (error) throw error;

    // Calculate XP progress to next level
    // Current Level Start XP: 100 * (L-1)^2
    // Next Level Start XP: 100 * L^2
    const currentLevelStartXp = 100 * Math.pow(profile.level - 1, 2);
    const nextLevelStartXp = 100 * Math.pow(profile.level, 2);

    const progress = profile.xp - currentLevelStartXp;
    const totalNeeded = nextLevelStartXp - currentLevelStartXp;
    const percent = Math.min(100, Math.max(0, (progress / totalNeeded) * 100));

    res.json({
      ...profile,
      nextLevelXp: nextLevelStartXp,
      progressPercent: percent,
    });
  } catch (error) {
    console.error("[Gamification] Get Profile Error:", error);
    res.status(500).json({ error: "Failed to get gamification profile" });
  }
};
