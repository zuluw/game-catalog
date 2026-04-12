import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Image,
  ActivityIndicator,
  StyleSheet,
  StatusBar,
  Text,
  TouchableOpacity,
} from "react-native";
import * as SplashScreen from "expo-splash-screen";
import * as Notifications from "expo-notifications";
import * as LocalAuthentication from "expo-local-authentication";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";

import {
  NavigationContainer,
  DefaultTheme,
  DarkTheme,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { ThemeProvider, useAppTheme } from "./src/context/ThemeContext";
import { AuthProvider, useAuth } from "./src/context/AuthContext";
import { initDB, addNotificationRecord } from "./src/models/db";
import { loadSavedLanguage } from "./src/locales/i18n";

import "./src/models/firebase";

import HomeScreen from "./src/views/HomeScreen";
import DetailsScreen from "./src/views/DetailsScreen";
import SettingsScreen from "./src/views/SettingsScreen";
import EditScreen from "./src/views/EditScreen";
import AuthScreen from "./src/views/AuthScreen";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

SplashScreen.preventAutoHideAsync().catch(() => {});
const Stack = createNativeStackNavigator();

function AppNavigator({ onReady, isUnlocked, requestUnlock }) {
  const { isDarkMode } = useAppTheme();
  const { user, isGuest, isLoading } = useAuth();

  useEffect(() => {
    const receivedSub = Notifications.addNotificationReceivedListener(
      (notification) => {
        const { title, body } = notification.request.content;
        addNotificationRecord(title, body, user?.id);
      },
    );

    const responseSub = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const { title, body } = response.notification.request.content;
        addNotificationRecord(title, body, user?.id);
      },
    );

    return () => {
      receivedSub.remove();
      responseSub.remove();
    };
  }, [user]);

  if (isLoading) {
    return (
      <View
        style={[
          styles.loadingContainer,
          { backgroundColor: isDarkMode ? "#0A0A0A" : "#F2F2F7" },
        ]}
        onLayout={onReady}
      >
        <ActivityIndicator size="large" color="#FF8C00" />
      </View>
    );
  }

  if (!isUnlocked) {
    return (
      <View
        style={[styles.loadingContainer, { backgroundColor: "#0A0A0A" }]}
        onLayout={onReady}
      >
        <Ionicons name="finger-print" size={80} color="#FF8C00" />
        <Text
          style={{
            color: "white",
            marginTop: 20,
            fontSize: 16,
            fontWeight: "bold",
          }}
        >
          APP LOCKED
        </Text>
        <TouchableOpacity style={styles.unlockBtn} onPress={requestUnlock}>
          <Text style={{ color: "white", fontWeight: "900" }}>UNLOCK</Text>
        </TouchableOpacity>
      </View>
    );
  }

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
  const [isUnlocked, setIsUnlocked] = useState(false);

  const handleBiometricAuth = async () => {
    try {
      const isBioEnabled = await AsyncStorage.getItem("biometrics-enabled");
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();

      if (isBioEnabled === "true" && hasHardware && isEnrolled) {
        const result = await LocalAuthentication.authenticateAsync({
          promptMessage: "Authenticate to enter Game Catalog",
          fallbackLabel: "Use Passcode",
          disableDeviceFallback: false,
        });

        if (result.success) {
          setIsUnlocked(true);
        } else {
          setIsUnlocked(false);
        }
      } else {
        setIsUnlocked(true);
      }
    } catch (e) {
      console.error(e);
      setIsUnlocked(true);
    }
  };

  useEffect(() => {
    async function prepare() {
      try {
        await initDB();
        await loadSavedLanguage();
        await handleBiometricAuth();
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
        <AppNavigator
          onReady={onLayoutRootView}
          isUnlocked={isUnlocked}
          requestUnlock={handleBiometricAuth}
        />
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
  unlockBtn: {
    marginTop: 30,
    backgroundColor: "#FF8C00",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 15,
  },
});
