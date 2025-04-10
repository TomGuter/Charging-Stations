

const fetchWithToken = async (url: string, options: RequestInit = {}) => {
    const token = localStorage.getItem("accessToken");
  
    const headers = new Headers(options.headers || {});
  
    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }

    if (options.body) {
        headers.set("Content-Type", "application/json");
    }
  
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/${url}`, {
        ...options,
        headers, 
        credentials: "include", 
      });
  
      if (response.status === 401) {
        const newToken = await refreshAccessToken();
        if (newToken) {
          localStorage.setItem("accessToken", newToken.accessToken);
            console.log("Retrying request with new token", newToken.accessToken);
          const retryResponse = await fetch(`${import.meta.env.VITE_BACKEND_URL}/${url}`, {
            ...options,
            headers: {
              ...headers,
              "authorization": `Bearer ${newToken}`, 
            },
            credentials: "include",
          });
          return retryResponse;
        } else {
          window.location.href = "/login";
        }
      }
  
      return response;
    } catch (error) {
      console.error("Error making the request:", error);
      throw error;
    }
};
  
  
  

const refreshAccessToken = async (): Promise<{ accessToken: string; refreshToken: string } | null> => {
    try {
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) {
      return null;
    }

    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/auth/refresh`, {
      method: "POST",
      credentials: "include", 
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refreshToken }), 
    });

    if (response.ok) {
      const data = await response.json();
      return {
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      };
    } else {
      console.error("Failed to refresh access token:", response.status);
      return null;
    }
  } catch (error) {
    console.error("Error refreshing token:", error);
    return null;
  }
};

export default fetchWithToken;
