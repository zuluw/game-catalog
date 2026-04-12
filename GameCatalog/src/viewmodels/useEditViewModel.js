import { useState } from "react";
import * as ImagePicker from "expo-image-picker";
import { updateGameInCloud } from "../models/firebase";
import { uploadImage, deleteImageFromCloud } from "../services/ImageService";
import { useTranslation } from "react-i18next";
import { useAppTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";

export const useEditViewModel = (game, navigation) => {
  const { t } = useTranslation();
  const { isDarkMode } = useAppTheme();
  const { user } = useAuth();

  const [title, setTitle] = useState(game.title);
  const [studio, setStudio] = useState(game.studio);
  const [rating, setRating] = useState(game.rating.toString());
  const [image, setImage] = useState(game.image || "");
  const [isSaving, setIsSaving] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 0.5,
    });
    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (title.trim() && studio.trim()) {
      setIsSaving(true);
      try {
        let finalRating = parseFloat(rating) || 0;

        let cloudImageUrl = game.image;
        let currentImageId = game.image_id;

        if (image && image !== game.image && !image.startsWith("http")) {
          if (game.image_id) {
            console.log("Deleting the old image from ImageKit...");
            await deleteImageFromCloud(game.image_id);
          }

          const uploadResult = await uploadImage(image);
          cloudImageUrl = uploadResult.url;
          currentImageId = uploadResult.fileId;
        }

        const cloudData = {
          title: title,
          studio: studio,
          rating: finalRating,
          image: cloudImageUrl,
          image_id: currentImageId,
          owner_id: user?.id || null,
          updatedAt: new Date().toISOString(),
        };

        await updateGameInCloud(game.firebase_id || game.title, cloudData);

        navigation.popToTop();
      } catch (e) {
        console.error("Edit handleSave Error:", e);
        alert("Error saving changes");
      } finally {
        setIsSaving(false);
      }
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
    pickImage,
    handleSave,
    isSaving,
    theme,
    t,
  };
};
