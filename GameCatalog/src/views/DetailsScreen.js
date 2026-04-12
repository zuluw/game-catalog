import React, { useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useDetailsViewModel } from "../viewmodels/useDetailsViewModel";
import StatusModal from "../components/StatusModal";

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

  const {
    isOwner,
    gameImg,
    handleDelete,
    handleCloseModal,
    handleShare,
    modal,
    theme,
    t,
  } = useDetailsViewModel(game, navigation);

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

          <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
            <Ionicons name="share-social" size={24} color="white" />
          </TouchableOpacity>

          <LinearGradient
            colors={["transparent", theme.bg]}
            style={styles.heroOverlay}
          />
          <Text style={styles.heroTitle}>
            {(game.title || game.name || "").toUpperCase()}
          </Text>
        </View>

        <View style={styles.content}>
          <View style={[styles.infoCard, { backgroundColor: theme.card }]}>
            <Text style={styles.label}>{t("label_studio").toUpperCase()}</Text>
            <Text style={[styles.value, { color: theme.text }]}>
              {game.studio || t("tab_global")}
            </Text>
          </View>

          {game.location && (
            <View style={[styles.infoCard, { backgroundColor: theme.card }]}>
              <Text style={styles.label}>
                {t("label_location").toUpperCase()}
              </Text>
              <View style={styles.locationRow}>
                <Ionicons
                  name="location-sharp"
                  size={20}
                  color={theme.accent}
                />
                <Text style={[styles.locationValue, { color: theme.text }]}>
                  {game.location}
                </Text>
              </View>
            </View>
          )}

          <View style={[styles.infoCard, { backgroundColor: theme.card }]}>
            <Text style={styles.label}>{t("label_rating").toUpperCase()}</Text>
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

      <StatusModal {...modal} onClose={handleCloseModal} />
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
  shareBtn: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 10,
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 10,
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
  locationRow: { flexDirection: "row", alignItems: "center", marginTop: 5 },
  locationValue: { fontSize: 18, fontWeight: "700", marginLeft: 5 },
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
