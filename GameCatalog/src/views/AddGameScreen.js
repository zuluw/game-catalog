import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";
import { useAddGameViewModel } from "../viewmodels/useAddGameViewModel";

export default function AddGameScreen({
  isVisible,
  onClose,
  onRefresh,
  theme,
}) {
  const { t } = useTranslation();
  const { user } = useAuth();

  const {
    title,
    setTitle,
    studio,
    setStudio,
    rating,
    setRating,
    image,
    setImage,
    handleSave,
  } = useAddGameViewModel(user, onClose, onRefresh);

  return (
    <Modal animationType="slide" transparent={true} visible={isVisible}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.overlay}
      >
        <View style={[styles.content, { backgroundColor: theme.card }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              {t("add_btn").toUpperCase()}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close-circle" size={30} color={theme.subText} />
            </TouchableOpacity>
          </View>

          <TextInput
            placeholder={t("game_name")}
            placeholderTextColor="#666"
            value={title}
            onChangeText={setTitle}
            style={[
              styles.input,
              { backgroundColor: theme.bg, color: theme.text },
            ]}
          />
          <TextInput
            placeholder={t("label_studio")}
            placeholderTextColor="#666"
            value={studio}
            onChangeText={setStudio}
            style={[
              styles.input,
              { backgroundColor: theme.bg, color: theme.text },
            ]}
          />
          <TextInput
            placeholder={t("label_rating")}
            placeholderTextColor="#666"
            value={rating}
            onChangeText={setRating}
            keyboardType="numeric"
            style={[
              styles.input,
              { backgroundColor: theme.bg, color: theme.text },
            ]}
          />
          <TextInput
            placeholder={t("label_image")}
            placeholderTextColor="#666"
            value={image}
            onChangeText={setImage}
            style={[
              styles.input,
              { backgroundColor: theme.bg, color: theme.text },
            ]}
          />

          <TouchableOpacity onPress={handleSave}>
            <LinearGradient
              colors={[theme.accent, "#FF8C00"]}
              style={styles.saveBtn}
            >
              <Text style={styles.saveBtnText}>
                {t("save_btn").toUpperCase()}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "flex-end",
  },
  content: { padding: 30, borderTopLeftRadius: 40, borderTopRightRadius: 40 },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 25,
  },
  modalTitle: { fontSize: 18, fontWeight: "900", letterSpacing: 1 },
  input: { borderRadius: 15, padding: 18, marginBottom: 15, fontSize: 16 },
  saveBtn: {
    padding: 20,
    borderRadius: 15,
    alignItems: "center",
    marginTop: 10,
  },
  saveBtnText: { color: "white", fontWeight: "900", letterSpacing: 1 },
});
