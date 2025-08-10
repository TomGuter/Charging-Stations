import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Batteri.css"; 

// email: battei@gmail.com
// password: battericharger

export default function Batteri() {
  const [isBatteriUser, setIsBatteriUser] = useState<boolean | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      navigate("/", { replace: true });
      return;
    }

    const email = localStorage.getItem("email");
    const allowed = email === "batteri@gmail.com";
    setIsBatteriUser(allowed);

    if (!allowed) {
      navigate("/home", { replace: true }); 
    }
  }, [navigate]);

  if (isBatteriUser === null) return null;
  if (!isBatteriUser) return null;

  return <div style={{ color: "red" }}>Add a Battery Charger</div>;
}
