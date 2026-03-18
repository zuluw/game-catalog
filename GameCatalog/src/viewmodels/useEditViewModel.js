import { useState } from "react";
import { updateGame as dbUpdateGame } from "../models/db";
import { useTranslation } from "react-i18next";
import { useAppTheme } from "../context/ThemeContext";

export const useEditViewModel = (game, navigation) => {
  const { t } = useTranslation();
  const { isDarkMode } = useAppTheme();

  const [title, setTitle] = useState(game.title);
  const [studio, setStudio] = useState(game.studio);
  const [rating, setRating] = useState(game.rating.toString());
  const [image, setImage] = useState(game.image || "");

  const handleSave = () => {
    if (title.trim() && studio.trim()) {
      let finalRating = parseFloat(rating) || 0;

      if (finalRating > 5) finalRating = 5;
      if (finalRating < 0) finalRating = 0;

      dbUpdateGame(game.id, title, studio, finalRating, image);
      navigation.popToTop();
    }
  };

  const theme = isDarkMode
    ? {
        bg: "#0A0A0A",
        card: "#1A1A1A",
        text: "#FFFFFF",
        accent: "#FF8C00",
        input: "#121212",
      }
    : {
        bg: "#F2F2F7",
        card: "#FFFFFF",
        text: "#000000",
        accent: "#F50",
        input: "#F2F2F7",
      };

  return {
    title,
    setTitle,
    studio,
    setStudio,
    rating,
    setRating,
    image,
    setImage,
    handleSave,
    theme,
    t,
  };
};
