import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAppTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { updateUserPassword, addNotificationRecord } from "../models/db";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

export const useSettingsViewModel = () => {
  const { t, i18n } = useTranslation();
  const { isDarkMode, toggleTheme } = useAppTheme();
  const { user, logout } = useAuth();

  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  const [modal, setModal] = useState({
    visible: false,
    type: "success",
    title: "",
    message: "",
  });

  useEffect(() => {
    loadNotificationStatus();
    setupNotificationChannel();
  }, []);

  const setupNotificationChannel = async () => {
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
      });
    }
  };

  const loadNotificationStatus = async () => {
    const savedStatus = await AsyncStorage.getItem("notifications-enabled");
    setNotificationsEnabled(savedStatus === "true");
  };

  const toggleNotifications = async () => {
    const newValue = !notificationsEnabled;

    if (newValue) {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== "granted") {
        alert("Allow notifications in your phone settings!");
        return;
      }

      addNotificationRecord(
        t("notif_title"),
        "Notification system activated.",
        user?.id,
      );

      await scheduleNotifications();
    } else {
      await Notifications.cancelAllScheduledNotificationsAsync();
    }

    setNotificationsEnabled(newValue);
    await AsyncStorage.setItem("notifications-enabled", newValue.toString());
  };

  const scheduleNotifications = async () => {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();

      await Notifications.scheduleNotificationAsync({
        content: {
          title: t("notif_title"),
          body: "Test notification! :)",
          sound: true,
          priority: Notifications.AndroidNotificationPriority.MAX,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: 3,
          repeats: false,
        },
      });

      await Notifications.scheduleNotificationAsync({
        content: {
          title: t("notif_title"),
          body: t("notif_body"),
          sound: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: 18,
          minute: 0,
        },
      });

      console.log("Notifications successfully scheduled!");
    } catch (e) {
      console.error("Planning Error:", e);
    }
  };

  const handleChangePassword = () => {
    if (newPassword.length < 4)
      return setModal({
        visible: true,
        type: "error",
        title: t("error"),
        message: t("err_short"),
      });
    updateUserPassword(user.id, newPassword);
    setNewPassword("");
    setShowPassword(false);
    setModal({
      visible: true,
      type: "success",
      title: t("success"),
      message: t("msg_pass_ok"),
    });
  };

  const changeLang = async (lang) => {
    await i18n.changeLanguage(lang);
    await AsyncStorage.setItem("user-language", lang);
  };

  const theme = isDarkMode
    ? {
        bg: "#0A0A0A",
        card: "#1A1A1A",
        text: "#FFFFFF",
        accent: "#FF8C00",
        sub: "#777",
        input: "#0A0A0A",
      }
    : {
        bg: "#F2F2F7",
        card: "#FFFFFF",
        text: "#000000",
        accent: "#F50",
        sub: "#8E8E93",
        input: "#F2F2F7",
      };

  return {
    t,
    i18n,
    isDarkMode,
    toggleTheme,
    user,
    logout,
    newPassword,
    setNewPassword,
    showPassword,
    setShowPassword,
    modal,
    setModal,
    handleChangePassword,
    changeLang,
    theme,
    notificationsEnabled,
    toggleNotifications,
  };
};
