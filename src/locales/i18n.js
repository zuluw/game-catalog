import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";
import en from "./translations/en.json";
import ru from "./translations/ru.json";

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    ru: { translation: ru },
  },
  lng: "en",
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

export const loadSavedLanguage = async () => {
  const savedLang = await AsyncStorage.getItem("user-language");
  if (savedLang) {
    await i18n.changeLanguage(savedLang);
  }
};

export default i18n;
