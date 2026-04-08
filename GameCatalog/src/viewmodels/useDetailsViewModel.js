import { useState } from "react";
import { Alert } from "react-native";
import { deleteGame as dbDeleteGame } from "../models/db";
import { deleteGameFromCloud } from "../models/firebase";
import { deleteImageFromCloud } from "../services/ImageService";
import { useAppTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";

export const useDetailsViewModel = (game, navigation) => {
  const { isDarkMode } = useAppTheme();
  const { user } = useAuth();
  const { t } = useTranslation();

  const [modal, setModal] = useState({
    visible: false,
    type: "success",
    title: "",
    message: "",
  });

  const isOwner = user && game.owner_id === user.id;

  const gameImg =
    game.image || game.background_image
      ? { uri: game.image || game.background_image }
      : {
          uri: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=500",
        };

  const handleDelete = () => {
    Alert.alert(t("delete_btn"), t("delete_confirm"), [
      { text: t("cancel_btn"), style: "cancel" },
      {
        text: t("delete_btn"),
        style: "destructive",
        onPress: async () => {
          try {
            if (game.image_id) {
              await deleteImageFromCloud(game.image_id);
            }

            dbDeleteGame(game.id);

            await deleteGameFromCloud(game.firebase_id || game.title, user?.id);

            setModal({
              visible: true,
              type: "success",
              title: t("success"),
              message: t("msg_pass_ok"),
            });
          } catch (e) {
            console.error("Error during complete deletion:", e);
            alert("An error occurred while deleting data from the cloud.");
          }
        },
      },
    ]);
  };

  const handleCloseModal = () => {
    setModal({ ...modal, visible: false });
    navigation.goBack();
  };

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

  return {
    isOwner,
    gameImg,
    handleDelete,
    handleCloseModal,
    modal,
    theme,
    t,
  };
};
