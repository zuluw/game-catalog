import { useState } from "react";
import { addGame as dbAddGame } from "../models/db";

export const useAddGameViewModel = (user, onClose, onRefresh) => {
  const [title, setTitle] = useState("");
  const [studio, setStudio] = useState("");
  const [rating, setRating] = useState("");
  const [image, setImage] = useState("");

  const handleSave = () => {
    if (title.trim() && studio.trim() && user) {
      let finalRating = parseFloat(rating) || 0;

      if (finalRating > 5) finalRating = 5;
      if (finalRating < 0) finalRating = 0;

      dbAddGame(title, studio, finalRating, image, user.id);

      setTitle("");
      setStudio("");
      setRating("");
      setImage("");

      onClose();
      onRefresh();
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
    handleSave,
  };
};
