// Get the correct API URL - use your computer's local IP for device testing
// For emulator/simulator, localhost works. For physical device, use your computer's IP
const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://[IP_ADDRESS]/api";

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

class ApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_URL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<ApiResponse<T>> {
    try {
      console.log(`[API] Calling: ${this.baseUrl}${endpoint}`);

      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
      });

      const responseData = await response.json();
      console.log(`[API] Response:`, responseData);

      if (!response.ok) {
        return { error: responseData.error || "Request failed" };
      }

      return { data: responseData };
    } catch (error) {
      console.error("[API] Error:", error);
      return { error: "Network error - Check if backend is running" };
    }
  }

  // User Metrics
  async calculateMetrics(params: {
    weight: number;
    height: number;
    age: number;
    gender: string;
    activityLevel: string;
    goal?: string;
    userId?: string;
  }) {
    return this.request<{
      bmi: string;
      tmb: number;
      tdee: number;
      status: string;
      explanation: string;
    }>("/calculate-metrics", {
      method: "POST",
      body: JSON.stringify(params),
    });
  }

  // Gym Routines
  async generateRoutine(params: {
    userProfile: Record<string, any>;
    goal: string;
    userId?: string;
  }) {
    return this.request<{
      routineName: string;
      exercises: Array<{
        name: string;
        sets: string;
        reps: string;
        tips: string;
      }>;
      explanation: string;
    }>("/generate-routine", {
      method: "POST",
      body: JSON.stringify(params),
    });
  }

  // Kitchen - Analyze Fridge (multipart form)
  async analyzeFridge(
    imageUri: string,
    userContext?: Record<string, any>,
    userId?: string,
  ) {
    try {
      console.log("[API] Analyzing fridge image:", imageUri);

      const formData = new FormData();

      // Create file object for upload
      const filename = imageUri.split("/").pop() || "photo.jpg";
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : "image/jpeg";

      formData.append("image", {
        uri: imageUri,
        name: filename,
        type,
      } as any);

      if (userContext) {
        formData.append("userContext", JSON.stringify(userContext));
      }
      if (userId) {
        formData.append("userId", userId);
      }

      const response = await fetch(`${this.baseUrl}/analyze-fridge`, {
        method: "POST",
        body: formData,
        // Note: Don't set Content-Type header for multipart/form-data
        // The browser/RN will set it automatically with the boundary
      });

      const data = await response.json();
      console.log("[API] Fridge analysis result:", data);

      if (!response.ok) {
        return { error: data.error || "Failed to analyze" };
      }

      return { data };
    } catch (error) {
      console.error("[API] Fridge analysis error:", error);
      return { error: "Network error analyzing fridge" };
    }
  }

  // Chat with AI Therapist
  async chat(params: {
    message: string;
    history?: Array<{ role: string; content: string }>;
    userId?: string;
  }) {
    return this.request<{ response: string }>("/chat", {
      method: "POST",
      body: JSON.stringify(params),
    });
  }

  // Wellness Feed
  async getDailyFeed(params: { mood?: string; userId?: string }) {
    // The backend returns an array directly, not wrapped in { cards: [] }
    const response = await this.request<
      Array<{
        title: string;
        summary?: string;
        content: string;
        category: string;
        icon?: string;
      }>
    >("/daily-feed", {
      method: "POST",
      body: JSON.stringify(params),
    });

    // Transform to expected format
    if (response.data && Array.isArray(response.data)) {
      return {
        data: {
          cards: response.data.map((card) => ({
            title: card.title,
            summary: card.summary || card.content.substring(0, 50) + "...",
            content: card.content,
            category: card.category.toLowerCase(),
            icon: card.icon,
          })),
        },
      };
    }

    return response as any;
  }
}

export const api = new ApiService();
