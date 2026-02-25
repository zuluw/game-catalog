import React, { useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  Animated,
  Image,
} from "react-native";
import { deleteGame } from "../database/db";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useAppTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";

const AnimatedBtn = ({ onPress, children, style }) => {
  const scale = useRef(new Animated.Value(1)).current;
  const onPressIn = () =>
    Animated.spring(scale, { toValue: 0.96, useNativeDriver: true }).start();
  const onPressOut = () =>
    Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity
        activeOpacity={1}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        onPress={onPress}
      >
        <View style={style}>{children}</View>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default function DetailsScreen({ route, navigation }) {
  const { game } = route.params;
  const { isDarkMode } = useAppTheme();
  const { user } = useAuth();
  const { t } = useTranslation();

  const isOwner = user && game.owner_id === user.id;

  const theme = isDarkMode
    ? {
        bg: "#0A0A0A",
        card: "#1A1A1A",
        text: "#FFFFFF",
        sub: "#777",
        accent: "#FF8C00",
      }
    : {
        bg: "#F2F2F7",
        card: "#FFFFFF",
        text: "#000000",
        sub: "#8E8E93",
        accent: "#F50",
      };

  const gameImg = game.image
    ? { uri: game.image }
    : {
        uri: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=500",
      };

  const handleDelete = () => {
    Alert.alert(t("delete_btn"), t("delete_confirm"), [
      { text: t("cancel_btn"), style: "cancel" },
      {
        text: t("delete_btn"),
        style: "destructive",
        onPress: () => {
          deleteGame(game.id);
          navigation.goBack();
        },
      },
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.imageContainer}>
          <Image source={gameImg} style={styles.heroImage} />
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={28} color="white" />
          </TouchableOpacity>
          <LinearGradient
            colors={["transparent", theme.bg]}
            style={styles.heroOverlay}
          />
          <Text style={styles.heroTitle}>{game.title.toUpperCase()}</Text>
        </View>

        <View style={styles.content}>
          <View style={[styles.infoCard, { backgroundColor: theme.card }]}>
            <Text style={styles.label}>{t("label_studio")}</Text>
            <Text style={[styles.value, { color: theme.text }]}>
              {game.studio}
            </Text>
          </View>

          <View style={[styles.infoCard, { backgroundColor: theme.card }]}>
            <Text style={styles.label}>{t("label_rating")}</Text>
            <View style={styles.ratingRow}>
              <Text style={[styles.ratingValue, { color: theme.text }]}>
                {game.rating}
              </Text>
              <Ionicons
                name="star"
                size={30}
                color={theme.accent}
                style={{ marginLeft: 10 }}
              />
            </View>
          </View>

          {isOwner && (
            <View style={styles.actions}>
              <AnimatedBtn
                style={[
                  styles.btnEdit,
                  {
                    backgroundColor: theme.card,
                    borderColor: theme.accent,
                    borderWidth: 1,
                  },
                ]}
                onPress={() => navigation.navigate("Edit", { game })}
              >
                <Text style={[styles.btnText, { color: theme.accent }]}>
                  {t("edit_btn").toUpperCase()}
                </Text>
              </AnimatedBtn>

              <AnimatedBtn style={styles.btnDelete} onPress={handleDelete}>
                <Text style={styles.btnTextDelete}>
                  {t("delete_btn").toUpperCase()}
                </Text>
              </AnimatedBtn>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  imageContainer: { height: 350, justifyContent: "flex-end" },
  heroImage: { ...StyleSheet.absoluteFillObject, width: "100%", height: 350 },
  backBtn: {
    position: "absolute",
    top: 50,
    left: 20,
    zIndex: 10,
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 8,
    borderRadius: 15,
  },
  heroOverlay: { ...StyleSheet.absoluteFillObject },
  heroTitle: {
    color: "white",
    fontSize: 32,
    fontWeight: "900",
    textAlign: "center",
    paddingHorizontal: 25,
    letterSpacing: 2,
    marginBottom: 10,
  },
  content: { padding: 25 },
  infoCard: { padding: 25, borderRadius: 25, marginBottom: 15, elevation: 5 },
  label: {
    color: "#777",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 2,
    marginBottom: 8,
  },
  value: { fontSize: 24, fontWeight: "800" },
  ratingRow: { flexDirection: "row", alignItems: "center" },
  ratingValue: { fontSize: 44, fontWeight: "900" },
  actions: { gap: 15, marginTop: 10 },
  btnEdit: { padding: 20, borderRadius: 20, alignItems: "center" },
  btnDelete: {
    padding: 20,
    borderRadius: 20,
    backgroundColor: "rgba(255, 68, 68, 0.1)",
    alignItems: "center",
  },
  btnText: { fontSize: 14, fontWeight: "900", letterSpacing: 1 },
  btnTextDelete: {
    color: "#FF4444",
    fontSize: 14,
    fontWeight: "900",
    letterSpacing: 1,
  },
});
