import axios from "axios";

const API_KEY = "d0f8b19196dc4bdea8f64af944eec2aa";
const BASE_URL = "https://api.rawg.io/api";

export const fetchPopularGames = async (genreId = null) => {
  try {
    const params = {
      key: API_KEY,
      page_size: 15,
      ordering: "-rating",
    };

    if (genreId) {
      params.genres = genreId;
    }

    const response = await axios.get(`${BASE_URL}/games`, { params });
    return response.data.results;
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};
