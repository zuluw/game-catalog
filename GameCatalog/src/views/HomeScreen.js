import React, { useRef } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  ActivityIndicator,
  ScrollView,
  StatusBar,
} from "react-native";
import { useIsFocused } from "@react-navigation/native";
import { useAppTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useTranslation } from "react-i18next";
import AddGameScreen from "./AddGameScreen";
import { useHomeViewModel } from "../viewmodels/useHomeViewModel";

const { width } = Dimensions.get("window");

export default function HomeScreen({ navigation }) {
  const { t } = useTranslation();
  const { isDarkMode } = useAppTheme();
  const { user } = useAuth(); 
  const isFocused = useIsFocused();
  const [isModalVisible, setModalVisible] = React.useState(false);

  const {
    data,
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    isOffline,
    isLoading,
    loadData,
    genres,
    selectedGenre,
    setSelectedGenre,
    sortBy,
    toggleSort,
  } = useHomeViewModel(isFocused);

  const searchAnim = useRef(new Animated.Value(width * 0.6)).current;

  const onSearchFocus = () =>
    Animated.spring(searchAnim, {
      toValue: width - 40,
      useNativeDriver: false,
    }).start();

  const onSearchBlur = () => {
    if (searchQuery === "")
      Animated.spring(searchAnim, {
        toValue: width * 0.6,
        useNativeDriver: false,
      }).start();
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

  const tabs = user
    ? ["games", "studios", "global", "notif"]
    : ["games", "studios", "global"];

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />

      {isOffline && (
        <View style={styles.offlineBanner}>
          <Text style={styles.offlineText}>{t("offline_mode")}</Text>
        </View>
      )}

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

        <View style={styles.searchRow}>
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
        </View>

        {activeTab !== "studios" && activeTab !== "notif" && (
          <View style={styles.sortContainer}>
            {[
              { id: "title", icon: "text", label: "sort_title" },
              { id: "rating", icon: "star", label: "sort_rating" },
              { id: "date", icon: "calendar", label: "sort_date" },
            ].map((item) => (
              <TouchableOpacity
                key={item.id}
                onPress={() => toggleSort(item.id)}
                style={[
                  styles.sortBtn,
                  { backgroundColor: theme.card },
                  sortBy === item.id && {
                    borderColor: theme.accent,
                    borderWidth: 1,
                  },
                ]}
              >
                <Ionicons
                  name={item.icon}
                  size={14}
                  color={sortBy === item.id ? theme.accent : theme.subText}
                />
                <Text
                  style={[
                    styles.sortBtnText,
                    { color: sortBy === item.id ? theme.text : theme.subText },
                  ]}
                >
                  {t(item.label)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={[styles.tabBar, { backgroundColor: theme.card }]}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[
                styles.tab,
                activeTab === tab && { backgroundColor: theme.accent },
              ]}
              onPress={() => setActiveTab(tab)}
            >
              <Text
                style={[
                  styles.tabText,
                  { color: activeTab === tab ? "#fff" : theme.subText },
                ]}
              >
                {t(`tab_${tab}`).toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {activeTab === "global" && (
        <View style={styles.genreFilter}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {genres.map((genre) => (
              <TouchableOpacity
                key={genre.id}
                style={[
                  styles.genreBtn,
                  { backgroundColor: theme.card },
                  selectedGenre === genre.id && {
                    backgroundColor: theme.accent,
                  },
                ]}
                onPress={() => setSelectedGenre(genre.id)}
              >
                <Text
                  style={[
                    styles.genreText,
                    {
                      color:
                        selectedGenre === genre.id ? "#fff" : theme.subText,
                    },
                  ]}
                >
                  {t(genre.name).toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {isLoading ? (
        <ActivityIndicator
          size="large"
          color={theme.accent}
          style={{ marginTop: 50 }}
        />
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item, index) => index.toString()}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}
          refreshing={isLoading}
          onRefresh={loadData}
          ListEmptyComponent={
            activeTab === "notif" ? (
              <Text style={[styles.emptyText, { color: theme.subText }]}>
                {t("no_notif")}
              </Text>
            ) : (
              <Text
                style={[
                  styles.emptyText,
                  { color: theme.subText, marginTop: 40 },
                ]}
              >
                {activeTab === "games" ? "No games found" : ""}
              </Text>
            )
          }
          renderItem={({ item }) => {
            if (activeTab === "notif") {
              return (
                <View
                  style={[
                    styles.card,
                    {
                      backgroundColor: theme.card,
                      borderLeftWidth: 4,
                      borderLeftColor: theme.accent,
                    },
                  ]}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.cardTitle, { color: theme.text }]}>
                      {item.title}
                    </Text>
                    <Text
                      style={[
                        styles.cardSub,
                        { color: theme.subText, textTransform: "none" },
                      ]}
                    >
                      {item.body}
                    </Text>
                    <Text style={[styles.notifDate, { color: theme.accent }]}>
                      {t("notif_received")}: {item.date}
                    </Text>
                  </View>
                </View>
              );
            }

            return (
              <TouchableOpacity
                style={[styles.card, { backgroundColor: theme.card }]}
                on
                onPress={() =>
                  activeTab !== "studios" &&
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
                    {item.studio ||
                      (activeTab === "studios"
                        ? `${t("tab_games")}: ${item.gamesCount}`
                        : item.released)}
                  </Text>
                </View>
                <View
                  style={[styles.ratingWrap, { backgroundColor: theme.bg }]}
                >
                  <Text style={[styles.ratingText, { color: theme.accent }]}>
                    {item.rating || item.avgRating}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}

      {user && activeTab === "games" && (
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
  offlineBanner: {
    backgroundColor: "#FF4444",
    padding: 5,
    paddingTop: 45,
    alignItems: "center",
  },
  offlineText: { color: "white", fontSize: 10, fontWeight: "bold" },
  header: { paddingTop: 60, paddingHorizontal: 20, marginBottom: 10 },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  logo: { fontSize: 26, fontWeight: "900", letterSpacing: 2 },
  searchRow: { marginBottom: 15 },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    height: 45,
    borderRadius: 20,
    paddingHorizontal: 15,
  },
  searchInput: { flex: 1, marginLeft: 10, fontWeight: "600" },
  sortContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    gap: 8,
  },
  sortBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    borderRadius: 12,
    gap: 5,
  },
  sortBtnText: { fontSize: 10, fontWeight: "bold" },
  tabBar: { flexDirection: "row", borderRadius: 25, padding: 5 },
  tab: { flex: 1, paddingVertical: 10, alignItems: "center", borderRadius: 20 },
  tabText: { fontWeight: "900", fontSize: 12 },
  genreFilter: { marginBottom: 15, paddingLeft: 20 },
  genreBtn: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 15,
    marginRight: 10,
  },
  genreText: { fontSize: 10, fontWeight: "900", letterSpacing: 1 },
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
  notifDate: {
    fontSize: 10,
    fontWeight: "bold",
    marginTop: 8,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 50,
    fontSize: 14,
    fontWeight: "bold",
  },
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
