import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { registerUser, loginUser } from "../database/db";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";
import StatusModal from "../components/StatusModal";

export default function AuthScreen({ onReady }) {
  const { t } = useTranslation();
  const { login, continueAsGuest } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [modal, setModal] = useState({
    visible: false,
    type: "success",
    title: "",
    message: "",
  });

  const showStatus = (type, title, message) =>
    setModal({ visible: true, type, title, message });

  const handleAuth = () => {
    if (!username || !password)
      return showStatus("error", t("error"), t("err_fill"));

    if (isLogin) {
      const user = loginUser(username, password);
      if (user) login(user);
      else showStatus("error", t("error"), t("err_auth"));
    } else {
      try {
        registerUser(username, password);
        showStatus("success", t("success"), t("msg_reg_ok"));
        setIsLogin(true);
      } catch (e) {
        showStatus("error", t("error"), t("err_exists"));
      }
    }
  };

  return (
    <View style={styles.container} onLayout={onReady}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.inner}
      >
        <Text style={styles.logo}>GAME CATALOG</Text>
        <View style={styles.card}>
          <Text style={styles.title}>
            {isLogin ? t("login_tab") : t("register_tab")}
          </Text>
          <TextInput
            style={styles.input}
            placeholder={t("username_label")}
            placeholderTextColor="#666"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />
          <View style={styles.passwordWrap}>
            <TextInput
              style={styles.passInput}
              placeholder={t("password_label")}
              placeholderTextColor="#666"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={{ paddingRight: 15 }}
            >
              <Ionicons
                name={showPassword ? "eye" : "eye-off"}
                size={22}
                color="#555"
              />
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={handleAuth} style={styles.mainBtn}>
            <LinearGradient colors={["#FF8C00", "#FF4500"]} style={styles.grad}>
              <Text style={styles.btnText}>
                {isLogin ? t("login_btn") : t("register_btn")}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setIsLogin(!isLogin)}
            style={styles.switchBtn}
          >
            <Text style={styles.switchText}>
              {isLogin ? t("switch_to_register") : t("switch_to_login")}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={continueAsGuest} style={styles.guestBtn}>
            <Text style={styles.guestText}>{t("guest_btn")}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
      <StatusModal
        {...modal}
        onClose={() => setModal({ ...modal, visible: false })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0A0A0A" },
  inner: { flex: 1, justifyContent: "center", padding: 30 },
  logo: {
    color: "white",
    fontSize: 32,
    fontWeight: "900",
    textAlign: "center",
    marginBottom: 50,
    letterSpacing: 4,
  },
  card: { backgroundColor: "#1A1A1A", padding: 25, borderRadius: 30 },
  title: {
    color: "white",
    fontSize: 16,
    fontWeight: "900",
    textAlign: "center",
    marginBottom: 25,
  },
  input: {
    backgroundColor: "#0A0A0A",
    color: "white",
    padding: 18,
    borderRadius: 15,
    marginBottom: 15,
  },
  passwordWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0A0A0A",
    borderRadius: 15,
    marginBottom: 15,
  },
  passInput: { flex: 1, color: "white", padding: 18 },
  mainBtn: { marginTop: 10 },
  grad: { padding: 18, borderRadius: 15, alignItems: "center" },
  btnText: { color: "white", fontWeight: "900" },
  switchBtn: { marginTop: 20, alignItems: "center" },
  switchText: { color: "#777", fontWeight: "700" },
  guestBtn: {
    marginTop: 30,
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#333",
    paddingTop: 20,
  },
  guestText: { color: "#FF8C00", fontWeight: "900" },
});
