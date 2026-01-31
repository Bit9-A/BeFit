import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

/**
 * A web-safe wrapper for Expo Haptics.
 * On web, these functions do nothing to prevent errors.
 * On native, they trigger the device haptic engine.
 */

export const safeHaptics = {
  selection: async () => {
    if (Platform.OS === "web") return;
    try {
      await Haptics.selectionAsync();
    } catch (e) {
      // Ignore haptics errors
    }
  },

  success: async () => {
    if (Platform.OS === "web") return;
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e) {
      // Ignore
    }
  },

  error: async () => {
    if (Platform.OS === "web") return;
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } catch (e) {
      // Ignore
    }
  },

  warning: async () => {
    if (Platform.OS === "web") return;
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } catch (e) {
      // Ignore
    }
  },

  light: async () => {
    if (Platform.OS === "web") return;
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (e) {
      // Ignore
    }
  },

  medium: async () => {
    if (Platform.OS === "web") return;
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (e) {
      // Ignore
    }
  },

  heavy: async () => {
    if (Platform.OS === "web") return;
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } catch (e) {
      // Ignore
    }
  },
};
