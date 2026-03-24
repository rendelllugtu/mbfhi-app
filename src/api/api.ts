import axios from "axios";

const API_URL = "https://script.google.com/macros/s/AKfycbym0LAx4iNavnOwbq0OVub0CG200KYCW6lI-27Axw0hlIKaDiX3FN_00bsdx6t1IQTC/exec";

export const apiCall = async <T>(
  action: string,
  payload: Record<string, unknown> = {}
): Promise<T> => {
  const formData = new URLSearchParams();
  formData.append("data", JSON.stringify({ action, ...payload }));

  const res = await axios.post(API_URL, formData.toString(), {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });

  return res.data as T; // 🔥 IMPORTANT
};