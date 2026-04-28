import axios from "axios";
import { prodPath } from "@/utils/routes";
import useAuthStore from "@/store/store";
const BASE = prodPath;

const fetcher = async (url) => {
  try {
    // .getState() works outside React components — no hook needed
      const user = useAuthStore.getState().user;
        let token;
        if (user && user.jwtToken) {
            token = user.jwtToken;
        }

    const res = await axios.get(`${BASE}${url}`, {
      headers: {
        ...(token && { authorization: `Bearer ${token}` }),
      },
    });

    return res.data;
  } catch (err) {
    const serverMessage = err.response?.data?.message;
    const error = new Error(serverMessage || err.message);
    error.status = err.response?.status;
    error.info = err.response?.data;
    throw error;
  }
};

export default fetcher;