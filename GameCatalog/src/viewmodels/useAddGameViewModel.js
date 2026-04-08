import { useState } from "react";
import * as ImagePicker from "expo-image-picker";
import { addGame as dbAddGame } from "../models/db";
import { saveGameToCloud } from "../models/firebase";
import { uploadImage } from "../services/ImageService";

export const useAddGameViewModel = (user, onClose, onRefresh) => {
  const [title, setTitle] = useState("");
  const [studio, setStudio] = useState("");
  const [rating, setRating] = useState("");
  const [image, setImage] = useState("");
  const [isUploading, setIsUploading] = useState(false);

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
    if (title.trim() && studio.trim() && user) {
      setIsUploading(true);
      try {
        let finalRating = parseFloat(rating) || 0;
        if (finalRating > 5) finalRating = 5;

        const uploadResult = await uploadImage(image);
        const cloudImageUrl = uploadResult.url || "";
        const imageKitFileId = uploadResult.fileId || null;

        const gameData = {
          title: title,
          studio: studio,
          rating: finalRating,
          image: cloudImageUrl,
          image_id: imageKitFileId,
          owner_id: user.id,
          createdAt: new Date().toISOString(),
        };

        const fbId = await saveGameToCloud(gameData);

        dbAddGame(
          title,
          studio,
          finalRating,
          cloudImageUrl,
          user.id,
          fbId,
          imageKitFileId,
        );

        setTitle("");
        setStudio("");
        setRating("");
        setImage("");

        onClose();
        onRefresh();
      } catch (e) {
        console.error("Save process error:", e);
        alert("Save Error");
      } finally {
        setIsUploading(false);
      }
    }
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
    isUploading,
  };
};
