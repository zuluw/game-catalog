import React, { useState, useRef } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  Text,
  Animated,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { updateGame } from "../database/db";
import { useTranslation } from "react-i18next";
import { useAppTheme } from "../context/ThemeContext";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

export default function EditScreen({ route, navigation }) {
  const { game } = route.params;
  const { t } = useTranslation();
  const { isDarkMode } = useAppTheme();

  const [title, setTitle] = useState(game.title);
  const [studio, setStudio] = useState(game.studio);
  const [rating, setRating] = useState(game.rating.toString());
  const [image, setImage] = useState(game.image || "");

  const theme = isDarkMode
    ? {
        bg: "#0A0A0A",
        card: "#1A1A1A",
        text: "#FFFFFF",
        accent: "#FF8C00",
        input: "#121212",
      }
    : {
        bg: "#F2F2F7",
        card: "#FFFFFF",
        text: "#000000",
        accent: "#F50",
        input: "#F2F2F7",
      };

  const handleSave = () => {
    if (title.trim() && studio.trim()) {
      updateGame(game.id, title, studio, parseFloat(rating) || 0, image);
      navigation.popToTop();
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <TouchableOpacity
        style={styles.backBtn}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="close" size={32} color={theme.accent} />
      </TouchableOpacity>

      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={[styles.label, { color: theme.text }]}>
          {t("edit_title").toUpperCase()}
        </Text>

        <View style={[styles.form, { backgroundColor: theme.card }]}>
          <TextInput
            style={[
              styles.input,
              { backgroundColor: theme.input, color: theme.text },
            ]}
            value={title}
            onChangeText={setTitle}
            placeholder={t("game_name")}
            placeholderTextColor="#555"
          />
          <TextInput
            style={[
              styles.input,
              { backgroundColor: theme.input, color: theme.text },
            ]}
            value={studio}
            onChangeText={setStudio}
            placeholder={t("label_studio")}
            placeholderTextColor="#555"
          />
          <TextInput
            style={[
              styles.input,
              { backgroundColor: theme.input, color: theme.text },
            ]}
            value={rating}
            onChangeText={setRating}
            keyboardType="numeric"
            placeholder={t("label_rating")}
            placeholderTextColor="#555"
          />
          <TextInput
            style={[
              styles.input,
              { backgroundColor: theme.input, color: theme.text },
            ]}
            value={image}
            onChangeText={setImage}
            placeholder={t("label_image")}
            placeholderTextColor="#555"
          />

          <TouchableOpacity onPress={handleSave} style={{ marginTop: 15 }}>
            <LinearGradient
              colors={[theme.accent, "#FF3D00"]}
              style={styles.btnSave}
            >
              <Text style={styles.btnText}>{t("save_btn").toUpperCase()}</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.btnCancel}
          >
            <Text style={{ color: "#777", fontWeight: "900", fontSize: 12 }}>
              {t("cancel_btn").toUpperCase()}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 25, paddingTop: 50 },
  backBtn: { marginBottom: 10 },
  label: {
    fontSize: 22,
    fontWeight: "900",
    marginBottom: 30,
    letterSpacing: 2,
    textAlign: "center",
  },
  form: { padding: 25, borderRadius: 30, elevation: 10 },
  input: {
    borderRadius: 15,
    padding: 18,
    marginBottom: 15,
    fontSize: 16,
    fontWeight: "700",
  },
  btnSave: { padding: 20, borderRadius: 15, alignItems: "center" },
  btnText: { color: "white", fontWeight: "900", letterSpacing: 2 },
  btnCancel: { marginTop: 20, alignItems: "center" },
});
