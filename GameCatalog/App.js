import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Image,
  ActivityIndicator,
  StyleSheet,
  StatusBar,
} from "react-native";
import * as SplashScreen from "expo-splash-screen";
import {
  NavigationContainer,
  DefaultTheme,
  DarkTheme,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { ThemeProvider, useAppTheme } from "./src/context/ThemeContext";
import { AuthProvider, useAuth } from "./src/context/AuthContext";
import { initDB } from "./src/models/db";
import { loadSavedLanguage } from "./src/locales/i18n";

import HomeScreen from "./src/views/HomeScreen";
import DetailsScreen from "./src/views/DetailsScreen";
import SettingsScreen from "./src/views/SettingsScreen";
import EditScreen from "./src/views/EditScreen";
import AuthScreen from "./src/views/AuthScreen";

SplashScreen.preventAutoHideAsync().catch(() => {});

const Stack = createNativeStackNavigator();

function AppNavigator({ onReady }) {
  const { isDarkMode } = useAppTheme();
  const { user, isGuest } = useAuth();

  if (!user && !isGuest) {
    return <AuthScreen onReady={onReady} />;
  }

  return (
    <View style={styles.flex} onLayout={onReady}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
      <NavigationContainer theme={isDarkMode ? DarkTheme : DefaultTheme}>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Details" component={DetailsScreen} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
          <Stack.Screen name="Edit" component={EditScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </View>
  );
}

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        await initDB();
        await loadSavedLanguage();
        await new Promise((resolve) => setTimeout(resolve, 2000));
      } catch (e) {
        console.warn(e);
      } finally {
        setAppIsReady(true);
      }
    }
    prepare();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      await SplashScreen.hideAsync().catch(() => {});
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" />
        <Image
          source={require("./assets/splash-icon.png")}
          style={styles.splashImage}
          resizeMode="contain"
        />
        <ActivityIndicator size="large" color="#FF8C00" style={styles.loader} />
      </View>
    );
  }

  return (
    <AuthProvider>
      <ThemeProvider>
        <AppNavigator onReady={onLayoutRootView} />
      </ThemeProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#0A0A0A",
    justifyContent: "center",
    alignItems: "center",
  },
  splashImage: { width: 200, height: 200 },
  loader: { marginTop: 30 },
});
