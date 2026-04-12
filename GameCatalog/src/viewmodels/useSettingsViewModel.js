import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAppTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { updateUserPassword, addNotificationRecord } from "../models/db";
import { updateNicknameInCloud } from "../models/firebase";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import * as LocalAuthentication from "expo-local-authentication";
import { Platform } from "react-native";

export const useSettingsViewModel = () => {
  const { t, i18n } = useTranslation();
  const { isDarkMode, toggleTheme } = useAppTheme();
  const { user, logout, login } = useAuth();

  const [newPassword, setNewPassword] = useState("");
  const [newNickname, setNewNickname] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  const [biometricsEnabled, setBiometricsEnabled] = useState(false);
  const [isBiometricSupported, setIsBiometricSupported] = useState(false);

  const [modal, setModal] = useState({
    visible: false,
    type: "success",
    title: "",
    message: "",
  });

  useEffect(() => {
    loadSettings();
    checkBiometricSupport();
    setupNotificationChannel();
  }, []);

  const checkBiometricSupport = async () => {
    const compatible = await LocalAuthentication.hasHardwareAsync();
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    setIsBiometricSupported(compatible && enrolled);
  };

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

  const loadSettings = async () => {
    const savedNotifStatus = await AsyncStorage.getItem(
      "notifications-enabled",
    );
    setNotificationsEnabled(savedNotifStatus === "true");

    const savedBioStatus = await AsyncStorage.getItem("biometrics-enabled");
    setBiometricsEnabled(savedBioStatus === "true");
  };

  const toggleBiometrics = async () => {
    if (!isBiometricSupported) {
      alert("Biometrics not supported or not set up on this device.");
      return;
    }

    const newValue = !biometricsEnabled;

    if (newValue) {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: t("biometric_reason") || "Confirm your identity",
        fallbackLabel: "Use Passcode",
      });

      if (!result.success) return;
    }

    setBiometricsEnabled(newValue);
    await AsyncStorage.setItem("biometrics-enabled", newValue.toString());
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
    } catch (e) {
      console.error("Planning Error:", e);
    }
  };

  const handleUpdateNickname = async () => {
    if (newNickname.trim().length < 2) {
      return setModal({
        visible: true,
        type: "error",
        title: t("error"),
        message: t("err_short"),
      });
    }

    try {
      const updatedFirebaseUser = await updateNicknameInCloud(newNickname);
      if (updatedFirebaseUser) {
        login(updatedFirebaseUser);
        setNewNickname("");
        setModal({
          visible: true,
          type: "success",
          title: t("success"),
          message: t("msg_nick_ok"),
        });
      }
    } catch (e) {
      console.error(e);
      setModal({
        visible: true,
        type: "error",
        title: t("error"),
        message: "Error updating profile",
      });
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
    newNickname,
    setNewNickname,
    handleUpdateNickname,
    showPassword,
    setShowPassword,
    modal,
    setModal,
    handleChangePassword,
    changeLang,
    theme,
    notificationsEnabled,
    toggleNotifications,
    biometricsEnabled,
    toggleBiometrics,
    isBiometricSupported,
  };
};
