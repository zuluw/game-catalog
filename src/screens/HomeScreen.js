import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
  LayoutAnimation,
  Dimensions,
} from "react-native";
import { useIsFocused } from "@react-navigation/native";
import { getGames, getStudiosSummary } from "../database/db";
import { useAppTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useTranslation } from "react-i18next";
import AddGameScreen from "./AddGameScreen";

const { width } = Dimensions.get("window");

export default function HomeScreen({ navigation }) {
  const { t } = useTranslation();
  const { isDarkMode } = useAppTheme();
  const { user } = useAuth();
  const isFocused = useIsFocused();

  const [activeTab, setActiveTab] = useState("games");
  const [games, setGames] = useState([]);
  const [studios, setStudios] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalVisible, setModalVisible] = useState(false);

  const searchAnim = useRef(new Animated.Value(width * 0.6)).current;

  useEffect(() => {
    if (isFocused) loadData();
  }, [isFocused]);

  const loadData = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setGames(getGames());
    setStudios(getStudiosSummary());
  };

  const onSearchFocus = () => {
    Animated.spring(searchAnim, {
      toValue: width - 40,
      useNativeDriver: false,
    }).start();
  };

  const onSearchBlur = () => {
    if (searchQuery === "") {
      Animated.spring(searchAnim, {
        toValue: width * 0.6,
        useNativeDriver: false,
      }).start();
    }
  };

  const theme = isDarkMode
    ? {
        bg: "#0A0A0A",
        card: "#1A1A1A",
        text: "#FFFFFF",
        subText: "#777",
        accent: "#FF8C00",
      }
    : {
        bg: "#F2F2F7",
        card: "#FFFFFF",
        text: "#000000",
        subText: "#8E8E93",
        accent: "#F50",
      };

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={[styles.logo, { color: theme.text }]}>
            {t("home_title").toUpperCase()}
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate("Settings")}>
            <Ionicons
              name="person-circle-outline"
              size={32}
              color={theme.accent}
            />
          </TouchableOpacity>
        </View>

        <Animated.View
          style={[
            styles.searchBar,
            { width: searchAnim, backgroundColor: theme.card },
          ]}
        >
          <Ionicons name="search" size={18} color={theme.subText} />
          <TextInput
            placeholder={t("search_placeholder")}
            placeholderTextColor={theme.subText}
            style={[styles.searchInput, { color: theme.text }]}
            onFocus={onSearchFocus}
            onBlur={onSearchBlur}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </Animated.View>

        <View style={[styles.tabBar, { backgroundColor: theme.card }]}>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === "games" && { backgroundColor: theme.accent },
            ]}
            onPress={() => setActiveTab("games")}
          >
            <Text
              style={[
                styles.tabText,
                { color: activeTab === "games" ? "#fff" : theme.subText },
              ]}
            >
              {t("tab_games").toUpperCase()}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === "studios" && { backgroundColor: theme.accent },
            ]}
            onPress={() => setActiveTab("studios")}
          >
            <Text
              style={[
                styles.tabText,
                { color: activeTab === "studios" ? "#fff" : theme.subText },
              ]}
            >
              {t("tab_studios").toUpperCase()}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={
          activeTab === "games"
            ? games.filter((g) =>
                g.title.toLowerCase().includes(searchQuery.toLowerCase()),
              )
            : studios
        }
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.card, { backgroundColor: theme.card }]}
            onPress={() =>
              activeTab === "games" &&
              navigation.navigate("Details", { game: item })
            }
          >
            <View style={{ flex: 1 }}>
              <Text
                style={[styles.cardTitle, { color: theme.text }]}
                numberOfLines={1}
              >
                {item.title || item.name}
              </Text>
              <Text style={[styles.cardSub, { color: theme.subText }]}>
                {item.studio || `${t("tab_games")}: ${item.gamesCount}`}
              </Text>
            </View>
            <View style={[styles.ratingWrap, { backgroundColor: theme.bg }]}>
              <Text style={[styles.ratingText, { color: theme.accent }]}>
                {item.rating || item.avgRating}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      />

      {user && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => setModalVisible(true)}
        >
          <LinearGradient
            colors={[theme.accent, "#FF8C00"]}
            style={styles.fabGradient}
          >
            <Ionicons name="add" size={32} color="white" />
          </LinearGradient>
        </TouchableOpacity>
      )}

      <AddGameScreen
        isVisible={isModalVisible}
        onClose={() => setModalVisible(false)}
        onRefresh={loadData}
        theme={theme}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingTop: 60, paddingHorizontal: 20, marginBottom: 10 },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  logo: { fontSize: 26, fontWeight: "900", letterSpacing: 2 },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    height: 45,
    borderRadius: 20,
    paddingHorizontal: 15,
    marginBottom: 20,
  },
  searchInput: { flex: 1, marginLeft: 10, fontWeight: "600" },
  tabBar: { flexDirection: "row", borderRadius: 25, padding: 5 },
  tab: { flex: 1, paddingVertical: 10, alignItems: "center", borderRadius: 20 },
  tabText: { fontWeight: "900", fontSize: 12 },
  card: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderRadius: 25,
    marginBottom: 12,
  },
  cardTitle: { fontSize: 18, fontWeight: "800" },
  cardSub: {
    fontSize: 12,
    fontWeight: "600",
    marginTop: 4,
    textTransform: "uppercase",
  },
  ratingWrap: {
    width: 45,
    height: 45,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 15,
  },
  ratingText: { fontWeight: "900", fontSize: 16 },
  fab: {
    position: "absolute",
    bottom: 30,
    right: 25,
    width: 65,
    height: 65,
    borderRadius: 25,
    elevation: 10,
  },
  fabGradient: {
    flex: 1,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
});
