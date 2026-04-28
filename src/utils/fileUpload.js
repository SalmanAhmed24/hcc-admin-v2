import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
// 
export const uploadFiles = async (files, category = "general") => {
  try {
    const formData = new FormData();
    
    files.forEach((file) => {
      formData.append("files", file);
    });
    
    formData.append("category", category);

    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

    const response = await axios.post(`${API_BASE_URL}/api/upload`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: token ? `Bearer ${token}` : "",
      },
    });

    return response.data;
  } catch (error) {
    console.error("File upload error:", error);
    throw new Error(error.response?.data?.message || "Failed to upload files");
  }
};


export const uploadFile = async (file, category = "general") => {
  const result = await uploadFiles([file], category);
  return result.files[0];
};

export const deleteFile = async (fileUrl) => {
  try {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

    const response = await axios.delete(`${API_BASE_URL}/api/upload`, {
      data: { fileUrl },
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
    });

    return response.data;
  } catch (error) {
    console.error("File delete error:", error);
    throw new Error(error.response?.data?.message || "Failed to delete file");
  }
};