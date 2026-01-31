const { GoogleGenerativeAI } = require("@google/generative-ai");
const supabase = require("../services/supabaseClient");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

// Fallback routines when AI is unavailable
const FALLBACK_ROUTINES = {
  muscle_gain: {
    routineName: "Rutina de Fuerza - Push Day",
    difficulty: "intermediate",
    durationMinutes: 45,
    estimatedCalories: 350,
    exercises: [
      {
        name: "Press de Banca con Barra",
        sets: "4",
        reps: "8-10",
        restSeconds: 90,
        tips: "Mantén los pies firmes en el suelo y la espalda arqueada naturalmente",
        muscleGroups: ["pecho", "triceps"],
      },
      {
        name: "Press Militar con Mancuernas",
        sets: "3",
        reps: "10-12",
        restSeconds: 75,
        tips: "No arquees la espalda, mantén el core apretado",
        muscleGroups: ["hombros", "triceps"],
      },
      {
        name: "Aperturas con Mancuernas",
        sets: "3",
        reps: "12",
        restSeconds: 60,
        tips: "Baja lentamente y siente el estiramiento en el pecho",
        muscleGroups: ["pecho"],
      },
      {
        name: "Fondos en Paralelas",
        sets: "3",
        reps: "10",
        restSeconds: 75,
        tips: "Inclínate ligeramente hacia adelante para más pecho",
        muscleGroups: ["pecho", "triceps"],
      },
      {
        name: "Extensiones de Tríceps",
        sets: "3",
        reps: "12-15",
        restSeconds: 60,
        tips: "Mantén los codos fijos, solo mueve el antebrazo",
        muscleGroups: ["triceps"],
      },
    ],
    warmup: [
      "5 min cardio ligero",
      "Rotaciones de hombros",
      "Flexiones ligeras x10",
    ],
    cooldown: [
      "Estiramiento de pecho en pared",
      "Estiramiento de tríceps",
      "Respiración profunda",
    ],
    explanation:
      "Esta rutina tipo Push se enfoca en pecho, hombros y tríceps. Ideal para construir fuerza en la parte superior del cuerpo. Descansa 48h antes de repetir estos grupos musculares.",
  },
  weight_loss: {
    routineName: "Circuito Quema Grasa HIIT",
    difficulty: "intermediate",
    durationMinutes: 30,
    estimatedCalories: 400,
    exercises: [
      {
        name: "Burpees",
        sets: "3",
        reps: "10",
        restSeconds: 30,
        tips: "Explota en el salto, mantén ritmo constante",
        muscleGroups: ["full body"],
      },
      {
        name: "Mountain Climbers",
        sets: "3",
        reps: "20 cada pierna",
        restSeconds: 30,
        tips: "Mantén la cadera baja y el core apretado",
        muscleGroups: ["core", "cardio"],
      },
      {
        name: "Sentadillas con Salto",
        sets: "3",
        reps: "15",
        restSeconds: 30,
        tips: "Aterriza suavemente, rodillas alineadas con pies",
        muscleGroups: ["piernas", "glúteos"],
      },
      {
        name: "Plancha con Toques de Hombro",
        sets: "3",
        reps: "10 cada lado",
        restSeconds: 30,
        tips: "Evita rotar las caderas, mantén estabilidad",
        muscleGroups: ["core", "hombros"],
      },
      {
        name: "Jumping Jacks",
        sets: "3",
        reps: "30",
        restSeconds: 45,
        tips: "Mantén un ritmo explosivo y controlado",
        muscleGroups: ["cardio", "full body"],
      },
    ],
    warmup: [
      "3 min trote en sitio",
      "Rotación de caderas",
      "Estiramientos dinámicos",
    ],
    cooldown: [
      "Caminar 2 min",
      "Estiramiento de cuádriceps",
      "Estiramiento de isquiotibiales",
    ],
    explanation:
      "Este circuito HIIT maximiza la quema de calorías en poco tiempo. El entrenamiento por intervalos acelera tu metabolismo por horas después de terminar.",
  },
  maintenance: {
    routineName: "Rutina Full Body Equilibrada",
    difficulty: "beginner",
    durationMinutes: 40,
    estimatedCalories: 280,
    exercises: [
      {
        name: "Sentadillas",
        sets: "3",
        reps: "12",
        restSeconds: 60,
        tips: "Baja hasta que tus muslos estén paralelos al suelo",
        muscleGroups: ["piernas", "glúteos"],
      },
      {
        name: "Flexiones",
        sets: "3",
        reps: "10-12",
        restSeconds: 60,
        tips: "Cuerpo recto como una tabla, codos a 45 grados",
        muscleGroups: ["pecho", "triceps"],
      },
      {
        name: "Remo con Mancuernas",
        sets: "3",
        reps: "10 cada brazo",
        restSeconds: 60,
        tips: "Tira el codo hacia atrás, aprieta el omóplato",
        muscleGroups: ["espalda", "biceps"],
      },
      {
        name: "Plancha",
        sets: "3",
        reps: "30 segundos",
        restSeconds: 45,
        tips: "No dejes caer la cadera, mantén línea recta",
        muscleGroups: ["core"],
      },
      {
        name: "Peso Muerto Rumano",
        sets: "3",
        reps: "10",
        restSeconds: 60,
        tips: "Mantén la espalda recta, siente el estiramiento en isquios",
        muscleGroups: ["isquiotibiales", "glúteos"],
      },
    ],
    warmup: [
      "5 min cardio ligero",
      "Círculos de brazos",
      "Estocadas sin peso x10",
    ],
    cooldown: [
      "Estiramiento de piernas",
      "Estiramiento de espalda",
      "Respiración profunda 1 min",
    ],
    explanation:
      "Rutina equilibrada que trabaja todos los grupos musculares principales. Perfecta para mantener tu condición física y tonificar el cuerpo completo.",
  },
};

exports.generateRoutine = async (req, res) => {
  const startTime = Date.now();

  try {
    const { userProfile, goal, userId } = req.body;
    let routineData;

    try {
      // Try to generate with AI
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

      console.log(
        `[Gym] Generating routine for user: ${userId || "anonymous"}`,
      );

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

      routineData = JSON.parse(cleanText);
      console.log("[Gym] AI routine generated successfully");
    } catch (aiError) {
      // AI failed - use fallback routine
      console.log("[Gym] AI failed, using fallback routine:", aiError.message);

      const goalKey = goal || "maintenance";
      routineData = FALLBACK_ROUTINES[goalKey] || FALLBACK_ROUTINES.maintenance;
      routineData.isAIGenerated = false;
    }

    // Save to Supabase if userId is present
    if (userId) {
      const { data, error } = await supabase
        .from("routines")
        .insert({
          user_id: userId,
          name: routineData.routineName || "Rutina",
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
      } else if (data) {
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

    // Update total_workouts in profile
    await supabase.rpc("increment_workouts", { user_uuid: userId });

    res.json({ success: true, message: "Routine marked as completed" });
  } catch (error) {
    console.error("[Gym] Complete routine error:", error);
    res.status(500).json({
      error: "Failed to complete routine",
      requestId: req.requestId,
    });
  }
};

/**
 * Get predefined routines (no AI)
 */
exports.getFallbackRoutines = (req, res) => {
  res.json({
    routines: Object.entries(FALLBACK_ROUTINES).map(([goal, routine]) => ({
      goal,
      ...routine,
    })),
  });
};
