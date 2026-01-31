import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

// Web-safe haptics wrapper
const isWeb = Platform.OS === "web";

/**
 * Triggers haptic feedback safely across platforms.
 * On web, this function does nothing to prevent errors.
 */
export const triggerHaptic = async (
  type: "light" | "medium" | "heavy" | "success" | "warning" | "error",
) => {
  if (isWeb) return;

  try {
    switch (type) {
      case "light":
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        break;
      case "medium":
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        break;
      case "heavy":
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        break;
      case "success":
        await Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Success,
        );
        break;
      case "warning":
        await Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Warning,
        );
        break;
      case "error":
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        break;
    }
  } catch (error) {
    // Haptics might fail on some devices or simulators, we catch safely
    console.debug("[Haptics] Failed or not supported", error);
  }
};
