import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "../services/api";
import { triggerHaptic } from "../services/haptics";

export interface Mission {
  id: string;
  title: string;
  icon: string;
  completed: boolean;
  xpReward: number;
  type: "movement" | "nutrition" | "mind";
}

const DEFAULT_MISSIONS: Mission[] = [
  {
    id: "m_move",
    title: "Mover el Esqueleto",
    icon: "barbell",
    completed: false,
    xpReward: 50,
    type: "movement",
  },
  {
    id: "m_eat",
    title: "Comer Limpio",
    icon: "restaurant",
    completed: false,
    xpReward: 30,
    type: "nutrition",
  },
  {
    id: "m_water",
    title: "Hidratación",
    icon: "water",
    completed: false,
    xpReward: 20,
    type: "mind",
  },
];

interface GamificationState {
  xp: number;
  level: number;
  currentStreak: number;
  nextLevelXp: number;
  progressPercent: number;
  isLoading: boolean;
  missions: Mission[];
  lastResetDate: string | null;

  fetchGamification: (userId: string) => Promise<void>;
  addXP: (userId: string, amount: number, action: string) => Promise<void>;
  completeMission: (userId: string, missionId: string) => Promise<void>;
  checkDailyReset: () => void;
}

export const useGamificationStore = create<GamificationState>()(
  persist(
    (set, get) => ({
      xp: 0,
      level: 1,
      currentStreak: 0,
      nextLevelXp: 100,
      progressPercent: 0,
      isLoading: false,
      missions: DEFAULT_MISSIONS,
      lastResetDate: null,

      fetchGamification: async (userId: string) => {
        set({ isLoading: true });
        try {
          const response = await api.getGamificationProfile(userId);
          if (response.data) {
            set({
              xp: response.data.xp || 0,
              level: response.data.level || 1,
              currentStreak: response.data.current_streak || 0,
              nextLevelXp: response.data.nextLevelXp || 100,
              progressPercent: response.data.progressPercent || 0,
              isLoading: false,
            });
            get().checkDailyReset();
          }
        } catch (error) {
          console.error("Failed to fetch gamification", error);
          set({ isLoading: false });
        }
      },

      addXP: async (userId: string, amount: number, action: string) => {
        try {
          const response = await api.addXP({
            userId,
            amount,
            action,
          });

          if (response.data?.success) {
            const { leveledUp } = response.data;
            await get().fetchGamification(userId);
            if (leveledUp) {
              triggerHaptic("success");
              console.log("LEVEL UP!");
            }

            // Auto-complete missions based on action
            const { completeMission } = get();
            if (
              action === "routine_generated" ||
              action === "workout_completed"
            ) {
              await completeMission(userId, "m_move");
            } else if (action === "fridge_analysis" || action === "log_food") {
              await completeMission(userId, "m_eat");
            } else if (action === "mind_session" || action === "drink_water") {
              await completeMission(userId, "m_water");
            }
          }
        } catch (error) {
          console.error("Failed to add XP", error);
        }
      },

      completeMission: async (userId: string, missionId: string) => {
        const { missions, addXP } = get();
        const missionIndex = missions.findIndex((m) => m.id === missionId);

        if (missionIndex !== -1 && !missions[missionIndex].completed) {
          // 1. Mark as completed locally
          const newMissions = [...missions];
          newMissions[missionIndex] = {
            ...newMissions[missionIndex],
            completed: true,
          };
          set({ missions: newMissions });

          // 2. Trigger Haptics
          triggerHaptic("success");

          // 3. Add XP
          const mission = missions[missionIndex];
          await addXP(userId, mission.xpReward, `mission_${mission.id}`);
        }
      },

      checkDailyReset: () => {
        const { lastResetDate } = get();
        const today = new Date().toDateString();

        if (lastResetDate !== today) {
          console.log("[Gamification] Resetting Daily Missions");
          set({
            missions: DEFAULT_MISSIONS.map((m) => ({ ...m, completed: false })),
            lastResetDate: today,
          });
        }
      },
    }),
    {
      name: "gamification-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        missions: state.missions,
        lastResetDate: state.lastResetDate,
      }), // Only persist missions and reset date
    },
  ),
);
