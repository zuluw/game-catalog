import { useState } from "react";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location"; 
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

  const fetchCurrentLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.log("Permission to access location was denied");
        return "Unknown Location";
      }

      let location = await Location.getCurrentPositionAsync({});

      let address = await Location.reverseGeocodeAsync(location.coords);

      if (address.length > 0) {
        const item = address[0];
        return `${item.city || item.region || "Unknown City"}, ${item.country}`;
      }
      return "Unknown Location";
    } catch (error) {
      console.error("Location error:", error);
      return "Unknown Location";
    }
  };

  const handleSave = async () => {
    if (title.trim() && studio.trim() && user) {
      setIsUploading(true);
      try {
        let finalRating = parseFloat(rating) || 0;
        if (finalRating > 5) finalRating = 5;

        const [locationName, uploadResult] = await Promise.all([
          fetchCurrentLocation(),
          uploadImage(image),
        ]);

        const cloudImageUrl = uploadResult.url || "";
        const imageKitFileId = uploadResult.fileId || null;

        const gameData = {
          title: title,
          studio: studio,
          rating: finalRating,
          image: cloudImageUrl,
          image_id: imageKitFileId,
          owner_id: user.id,
          location: locationName,
          createdAt: new Date().toISOString(),
        };

        await saveGameToCloud(gameData);

        setTitle("");
        setStudio("");
        setRating("");
        setImage("");

        onClose();
        if (onRefresh) onRefresh();
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
