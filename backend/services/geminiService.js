const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require("fs");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const modelFlash = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

exports.analyzeFridge = async (imagePath, userContext) => {
  try {
    const prompt = `
      Analiza esta imagen de una nevera (o despensa).
      1. Identifica los ingredientes visibles.
      2. Teniendo en cuenta este perfil de usuario: ${JSON.stringify(userContext)}
      3. Genera UNA receta saludable usando ESOS ingredientes (priorizando los perecederos).
      4. Explica por qué es buena para su objetivo específico.
      
      Responde EXCLUSIVAMENTE en formato JSON válido con esta estructura:
      {
        "ingredientes_detectados": ["item1", "item2"],
        "receta": {
          "nombre": "Nombre Receta",
          "calorias": 0,
          "macros": { "proteina": "0g", "carbohidratos": "0g", "grasa": "0g" },
          "instrucciones": ["paso 1", "paso 2"]
        },
        "explicacion_xai": "Texto de la explicación lógica..."
      }
    `;

    const imagePart = {
      inlineData: {
        data: Buffer.from(fs.readFileSync(imagePath)).toString("base64"),
        mimeType: "image/jpeg",
      },
    };

    const result = await modelFlash.generateContent([prompt, imagePart]);
    const response = await result.response;
    const text = response.text();

    // Clean markdown code blocks if present
    const cleanText = text.replace(/```json/g, "").replace(/```/g, "");
    return JSON.parse(cleanText);
  } catch (error) {
    console.error("Error en Gemini Vision:", error);
    throw error;
  }
};

const systemInstruction = `
  Eres un Psicólogo Adleriano experto. Tu objetivo es ayudar al usuario a encontrar propósito, coraje y sentido de comunidad.
  
  Reglas de tu personalidad:
  1. ENFOQUE: Céntrate en el PRESENTE y el FUTURO. Evita excavar excesivamente en traumas pasados (etiología). Enfócate en la teleología (propósito de la conducta).
  2. ESTILO: Sé empático pero firme. Fomenta la autonomía. No des consejos directos ("deberías hacer X"), sino preguntas que inviten a la reflexión ("¿Para qué crees que eliges sentirte así?").
  3. CORAJE: Tu palabra clave es "Coraje" (The Courage to be Disliked). Anima al usuario a tener el coraje de ser imperfecto y de contribuir a otros.
  4. TONO: Cálido, profesional, filosófico pero accesible.
  5. PROHIBIDO: No actúes como médico clínico. Si detectas riesgo de suicidio o daño grave, recomienda ayuda profesional inmediata con un mensaje predefinido de seguridad.
`;

const modelChat = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
  systemInstruction: {
    role: "system",
    parts: [{ text: systemInstruction }],
  },
});

exports.chatTherapist = async (history, message) => {
  try {
    // 1. Format history for Gemini API
    // Gemini expects: [{ role: "user" | "model", parts: [{ text: "..." }] }]
    let formattedHistory = history.map((msg) => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content }],
    }));

    // Remove the last message if it matches the current message content (to avoid duplication in startChat + sendMessage)
    // The frontend sends [...messages, currentMsg], so the last item IS the current message.
    if (formattedHistory.length > 0) {
      const lastMsg = formattedHistory[formattedHistory.length - 1];
      if (lastMsg.role === "user" && lastMsg.parts[0].text === message) {
        formattedHistory.pop();
      }
    }

    // Ensure history starts with 'user' role (Gemini Requirement)
    // If the conversation starts with a greeting from the bot, we must remove it from the history passed to startChat
    if (formattedHistory.length > 0 && formattedHistory[0].role === "model") {
      formattedHistory.shift();
    }

    const chat = modelChat.startChat({
      history: formattedHistory,
    });

    const result = await chat.sendMessage(message);
    const response = await result.response;
    const text = response.text();

    return { response: text };
  } catch (error) {
    console.error("Gemini Chat Error:", error);
    throw error;
  }
};

exports.getDailyWellnessFeed = async (userContext) => {
  try {
    const prompt = `
      Genera un "Feed de Bienestar Anti-Procrastinación" para hoy.
      Usuario: ${JSON.stringify(userContext || { mood: "neutral" })}
      
      Necesito 3 "Tarjetas de Sabiduría" (Cards) breves y potentes.
      Temas posibles: Estoicismo, Psicología Adleriana, Técnica Pomodoro, Kaizen, Mindfulness.
      
      Responde EXCLUSIVAMENTE en JSON:
      [
        {
          "category": "Estoicismo | Productividad | Mente",
          "title": "Título Corto e Impactante",
          "content": "Consejo de 2-3 frases máximo. Muy accionable.",
          "icon": "book | clock | leaf"
        }
      ]
    `;

    const result = await modelFlash.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    const cleanText = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    return JSON.parse(cleanText);
  } catch (error) {
    console.error("Gemini Feed Error:", error);
    // Fallback content in case of AI failure
    return [
      {
        category: "Productividad",
        title: "Regla de los 2 Minutos",
        content:
          "Si algo toma menos de 2 minutos, hazlo ahora. Genera inercia positiva inmediatamente.",
        icon: "clock",
      },
    ];
  }
};
