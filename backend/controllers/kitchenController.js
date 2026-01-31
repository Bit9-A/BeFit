const geminiService = require("../services/geminiService");
const fs = require("fs");
const supabase = require("../services/supabaseClient");

exports.analyzeFridge = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image provided" });
    }

    // Mock user context if not provided (for MVP)
    const userContext = req.body.userContext
      ? JSON.parse(req.body.userContext)
      : {
          objetivo: "comer sano",
        };

    // Multer handles form-data, so userId is available in req.body
    const userId = req.body.userId; // Expect userId in formData

    const result = await geminiService.analyzeFridge(
      req.file.path,
      userContext,
    );

    // Save to Supabase
    if (userId && result.receta) {
      const { calorias, macros, nombre } = result.receta;
      const { error } = await supabase.from("nutrition_logs").insert({
        user_id: userId,
        meal_name: nombre,
        calories: Number(calorias),
        macros: macros,
        ai_analysis: result.explicacion_xai,
      });
      if (error) console.error("Supabase Error (Nutrition):", error.message);
    }

    // Cleanup uploaded file
    fs.unlinkSync(req.file.path);

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to analyze fridge" });
  }
};
