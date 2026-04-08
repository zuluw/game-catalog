import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useEditViewModel } from "../viewmodels/useEditViewModel";

export default function EditScreen({ route, navigation }) {
  const { game } = route.params;

  const {
    title,
    setTitle,
    studio,
    setStudio,
    rating,
    setRating,
    image,
    pickImage,
    handleSave,
    isSaving,
    theme,
    t,
  } = useEditViewModel(game, navigation);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[styles.container, { backgroundColor: theme.bg }]}
    >
      <TouchableOpacity
        style={styles.backBtn}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="close" size={32} color={theme.accent} />
      </TouchableOpacity>

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={[styles.label, { color: theme.text }]}>
          {t("edit_title").toUpperCase()}
        </Text>

        <View style={[styles.form, { backgroundColor: theme.card }]}>
          <TouchableOpacity
            style={[styles.imagePicker, { backgroundColor: theme.input }]}
            onPress={pickImage}
          >
            {image ? (
              <Image source={{ uri: image }} style={styles.preview} />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Ionicons name="camera" size={30} color="#555" />
              </View>
            )}
          </TouchableOpacity>

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

          <TouchableOpacity
            onPress={handleSave}
            disabled={isSaving}
            style={{ marginTop: 15 }}
          >
            <LinearGradient
              colors={[theme.accent, "#FF3D00"]}
              style={styles.btnSave}
            >
              {isSaving ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.btnText}>
                  {t("save_btn").toUpperCase()}
                </Text>
              )}
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
    </KeyboardAvoidingView>
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
  imagePicker: {
    height: 150,
    borderRadius: 15,
    marginBottom: 15,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  preview: { width: "100%", height: "100%" },
  imagePlaceholder: { alignItems: "center" },
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
