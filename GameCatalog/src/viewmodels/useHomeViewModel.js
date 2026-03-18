import { useState, useCallback, useEffect } from "react";
import NetInfo from "@react-native-community/netinfo";
import {
  getGames,
  getStudiosSummary,
  saveApiCache,
  getApiCache,
} from "../models/db";
import { fetchPopularGames } from "../models/api";
import { LayoutAnimation } from "react-native";

const GENRES = [
  { id: null, name: "All" },
  { id: "4", name: "Action" },
  { id: "51", name: "Indie" },
  { id: "5", name: "RPG" },
  { id: "3", name: "Adventure" },
  { id: "7", name: "Puzzle" },
];

export const useHomeViewModel = (isFocused) => {
  const [activeTab, setActiveTab] = useState("games");
  const [localGames, setLocalGames] = useState([]);
  const [studios, setStudios] = useState([]);
  const [globalGames, setGlobalGames] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isOffline, setIsOffline] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [selectedGenre, setSelectedGenre] = useState(null);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOffline(!state.isConnected);
    });
    return () => unsubscribe();
  }, []);

  const loadData = useCallback(async () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsLoading(true);

    setLocalGames(getGames());
    setStudios(getStudiosSummary());

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
      setGlobalGames(getApiCache());
    } finally {
      setIsLoading(false);
    }
  }, [selectedGenre]);

  useEffect(() => {
    if (isFocused) loadData();
  }, [isFocused, loadData]);

  useEffect(() => {
    if (activeTab === "global") {
      loadData();
    }
  }, [selectedGenre]);

  const getFilteredData = () => {
    const query = searchQuery.toLowerCase();
    if (activeTab === "games") {
      return localGames.filter((g) => g.title.toLowerCase().includes(query));
    }
    if (activeTab === "studios") {
      return studios;
    }
    return globalGames.filter(
      (g) =>
        g.title?.toLowerCase().includes(query) ||
        g.name?.toLowerCase().includes(query),
    );
  };

  return {
    data: getFilteredData(),
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
  };
};
