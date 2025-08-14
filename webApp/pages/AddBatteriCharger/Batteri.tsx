import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Batteri.css";

// email: batteri@gmail.com
// password: battericharger

export default function Batteri() {
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      navigate("/", { replace: true });
      return;
    }

    const email = (localStorage.getItem("email") || "").toLowerCase();
    const firstName = localStorage.getItem("firstName") || "";
    const lastName = localStorage.getItem("lastName") || "";

    const isBatteriUser = email === "batteri@gmail.com";
    const isAdmin =
      firstName === "admin" &&
      lastName === "master" &&
      email === "adminmaster@gmail.com";

    const allowed = isBatteriUser || isAdmin;
    setHasAccess(allowed);

    if (!allowed) {
      navigate("/Home", { replace: true });
    }
  }, [navigate]);

  if (hasAccess === null) return null;
  if (!hasAccess) return null;

  return <div style={{ color: "red" }}>Add a Battery Charger</div>;
}
