const { GoogleGenerativeAI } = require("@google/generative-ai");
const supabase = require("../services/supabaseClient");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

exports.generateRoutine = async (req, res) => {
  const startTime = Date.now();

  try {
    const { userProfile, goal, userId } = req.body;

    // Build detailed prompt
    const prompt = `
      Eres un entrenador personal certificado con 15 años de experiencia.
      
      Perfil del usuario:
      - Altura: ${userProfile.height || "no especificada"} cm
      - Género: ${userProfile.gender || "no especificado"}
      - Nivel de actividad: ${userProfile.activityLevel || "moderado"}
      - Objetivo: ${goal}
      
      Genera una rutina de ejercicios personalizada para HOY.
      
      IMPORTANTE:
      - Incluye calentamiento y enfriamiento
      - Adapta la dificultad al nivel del usuario
      - Proporciona tips de técnica para prevenir lesiones
      - Explica brevemente por qué esta rutina es ideal para el usuario
      
      Responde SOLO con JSON válido (sin markdown):
      {
        "routineName": "Nombre descriptivo de la rutina",
        "difficulty": "beginner|intermediate|advanced",
        "durationMinutes": 45,
        "estimatedCalories": 300,
        "exercises": [
          {
            "name": "Nombre del ejercicio",
            "sets": "3",
            "reps": "12",
            "restSeconds": 60,
            "tips": "Consejo técnico importante",
            "muscleGroups": ["pecho", "triceps"]
          }
        ],
        "warmup": ["Ejercicio de calentamiento 1", "Ejercicio 2"],
        "cooldown": ["Estiramiento 1", "Estiramiento 2"],
        "explanation": "Explicación breve (máximo 100 palabras) de por qué esta rutina es perfecta para el usuario"
      }
    `;

    console.log(`[Gym] Generating routine for user: ${userId || "anonymous"}`);

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.7,
        maxOutputTokens: 2048,
      },
    });

    const text = result.response.text();
    console.log("[Gym] Raw response length:", text.length);

    // Parse JSON response
    let cleanText = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const jsonStart = cleanText.indexOf("{");
    const jsonEnd = cleanText.lastIndexOf("}");
    if (jsonStart !== -1 && jsonEnd !== -1) {
      cleanText = cleanText.substring(jsonStart, jsonEnd + 1);
    }

    const routineData = JSON.parse(cleanText);

    // Save to Supabase if userId is present
    if (userId) {
      const { data, error } = await supabase
        .from("routines")
        .insert({
          user_id: userId,
          name: routineData.routineName || "Rutina IA",
          description: `Dificultad: ${routineData.difficulty}, Duración: ${routineData.durationMinutes} min`,
          ai_explanation: routineData.explanation,
          plan_data: routineData,
          difficulty: routineData.difficulty,
          duration_minutes: routineData.durationMinutes,
          calories_burned: routineData.estimatedCalories,
          scheduled_date: new Date().toISOString().split("T")[0],
        })
        .select()
        .single();

      if (error) {
        console.error("[Gym] Supabase save error:", error.message);
      } else {
        routineData.id = data.id;
        console.log("[Gym] Saved routine with ID:", data.id);
      }
    }

    const duration = Date.now() - startTime;
    console.log(`[Gym] Generated routine in ${duration}ms`);

    res.json(routineData);
  } catch (error) {
    console.error("[Gym] Error:", error);

    // Handle rate limit errors specifically
    if (error.status === 429) {
      return res.status(429).json({
        error: "Límite de solicitudes excedido",
        message:
          "Has alcanzado el límite de la API de IA. Por favor espera unos minutos e intenta de nuevo.",
        retryAfter: 60,
        requestId: req.requestId,
      });
    }

    res.status(500).json({
      error: "Failed to generate routine",
      message:
        process.env.NODE_ENV === "development"
          ? error.message
          : "An error occurred",
      requestId: req.requestId,
    });
  }
};

/**
 * Mark a routine as completed
 */
exports.completeRoutine = async (req, res) => {
  try {
    const { routineId, userId } = req.body;

    if (!routineId || !userId) {
      return res.status(400).json({
        error: "Missing required fields",
        message: "routineId and userId are required",
      });
    }

    const { error } = await supabase
      .from("routines")
      .update({
        is_completed: true,
        completed_at: new Date().toISOString(),
      })
      .eq("id", routineId)
      .eq("user_id", userId);

    if (error) {
      throw error;
    }

    res.json({ success: true, message: "Routine marked as completed" });
  } catch (error) {
    console.error("[Gym] Complete routine error:", error);
    res.status(500).json({
      error: "Failed to complete routine",
      requestId: req.requestId,
    });
  }
};
