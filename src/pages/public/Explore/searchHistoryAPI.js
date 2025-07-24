// API helper for search history (backend)
import axios from "axios";
import csrfTokenManager from "../../../utils/csrfToken";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

export async function saveSearchHistoryBackend({ searchTerm, filters, token }) {
  await csrfTokenManager.getToken();
  return axios.post(
    `${API_BASE_URL}/api/search-history`,
    { searchTerm, filters },
    {
      withCredentials: true,
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    }
  );
}

export async function getSearchHistoryBackend(token) {
  await csrfTokenManager.getToken();
  const res = await axios.get(`${API_BASE_URL}/api/search-history`, {
    withCredentials: true,
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  return res.data;
}
