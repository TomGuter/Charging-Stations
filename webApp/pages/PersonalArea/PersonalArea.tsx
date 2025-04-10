import React, { useState, useEffect } from "react";
import "./PersonalArea.css";
import GeneralInfoHeader from "../../src/components/GeneralInfoHeader";
import ChargeInfo from "../../src/components/ChargeInfo";
import ReceivedBooking from "../../src/components/RecivedBooking";
import { Charger, User } from "../../src/types/types";
import { useNavigate } from "react-router-dom";

interface ChargeInfoRow {
  id: number;
  chargerId: string;
  Location: string;
  ChargingRate: number;
  Description: string;
  Price: number;
  picture: string;
  userId: string;
}

const PersonalArea: React.FC = () => {
  const [carBrand, setCarBrand] = useState<string>("");
  const [carYear, setCarYear] = useState<string>("");
  const [carModel, setCarModel] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [rows, setRows] = useState<ChargeInfoRow[]>([]);
  const [userInfo, setUserInfo] = useState<User | null>(null);
  const [chargers, setChargers] = useState<Charger[]>([]);

  const navigate = useNavigate();

  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      navigate("/");
      return;
    }

    const fetchData = async () => {
      const userId = localStorage.getItem("userId");
      const accessToken = localStorage.getItem("accessToken");

      if (!userId || !accessToken) {
        return;
      }

      try {
        const userResponse = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/auth/getUserById/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        if (!userResponse.ok) {
          throw new Error("Failed to fetch user information");
        }
        
        const userData = await userResponse.json();

        setUserInfo({
          firstName: userData.firstName,
          lastName: userData.lastName,
          picture: userData.picture,
          email: userData.email,
        });
      } catch (error) {
        console.error("Error fetching user information:", error);
      }

      try {
        const chargingResponse = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/addChargingStation/getChargersByUserId/chargers/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        if (!chargingResponse.ok) {
          throw new Error("Failed to fetch charging stations");
        }

        const chargingData = await chargingResponse.json();
        const chargers = chargingData.chargers.map(
          (charger: Charger, index: number) => ({
            chargerId: charger._id,
            id: `${charger._id}-${index}`,
            Location: charger.location || "Unknown",
            ChargingRate: charger.chargingRate || 0,
            Description: charger.description || "No description",
            Price: charger.price.toString(),
            picture: charger.picture || "",
            userId: charger.userId,
          })
        );
        setChargers(chargers);
        setRows(chargers);
      } catch (error) {
        console.error("Error fetching charging stations:", error);
      }
    };

    fetchData();
  }, []);

  const handleUpdateCarInfo = async () => {
    if (!carBrand || !carYear || !carModel) {
      alert("Please enter all car details.");
      return;
    }

    setLoading(true);

    try {
      const userId = localStorage.getItem("userId");
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/gemini/generate-content`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
          body: JSON.stringify({
            carBrand,
            carYear,
            carModel,
            userId,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to generate content");
      }

      alert("Car information sent successfully");
    } catch (error) {
      console.error("Error sending car information:", error);
      alert("Failed to send car information");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      {userInfo && (
        <div className="general-info">
          <GeneralInfoHeader
            name={`${userInfo.firstName} ${userInfo.lastName}`}
            Email={userInfo.email}
            picturePath={userInfo.picture}
          />
        </div>
      )}

      <div className="charge-info">
        <ChargeInfo rows={rows} />
      </div>

      <div className="car-model-section">
        <h3>Car Information</h3>
        <div className="input-group">
          <input
            type="text"
            value={carBrand}
            onChange={(e) => setCarBrand(e.target.value)}
            placeholder="Car Brand"
          />
          <input
            type="number"
            value={carYear}
            onChange={(e) => setCarYear(e.target.value)}
            placeholder="Car Year"
            min="1900"
            max={new Date().getFullYear()}
          />
          <input
            type="text"
            value={carModel}
            onChange={(e) => setCarModel(e.target.value)}
            placeholder="Car Model"
          />
        </div>
        <button
          onClick={handleUpdateCarInfo}
          disabled={loading}
          className="car-info-btn"
        >
          {loading ? "Sending..." : "Send Car Info"}
        </button>
      </div>

      <div className="received-bookings">
        <ReceivedBooking chargers={chargers} />
      </div>
    </div>
  );
};

export default PersonalArea;
