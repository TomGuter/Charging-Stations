import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import fetchWithToken from "./fetchWithToken";
import { useLogout } from "./useLogout";

interface AuthContextType {
  isAuthenticated: boolean;
  checkAuth: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode; 
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const navigate = useNavigate();
  const { logout } = useLogout();

  useEffect(() => {
    const checkAccessToken = async () => {
      const accessToken = localStorage.getItem("accessToken");

      if (!accessToken) {
        setIsAuthenticated(false);
        logout();
        return;
      }

      try {
        const response = await fetchWithToken("auth/verifyAccessToken", {
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
            setIsAuthenticated(true);
          } else {
            console.error("Failed to refresh token");
            setIsAuthenticated(false);
            logout();
          }
        } else {
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error("Error during access token verification or refresh:", error);
        setIsAuthenticated(false);
        navigate("/", { replace: true });
      }
    };

    checkAccessToken();


  }, [logout, navigate]);

  const checkAuth = () => isAuthenticated;

  return (
    <AuthContext.Provider value={{ isAuthenticated, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};
