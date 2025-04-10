import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import fetchWithToken from "./fetchWithToken";
import { useLogout } from "./useLogout";


const useAuth = () => {
  const navigate = useNavigate();
  const { logout } = useLogout(); 


  useEffect(() => {
    const checkAccessToken = async () => {
      const accessToken = localStorage.getItem("accessToken");

      if (!accessToken) {
        logout();
        return;
      }

      try {
        const response = await fetchWithToken(`auth/verifyAccessToken`, {
          method: "GET",
        });

        if (!response.ok) {
          console.error("Access token verification failed");
          
          const refreshResponse = await fetchWithToken("auth/refresh", {
            method: "POST",
            body: JSON.stringify({
              refreshToken: localStorage.getItem("refreshToken"),
            }),
          });

          if (refreshResponse.ok) {
            const { accessToken: newAccessToken, refreshToken: newRefreshToken } = await refreshResponse.json();
            localStorage.setItem("accessToken", newAccessToken);
            localStorage.setItem("refreshToken", newRefreshToken);

          } else {
            console.error("Failed to refresh token");
            logout();
          }
        }
      } catch (error) {
        console.error(
          "Error during access token verification or refresh:",
          error
        );
        navigate("/", { replace: true });
      }
    };

    checkAccessToken();
  }, []);
};

export default useAuth;
