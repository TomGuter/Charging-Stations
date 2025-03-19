import fetchWithToken from "./fetchWithToken";




const apiClient = async (url: string, options: RequestInit = {}) => {
  try {
    const response = await fetchWithToken(url, {
      ...options,
      credentials: "include", 
    });

    if (!response.ok) {
      throw new Error(`Request failed with status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("API request error:", error);
    throw error;
  }
};












  

export default apiClient;
