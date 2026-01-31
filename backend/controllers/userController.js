const supabase = require("../services/supabaseClient");

/**
 * Calculate and save user health metrics
 */
exports.calculateMetrics = async (req, res) => {
  try {
    const { weight, height, age, gender, activityLevel, userId } = req.body;

    // Calculate BMI
    const heightInMeters = height / 100;
    const bmi = parseFloat(
      (weight / (heightInMeters * heightInMeters)).toFixed(2),
    );

    // Determine BMI category
    let bmiCategory;
    if (bmi < 18.5) {
      bmiCategory = "Bajo peso";
    } else if (bmi < 25) {
      bmiCategory = "Normal";
    } else if (bmi < 30) {
      bmiCategory = "Sobrepeso";
    } else {
      bmiCategory = "Obesidad";
    }

    // Calculate TMB (Mifflin-St Jeor equation)
    let tmb;
    if (gender === "male") {
      tmb = 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
      tmb = 10 * weight + 6.25 * height - 5 * age - 161;
    }
    tmb = Math.round(tmb);

    // Calculate TDEE based on activity level
    const activityMultipliers = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      very_active: 1.9,
    };
    const multiplier = activityMultipliers[activityLevel] || 1.55;
    const tdee = Math.round(tmb * multiplier);

    // Calculate macros based on goal
    const goal = req.body.goal || "maintenance";
    let macros = { protein: 0, carbs: 0, fats: 0 };
    let calorieGoal = tdee;

    switch (goal) {
      case "muscle_gain":
        calorieGoal = tdee + 300; // Surplus
        macros = {
          protein: Math.round((calorieGoal * 0.3) / 4), // 30% protein
          carbs: Math.round((calorieGoal * 0.45) / 4), // 45% carbs
          fats: Math.round((calorieGoal * 0.25) / 9), // 25% fats
        };
        break;
      case "weight_loss":
        calorieGoal = tdee - 500; // Deficit
        macros = {
          protein: Math.round((calorieGoal * 0.35) / 4), // Higher protein for preservation
          carbs: Math.round((calorieGoal * 0.35) / 4),
          fats: Math.round((calorieGoal * 0.3) / 9),
        };
        break;
      default:
        macros = {
          protein: Math.round((calorieGoal * 0.25) / 4),
          carbs: Math.round((calorieGoal * 0.5) / 4),
          fats: Math.round((calorieGoal * 0.25) / 9),
        };
    }

    // Prepare response
    const metrics = {
      bmi: bmi.toString(),
      status: bmiCategory,
      tmb,
      tdee,
      calorieGoal,
      macros,
      explanation: `Tu IMC de ${bmi} indica ${bmiCategory.toLowerCase()}. Tu metabolismo basal es ${tmb} kcal/día, y con tu nivel de actividad necesitas aproximadamente ${tdee} kcal diarias. Para tu objetivo de ${goal === "muscle_gain" ? "ganar músculo" : goal === "weight_loss" ? "perder peso" : "mantenimiento"}, recomendamos ${calorieGoal} kcal/día.`,
    };

    // Save to Supabase if userId is present
    if (userId) {
      const { error } = await supabase.from("measurements").insert({
        user_id: userId,
        weight,
        bmi,
        tmb,
        tdee,
        recorded_at: new Date().toISOString(),
      });

      if (error) {
        console.error("[Metrics] Supabase save error:", error.message);
      } else {
        console.log(`[Metrics] Saved metrics for user: ${userId}`);
      }

      // Update last_active_at in profile
      await supabase
        .from("profiles")
        .update({ last_active_at: new Date().toISOString() })
        .eq("id", userId);
    }

    res.json(metrics);
  } catch (error) {
    console.error("[Metrics] Error:", error);
    res.status(500).json({
      error: "Failed to calculate metrics",
      message:
        process.env.NODE_ENV === "development"
          ? error.message
          : "An error occurred",
      requestId: req.requestId,
    });
  }
};

/**
 * Get user's metric history
 */
exports.getMetricsHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 30 } = req.query;

    const { data, error } = await supabase
      .from("measurements")
      .select("*")
      .eq("user_id", userId)
      .order("recorded_at", { ascending: false })
      .limit(parseInt(limit));

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      count: data.length,
      measurements: data,
    });
  } catch (error) {
    console.error("[Metrics] Get history error:", error);
    res.status(500).json({
      error: "Failed to get metrics history",
      requestId: req.requestId,
    });
  }
};

/**
 * Record a new weight entry
 */
exports.recordWeight = async (req, res) => {
  try {
    const { userId, weight, notes } = req.body;

    if (!userId || !weight) {
      return res.status(400).json({
        error: "Missing required fields",
        message: "userId and weight are required",
      });
    }

    const { data, error } = await supabase
      .from("measurements")
      .insert({
        user_id: userId,
        weight,
        notes,
        recorded_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      measurement: data,
    });
  } catch (error) {
    console.error("[Metrics] Record weight error:", error);
    res.status(500).json({
      error: "Failed to record weight",
      requestId: req.requestId,
    });
  }
};
