// src/lib/apiClient.js

import axios from "axios";
import useAuthStore from "@/store/store";

const apiClient = axios.create();

apiClient.interceptors.request.use((config) => {
  const user = useAuthStore.getState().user;
  const token = user?.jwtToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;