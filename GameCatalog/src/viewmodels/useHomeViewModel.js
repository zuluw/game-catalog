import { useState, useCallback, useEffect, useMemo } from "react";
import { LayoutAnimation } from "react-native";
import NetInfo from "@react-native-community/netinfo";
import Fuse from "fuse.js";

import {
  getGames,
  getStudiosSummary,
  saveApiCache,
  getApiCache,
  getNotificationHistory,
  syncCloudGamesToLocal,
} from "../models/db";
import { fetchPopularGames } from "../models/api";
import { subscribeToGamesCloud } from "../models/firebase";
import { useAuth } from "../context/AuthContext";

const GENRES = [
  { id: null, name: "filter_all" },
  { id: "4", name: "Action" },
  { id: "51", name: "Indie" },
  { id: "5", name: "RPG" },
  { id: "3", name: "Adventure" },
  { id: "7", name: "Puzzle" },
];

export const useHomeViewModel = (isFocused) => {
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState("games");
  const [localGames, setLocalGames] = useState([]);
  const [studios, setStudios] = useState([]);
  const [globalGames, setGlobalGames] = useState([]);
  const [notifications, setNotifications] = useState([]);

  const [searchQuery, setSearchQuery] = useState("");
  const [isOffline, setIsOffline] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [sortBy, setSortBy] = useState("title");
  const [selectedGenre, setSelectedGenre] = useState(null);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOffline(!state.isConnected);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    let unsubscribeCloud;

    if (isFocused) {
      console.log("Starting global real-time subscription...");

      unsubscribeCloud = subscribeToGamesCloud((cloudGames) => {
        console.log("Global update received from Firebase!");

        syncCloudGamesToLocal(cloudGames);

        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

        setLocalGames(getGames());
        setStudios(getStudiosSummary());
      });
    }

    return () => {
      if (unsubscribeCloud) {
        console.log("Stopping cloud subscription...");
        unsubscribeCloud();
      }
    };
  }, [isFocused]);

  const loadData = useCallback(async () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsLoading(true);

    setLocalGames(getGames());
    setStudios(getStudiosSummary());
    setNotifications(getNotificationHistory(user?.id));

    try {
      const netState = await NetInfo.fetch();

      if (netState.isConnected) {
        const data = await fetchPopularGames(selectedGenre);
        saveApiCache(data);
        setGlobalGames(data);
      } else {
        setGlobalGames(getApiCache());
      }
    } catch (e) {
      console.error("LoadData Error:", e);
      setGlobalGames(getApiCache());
    } finally {
      setIsLoading(false);
    }
  }, [selectedGenre, user]);

  useEffect(() => {
    if (isFocused) loadData();
  }, [isFocused, loadData]);

  useEffect(() => {
    if (activeTab === "global") {
      loadData();
    }
    if (activeTab === "notif") {
      setNotifications(getNotificationHistory(user?.id));
    }
  }, [selectedGenre, activeTab, user]);

  const data = useMemo(() => {
    let result = [];

    if (activeTab === "games") result = [...localGames];
    else if (activeTab === "studios") result = [...studios];
    else if (activeTab === "global") result = [...globalGames];
    else if (activeTab === "notif") result = [...notifications];

    if (searchQuery.trim() !== "") {
      const keys =
        activeTab === "notif" ? ["title", "body"] : ["title", "name", "studio"];
      const fuse = new Fuse(result, {
        keys: keys,
        threshold: 0.3,
      });
      result = fuse.search(searchQuery).map((res) => res.item);
    }

    if (activeTab !== "notif" && activeTab !== "studios") {
      result.sort((a, b) => {
        if (sortBy === "title")
          return (a.title || a.name || "")
            .toLowerCase()
            .localeCompare((b.title || b.name || "").toLowerCase());
        if (sortBy === "rating")
          return (
            (b.rating || b.avgRating || 0) - (a.rating || a.avgRating || 0)
          );
        if (sortBy === "date")
          return new Date(b.released || 0) - new Date(a.released || 0);
        return 0;
      });
    }

    return result;
  }, [
    activeTab,
    localGames,
    globalGames,
    studios,
    notifications,
    searchQuery,
    sortBy,
  ]);

  const toggleSort = (type) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSortBy(type);
  };

  return {
    data,
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    isOffline,
    isLoading,
    loadData,
    genres: GENRES,
    selectedGenre,
    setSelectedGenre,
    sortBy,
    toggleSort,
  };
};
