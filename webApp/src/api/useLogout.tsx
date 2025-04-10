import { useNavigate } from "react-router-dom";


export const useLogout = () => {
  const navigate = useNavigate();

  const logout = async (): Promise<{ message?: string; error?: string }> => {
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) {
      return { error: "No refresh token found" };
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/auth/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        throw new Error(`Logout failed with status: ${response.status}`);
      }

      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("userId");
      localStorage.clear();

      console.log("Logout successful");
      navigate("/", { replace: true });
      return { message: "Logout successful" };
    } catch (error) {
      console.error("Error during logout:", error);
      alert("Logout failed. Please try again later.");

      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.clear();
      navigate("/", { replace: true });

      ////add also if cancel refresh token so i can press logout and it will be logged out

      if (error instanceof Error) {
        return { error: error.message || "Logout failed" };
      } else {
        return { error: "Logout failed" };
      }
    }
  };

  return { logout };
};

export default useLogout;
