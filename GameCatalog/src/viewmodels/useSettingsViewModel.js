import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAppTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { updateUserPassword } from "../models/db";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const useSettingsViewModel = () => {
  const { t, i18n } = useTranslation();
  const { isDarkMode, toggleTheme } = useAppTheme();
  const { user, logout } = useAuth();

  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [modal, setModal] = useState({
    visible: false,
    type: "success",
    title: "",
    message: "",
  });

  const handleChangePassword = () => {
    if (newPassword.length < 4) {
      return setModal({
        visible: true,
        type: "error",
        title: t("error"),
        message: t("err_short"),
      });
    }
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
  };
};
