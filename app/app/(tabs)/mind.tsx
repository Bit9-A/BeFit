import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  FlatList,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  FadeInDown,
  FadeInUp,
  FadeIn,
} from "react-native-reanimated";
import { Card } from "../../components/ui";
import { api } from "../../services/api";
import { useAuthStore } from "../../stores/authStore";
import { ChatMessage, WellnessCard } from "../../types";

type TabType = "chat" | "feed";

function ChatBubble({
  message,
  isLast,
}: {
  message: ChatMessage;
  isLast: boolean;
}) {
  const isUser = message.role === "user";

  return (
    <Animated.View
      entering={isLast ? FadeInDown.springify() : undefined}
      className={`mb-3 ${isUser ? "items-end" : "items-start"}`}
    >
      <View
        className={`
          max-w-[85%] rounded-2xl px-4 py-3 overflow-hidden
          ${isUser ? "bg-primary-500 rounded-br-md overflow-hidden" : "bg-surface border border-surface-light rounded-bl-md overflow-hidden"}
        `}
      >
        <Text className={isUser ? "text-white" : "text-slate-200"}>
          {message.content}
        </Text>
      </View>
    </Animated.View>
  );
}

function WellnessCardComponent({
  card,
  index,
}: {
  card: WellnessCard;
  index: number;
}) {
  const [expanded, setExpanded] = useState(false);

  const categoryColors: Record<
    string,
    { bg: string; text: string; icon: string }
  > = {
    productivity: {
      bg: "bg-primary-500/20",
      text: "text-primary-400",
      icon: "#6366F1",
    },
    mindfulness: {
      bg: "bg-secondary-500/20",
      text: "text-secondary-400",
      icon: "#8B5CF6",
    },
    health: {
      bg: "bg-accent-500/20",
      text: "text-accent-400",
      icon: "#10B981",
    },
    motivation: {
      bg: "bg-yellow-500/20",
      text: "text-yellow-400",
      icon: "#F59E0B",
    },
    default: { bg: "bg-slate-500/20", text: "text-slate-400", icon: "#94A3B8" },
  };

  const colors = categoryColors[card.category] || categoryColors.default;

  const getIcon = (category: string): keyof typeof Ionicons.glyphMap => {
    switch (category) {
      case "productivity":
        return "timer";
      case "mindfulness":
        return "flower";
      case "health":
        return "heart";
      case "motivation":
        return "rocket";
      default:
        return "book";
    }
  };

  return (
    <Animated.View entering={FadeInDown.delay(100 + index * 100)}>
      <TouchableOpacity
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.8}
      >
        <Card className="mb-4">
          <View className="flex-row items-start">
            <View
              className={`w-12 h-12 ${colors.bg} rounded-2xl items-center justify-center mr-4 overflow-hidden`}
            >
              <Ionicons
                name={getIcon(card.category)}
                size={24}
                color={colors.icon}
              />
            </View>
            <View className="flex-1">
              <View className="flex-row items-center justify-between">
                <Text
                  className={`text-xs font-medium ${colors.text} uppercase`}
                >
                  {card.category}
                </Text>
                <Ionicons
                  name={expanded ? "chevron-up" : "chevron-down"}
                  size={18}
                  color="#94A3B8"
                />
              </View>
              <Text className="text-white font-semibold mt-1">
                {card.title}
              </Text>
              <Text className="text-slate-400 text-sm mt-1">
                {card.summary}
              </Text>
            </View>
          </View>

          {expanded && (
            <Animated.View
              entering={FadeIn}
              className="mt-4 pt-4 border-t border-surface-light"
            >
              <Text className="text-slate-300 leading-relaxed">
                {card.content}
              </Text>
            </Animated.View>
          )}
        </Card>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function MindScreen() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<TabType>("chat");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Hola, soy tu compañero de bienestar. ¿Cómo te sientes hoy? Estoy aquí para escucharte y ayudarte a reflexionar.",
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [sending, setSending] = useState(false);
  const [feedCards, setFeedCards] = useState<WellnessCard[]>([]);
  const [loadingFeed, setLoadingFeed] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const sendMessage = async () => {
    if (!inputText.trim() || sending) return;

    const userMessage: ChatMessage = {
      role: "user",
      content: inputText.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setSending(true);

    const history = messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    const response = await api.chat({
      message: userMessage.content,
      history,
      userId: user?.id,
    });

    if (response.data) {
      const aiMessage: ChatMessage = {
        role: "assistant",
        content: response.data.response,
      };
      setMessages((prev) => [...prev, aiMessage]);
    }

    setSending(false);
  };

  const loadFeed = async () => {
    setLoadingFeed(true);
    const response = await api.getDailyFeed({
      mood: "neutral",
      userId: user?.id,
    });

    if (response.data?.cards) {
      setFeedCards(response.data.cards);
    } else {
      // Fallback cards
      setFeedCards([
        {
          title: "La Técnica Pomodoro",
          summary: "Mejora tu concentración con intervalos de trabajo",
          content:
            "Trabaja 25 minutos, descansa 5. Después de 4 ciclos, toma un descanso más largo de 15-30 minutos. Esta técnica ayuda a mantener la concentración y evitar el agotamiento.",
          category: "productivity",
        },
        {
          title: "Respiración 4-7-8",
          summary: "Reduce la ansiedad en segundos",
          content:
            "Inhala por la nariz contando hasta 4, mantén el aire contando hasta 7, exhala por la boca contando hasta 8. Repite 3-4 veces. Esta técnica activa el sistema parasimpático.",
          category: "mindfulness",
        },
        {
          title: "El Estoicismo Práctico",
          summary: "Lo que está en tu control",
          content:
            "Como decía Epicteto: 'No son las cosas las que nos perturban, sino nuestra opinión sobre ellas'. Enfócate en lo que puedes controlar: tus acciones, pensamientos y respuestas.",
          category: "motivation",
        },
      ]);
    }
    setLoadingFeed(false);
  };

  useEffect(() => {
    if (activeTab === "feed" && feedCards.length === 0) {
      loadFeed();
    }
  }, [activeTab]);

  return (
    <LinearGradient colors={["#0F172A", "#1E293B"]} className="flex-1">
      <SafeAreaView className="flex-1">
        {/* Header */}
        <Animated.View
          entering={FadeInUp.delay(100)}
          className="px-5 mt-4 mb-4"
        >
          <Text className="text-3xl font-bold text-white">
            Santuario Mental
          </Text>
          <Text className="text-slate-400 mt-2">
            Tu espacio de bienestar y reflexión
          </Text>
        </Animated.View>

        {/* Tab Switcher */}
        <View className="flex-row mx-5 mb-4 bg-surface rounded-2xl p-1.5 overflow-hidden">
          <TouchableOpacity
            onPress={() => setActiveTab("chat")}
            className={`flex-1 py-3 rounded-xl ${activeTab === "chat" ? "bg-primary-500" : ""}`}
          >
            <Text
              className={`text-center font-semibold ${activeTab === "chat" ? "text-white" : "text-slate-400"}`}
            >
              Diario
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveTab("feed")}
            className={`flex-1 py-3 rounded-xl overflow-hidden ${activeTab === "feed" ? "bg-primary-500" : ""}`}
          >
            <Text
              className={`text-center font-semibold ${activeTab === "feed" ? "text-white" : "text-slate-400"}`}
            >
              Feed
            </Text>
          </TouchableOpacity>
        </View>

        {activeTab === "chat" ? (
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            className="flex-1"
            keyboardVerticalOffset={100}
          >
            {/* Messages */}
            <ScrollView
              ref={scrollViewRef}
              className="flex-1 px-5"
              contentContainerStyle={{ paddingBottom: 20 }}
              onContentSizeChange={() => scrollViewRef.current?.scrollToEnd()}
            >
              {messages.map((message, index) => (
                <ChatBubble
                  key={index}
                  message={message}
                  isLast={index === messages.length - 1}
                />
              ))}
              {sending && (
                <View className="items-start mb-3">
                  <View className="bg-surface border border-surface-light rounded-2xl rounded-bl-md px-4 py-3 overflow-hidden">
                    <Text className="text-slate-400">Escribiendo...</Text>
                  </View>
                </View>
              )}
            </ScrollView>

            {/* Input */}
            <View className="px-5 pb-28">
              <View className="flex-row items-end bg-surface rounded-2xl border border-surface-light overflow-hidden">
                <TextInput
                  value={inputText}
                  onChangeText={setInputText}
                  placeholder="Escribe cómo te sientes..."
                  placeholderTextColor="#64748B"
                  multiline
                  maxLength={500}
                  className="flex-1 px-4 py-3 text-white max-h-24"
                />
                <TouchableOpacity
                  onPress={sendMessage}
                  disabled={!inputText.trim() || sending}
                  className={`m-2 w-10 h-10 rounded-xl overflow-hidden items-center justify-center ${
                    inputText.trim() ? "bg-primary-500" : "bg-surface-light"
                  }`}
                >
                  <Ionicons
                    name="send"
                    size={18}
                    color={inputText.trim() ? "#fff" : "#64748B"}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        ) : (
          <ScrollView
            className="flex-1 px-5"
            contentContainerStyle={{ paddingBottom: 120 }}
          >
            {loadingFeed ? (
              <View className="items-center py-10">
                <Text className="text-slate-400">Cargando contenido...</Text>
              </View>
            ) : (
              feedCards.map((card, index) => (
                <WellnessCardComponent key={index} card={card} index={index} />
              ))
            )}

            <TouchableOpacity
              onPress={loadFeed}
              className="flex-row items-center justify-center py-4"
            >
              <Ionicons name="refresh" size={20} color="#6366F1" />
              <Text className="text-primary-500 font-semibold ml-2">
                Cargar más contenido
              </Text>
            </TouchableOpacity>
          </ScrollView>
        )}
      </SafeAreaView>
    </LinearGradient>
  );
}
