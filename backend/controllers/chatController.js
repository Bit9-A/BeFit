const geminiService = require("../services/geminiService");
const supabase = require("../services/supabaseClient");

/**
 * AI Chat with Adlerian therapist
 */
exports.chat = async (req, res) => {
  const startTime = Date.now();

  try {
    const { message, history = [], userId, sessionId } = req.body;

    console.log(`[Chat] Processing message for user: ${userId || "anonymous"}`);

    // Get AI response - use chatTherapist with correct parameter order (history, message)
    const result = await geminiService.chatTherapist(history, message);
    const aiResponse = result.response;

    // Save to Supabase if userId is present
    if (userId) {
      const currentSessionId = sessionId || `session_${Date.now()}`;

      // Save user message
      const { error: userMsgError } = await supabase
        .from("mental_journal")
        .insert({
          user_id: userId,
          session_id: currentSessionId,
          message_type: "user",
          content: message,
          created_at: new Date().toISOString(),
        });

      if (userMsgError) {
        console.error(
          "[Chat] Error saving user message:",
          userMsgError.message,
        );
      }

      // Save AI response
      const { error: aiMsgError } = await supabase
        .from("mental_journal")
        .insert({
          user_id: userId,
          session_id: currentSessionId,
          message_type: "assistant",
          content: aiResponse,
          created_at: new Date().toISOString(),
        });

      if (aiMsgError) {
        console.error("[Chat] Error saving AI response:", aiMsgError.message);
      }

      // Update last_active_at in profile
      await supabase
        .from("profiles")
        .update({ last_active_at: new Date().toISOString() })
        .eq("id", userId);

      console.log(`[Chat] Saved conversation for session: ${currentSessionId}`);
    }

    const duration = Date.now() - startTime;
    console.log(`[Chat] Response generated in ${duration}ms`);

    res.json({
      response: aiResponse,
      sessionId: sessionId || `session_${Date.now()}`,
    });
  } catch (error) {
    console.error("[Chat] Error:", error);
    res.status(500).json({
      error: "Failed to process chat message",
      message:
        process.env.NODE_ENV === "development"
          ? error.message
          : "An error occurred",
      requestId: req.requestId,
    });
  }
};

/**
 * Get chat history for a user
 */
exports.getChatHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    const { sessionId, limit = 50 } = req.query;

    let query = supabase
      .from("mental_journal")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: true })
      .limit(parseInt(limit));

    if (sessionId) {
      query = query.eq("session_id", sessionId);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    // Group by session
    const sessions = {};
    data.forEach((msg) => {
      if (!sessions[msg.session_id]) {
        sessions[msg.session_id] = [];
      }
      sessions[msg.session_id].push({
        role: msg.message_type,
        content: msg.content,
        timestamp: msg.created_at,
      });
    });

    res.json({
      success: true,
      count: data.length,
      sessions,
    });
  } catch (error) {
    console.error("[Chat] Get history error:", error);
    res.status(500).json({
      error: "Failed to get chat history",
      requestId: req.requestId,
    });
  }
};

/**
 * Get list of chat sessions
 */
exports.getSessions = async (req, res) => {
  try {
    const { userId } = req.params;

    const { data, error } = await supabase
      .from("mental_journal")
      .select("session_id, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    // Get unique sessions with first message timestamp
    const uniqueSessions = [
      ...new Map(data.map((item) => [item.session_id, item])).values(),
    ];

    res.json({
      success: true,
      count: uniqueSessions.length,
      sessions: uniqueSessions,
    });
  } catch (error) {
    console.error("[Chat] Get sessions error:", error);
    res.status(500).json({
      error: "Failed to get sessions",
      requestId: req.requestId,
    });
  }
};
