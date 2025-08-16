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

  const [submitLoading, setSubmitLoading] = useState<boolean>(false); // button submit loading
  const [carLoading, setCarLoading] = useState<boolean>(true); // <-- spinner only for car data

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

    const userId = localStorage.getItem("userId");
    if (!userId) return;


    (async () => {
      try {
        const userResponse = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/auth/getUserById/${userId}`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        if (!userResponse.ok) throw new Error("Failed to fetch user information");
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
    })();


    (async () => {
      try {
        const chargingResponse = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/addChargingStation/getChargersByUserId/chargers/${userId}`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        if (!chargingResponse.ok) throw new Error("Failed to fetch charging stations");

        const chargingData = await chargingResponse.json();
        const mapped = chargingData.chargers.map((charger: Charger, index: number) => ({
          chargerId: charger._id,
          id: `${charger._id}-${index}` as unknown as number, // keep table key type as needed
          Location: charger.location || "Unknown",
          ChargingRate: charger.chargingRate || 0,
          Description: charger.description || "No description",
          Price: String(charger.price ?? ""),
          picture: charger.picture || "",
          userId: charger.userId,
        }));
        setChargers(mapped);
        setRows(mapped);
      } catch (error) {
        console.error("Error fetching charging stations:", error);
      }
    })();


    (async () => {
      setCarLoading(true);
      try {
        const carRes = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/carData/get-car-data`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({ userId }),
          }
        );

        if (!carRes.ok) {
          const err = await carRes.json().catch(() => ({}));
          throw new Error(err?.message || "Failed to fetch car data");
        }

        const carArr = await carRes.json();
        const current = Array.isArray(carArr) && carArr.length > 0 ? carArr[0] : null;

        if (current) {
          setCarBrand(current.brandName || "");
          setCarModel(current.carModel || "");
          setCarYear(current.year ? String(current.year) : "");
        }
      } catch (error) {
        console.error("Error fetching car data:", error);
      } finally {
        setCarLoading(false);
      }
    })();
  }, [navigate]);

  const handleUpdateCarInfo = async () => {
    if (!carBrand || !carYear || !carModel) {
      alert("Please enter all car details.");
      return;
    }

    setSubmitLoading(true);
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
          body: JSON.stringify({ carBrand, carYear, carModel, userId }),
        }
      );

      if (!response.ok) throw new Error("Failed to generate content");

      alert("Car information sent successfully");
    } catch (error) {
      console.error("Error sending car information:", error);
      alert("Failed to send car information");
    } finally {
      setSubmitLoading(false);
    }
  };

  const CarSectionSpinner = () => (
    <>
      <style>
        {`@keyframes spinCar{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}
      </style>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "16px 0",
        }}
      >
        <div
          aria-label="Loading car data"
          style={{
            width: 28,
            height: 28,
            border: "4px solid #e6e6e6",
            borderTopColor: "#066C91",
            borderRadius: "50%",
            animation: "spinCar 0.9s linear infinite",
          }}
        />
        <span style={{ color: "#333" }}>Loading car data…</span>
      </div>
    </>
  );

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

        {carLoading ? (
          <CarSectionSpinner />
        ) : (
          <>
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
              disabled={submitLoading}
              className="car-info-btn"
            >
              {submitLoading ? "Sending..." : "Send Car Info"}
            </button>
          </>
        )}
      </div>

      <div className="received-bookings">
        <ReceivedBooking chargers={chargers} />
      </div>
    </div>
  );
};

export default PersonalArea;