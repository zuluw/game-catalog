import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useTranslation } from "react-i18next";
import { useAppTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { updateUserPassword } from "../database/db";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import StatusModal from "../components/StatusModal";

export default function SettingsScreen({ navigation }) {
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

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView style={[styles.container, { backgroundColor: theme.bg }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={28} color={theme.accent} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: theme.text }]}>
            {t("settings_title").toUpperCase()}
          </Text>
          <View style={{ width: 28 }} />
        </View>

        <View
          style={[
            styles.section,
            { backgroundColor: theme.card, alignItems: "center" },
          ]}
        >
          <Ionicons name="person-circle" size={80} color={theme.accent} />
          <Text style={[styles.username, { color: theme.text }]}>
            {user ? user.username : "GUEST"}
          </Text>
          <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
            <Text style={[styles.logoutText, !user && { color: theme.accent }]}>
              {user ? t("logout_btn") : t("login_btn")}
            </Text>
          </TouchableOpacity>
        </View>

        {user && (
          <View style={[styles.section, { backgroundColor: theme.card }]}>
            <Text
              style={[
                styles.sectionLabel,
                { color: theme.text, marginBottom: 15 },
              ]}
            >
              {t("change_pass_title")}
            </Text>

            <View
              style={[
                styles.passwordInputContainer,
                { backgroundColor: theme.input },
              ]}
            >
              <TextInput
                style={[styles.flexInput, { color: theme.text }]}
                placeholder={t("new_pass_placeholder")}
                placeholderTextColor="#666"
                secureTextEntry={!showPassword}
                value={newPassword}
                onChangeText={setNewPassword}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeBtn}
              >
                <Ionicons
                  name={showPassword ? "eye" : "eye-off"}
                  size={22}
                  color={theme.sub}
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity onPress={handleChangePassword}>
              <LinearGradient
                colors={[theme.accent, "#FF3D00"]}
                style={styles.saveBtn}
              >
                <Text style={styles.saveBtnText}>{t("update_btn")}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        <View style={[styles.section, { backgroundColor: theme.card }]}>
          <View style={styles.row}>
            <Ionicons name="language-outline" size={20} color={theme.accent} />
            <Text style={[styles.sectionLabel, { color: theme.text }]}>
              {t("language").toUpperCase()}
            </Text>
          </View>
          <View style={styles.langToggle}>
            <TouchableOpacity
              style={[
                styles.langBtn,
                i18n.language === "ru" && { backgroundColor: theme.accent },
              ]}
              onPress={() => changeLang("ru")}
            >
              <Text
                style={[
                  styles.langText,
                  { color: i18n.language === "ru" ? "#fff" : theme.sub },
                ]}
              >
                RU
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.langBtn,
                (i18n.language === "en" || i18n.language.startsWith("en")) && {
                  backgroundColor: theme.accent,
                },
              ]}
              onPress={() => changeLang("en")}
            >
              <Text
                style={[
                  styles.langText,
                  {
                    color:
                      i18n.language === "en" || i18n.language.startsWith("en")
                        ? "#fff"
                        : theme.sub,
                  },
                ]}
              >
                EN
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: theme.card }]}>
          <View style={styles.rowBetween}>
            <View style={styles.row}>
              <Ionicons name="moon-outline" size={20} color={theme.accent} />
              <Text style={[styles.sectionLabel, { color: theme.text }]}>
                {t("theme").toUpperCase()}
              </Text>
            </View>
            <Switch
              value={isDarkMode}
              onValueChange={toggleTheme}
              trackColor={{ false: "#333", true: theme.accent }}
              thumbColor={"#FFF"}
            />
          </View>
        </View>
        <Text style={styles.version}>{t("version_info").toUpperCase()}</Text>
        <View style={{ height: 50 }} />
      </ScrollView>
      <StatusModal
        {...modal}
        onClose={() => setModal({ ...modal, visible: false })}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 25 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 50,
    marginBottom: 30,
  },
  title: { fontSize: 20, fontWeight: "900" },
  section: { padding: 20, borderRadius: 25, marginBottom: 15 },
  username: { fontSize: 24, fontWeight: "900", marginTop: 10 },
  logoutBtn: { marginTop: 15, padding: 10 },
  logoutText: { color: "#FF4444", fontWeight: "900", fontSize: 12 },
  passwordInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 15,
    marginBottom: 15,
  },
  flexInput: { flex: 1, padding: 15, fontSize: 14 },
  eyeBtn: { paddingHorizontal: 15 },
  saveBtn: { padding: 15, borderRadius: 15, alignItems: "center" },
  saveBtnText: { color: "white", fontWeight: "900", fontSize: 12 },
  row: { flexDirection: "row", alignItems: "center", gap: 12 },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionLabel: { fontSize: 12, fontWeight: "900" },
  langToggle: {
    flexDirection: "row",
    marginTop: 15,
    backgroundColor: "rgba(0,0,0,0.05)",
    padding: 5,
    borderRadius: 15,
  },
  langBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 12,
  },
  langText: { fontSize: 12, fontWeight: "900" },
  version: {
    textAlign: "center",
    color: "#555",
    marginTop: 20,
    fontSize: 10,
    fontWeight: "bold",
  },
});
