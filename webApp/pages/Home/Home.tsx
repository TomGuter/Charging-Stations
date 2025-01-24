import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "./Home.css";
import React from "react";

interface Comment {
  text: string;
}

interface ChargingStation {
  _id: string;
  location: string;
  latitude: number;
  longitude: number;
  price: number;
  rating: number;
  chargingRate: number;
  picture?: string;
  description: string;
  comments?: Comment[];
  userId: string;
}



function ReturnToLocationButton({
  userLocation,
}: {
  userLocation: { lat: number; lng: number } | null;
}) {
  const map = useMap();

  const goToCurrentLocation = () => {
    if (userLocation) {
      map.flyTo([userLocation.lat, userLocation.lng], 14);
    } else {
      alert("Current location not available.");
    }
  };

  return (
    <button
      className="btn"
      style={{
        width: "250px",
        position: "absolute",
        right: 0,
        zIndex: 1000,
        backgroundColor: "#066C91",
        color: "#fff",
        border: "none",
        borderRadius: "8px",
        cursor: "pointer",
      }}
      onClick={goToCurrentLocation}
    >
      Return to Current Location
    </button>
  );
}

function calculateChargingTime(
  batteryCapacity: number,
  chargingSpeed: number
): string {
  if (!batteryCapacity || !chargingSpeed) {
    return "N/A";
  }

  const timeInHours = batteryCapacity / chargingSpeed;
  const hours = Math.floor(timeInHours);
  const minutes = Math.round((timeInHours - hours) * 60);

  return `${hours} hours ${minutes} minutes`;
}

export default function Home() {
  const navigate = useNavigate();

 
  const [coordinates, setCoordinates] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [address, setAddress] = useState<string>("");
  const [chargingStations, setChargingStations] = useState<ChargingStation[]>(
    []
  );
  const [carData, setCarData] = useState<{
    batteryCapacity: number;
    brandName: string;
    year: number;
    carModel: string;
  } | null>(null);

  const [userName, setUserName] = useState<{
    firstName: string;
    lastName: string;
  } | null>(null);

  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      navigate("/");
      return;
    }
    if (!localStorage.getItem("refreshToken")) {
      navigate("/");
      return;
    }

    const firstName = localStorage.getItem("firstName");
    const lastName = localStorage.getItem("lastName");
    if (firstName && lastName) {
      setUserName({ firstName, lastName });
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
          setCoordinates({ lat: latitude, lng: longitude });
        },
        (error) => {
          console.error("Error getting user location:", error);
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
    }
  }, [navigate]);

  useEffect(() => {
    const fetchChargingStations = async () => {
      try {
        const response = await fetch(
          "http://localhost:3000/addChargingStation/getAllChargers"
        );
        const data = await response.json();
        if (data.chargers) {
          setChargingStations(data.chargers);
        } else {
          console.error("No chargers found in response.");
        }
      } catch (error) {
        console.error("Error fetching charging stations:", error);
      }
    };

    const fetchCarData = async () => {
      try {
        const userId = localStorage.getItem("userId");
        if (!userId) {
          console.error("User ID not found in local storage.");
          return;
        }

        const response = await fetch(
          "http://localhost:3000/carData/get-car-data",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              userId: userId,
            }),
          }
        );

        if (!response.ok) {
          const error = await response.json();
          console.error("Failed to fetch car data:", error.message);
          return;
        }

        const data = await response.json();

        if (data && data.length > 0) {
          setCarData(data[0]);
        } else {
          console.error("No car data found for the user!");
        }
      } catch (error) {
        console.error("Error fetching car data:", error);
      }
    };

    fetchChargingStations();
    fetchCarData();
  }, []);

  const searchAddress = async () => {
    if (!address.trim()) {
      alert("Please enter a valid address.");
      return;
    }

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          address
        )}`
      );
      const data = await response.json();

      if (data.length > 0) {
        const { lat, lon } = data[0];
        setCoordinates({ lat: parseFloat(lat), lng: parseFloat(lon) });
      } else {
        alert("No results found for the entered address.");
      }
    } catch (error) {
      console.error("Error fetching address coordinates:", error);
      alert("Failed to fetch coordinates. Please try again.");
    }
  };

  return (
    <div className="map-page">
      <h2 className="title">
        Hi {userName ? `${userName.firstName} ${userName.lastName}` : "User"},
        Charging Station Map
      </h2>
      <div className="input-container">
        <input
          className="input"
          type="text"
          placeholder="Enter address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />
        <button className="btn" onClick={searchAddress}>
          Find Charging Station by Address
        </button>
      </div>
      {!userLocation || !carData ? (
        <div className="spinner-container">
          <div className="spinner"></div>
        </div>
      ) : (
        <MapContainer
          center={
            coordinates
              ? [coordinates.lat, coordinates.lng]
              : [userLocation.lat, userLocation.lng]
          }
          zoom={14}
          scrollWheelZoom={false}
          style={{ width: "100%", height: "600px", borderRadius: "10px" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {chargingStations.map((charger) => (
            <Marker
              key={charger._id}
              position={[charger.latitude, charger.longitude]}
            >
              <Popup>
                <input style={{ fontSize: "5px", padding: "0" }} type="file" />
                <strong>{charger.location}</strong>
                <br />
                <br />
                Price: ${charger.price}
                <br />
                Rating: {charger.rating} stars
                <br />
                Charging Speed: {charger.chargingRate}kW
                <br />
                Charging Time:{" "}
                {carData?.batteryCapacity && charger.chargingRate ? (
                  <strong>
                    {calculateChargingTime(
                      carData.batteryCapacity,
                      charger.chargingRate
                    )}
                  </strong>
                ) : (
                  "N/A"
                )}
                <br />
                <button
                  onClick={() =>
                    (window.location.href = "http://localhost:5173/Booking")
                  }
                  style={{
                    backgroundColor: "#066C91",
                    color: "white",
                    padding: "10px 20px",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    marginTop: "10px",
                  }}
                >
                  Book Now
                </button>
              </Popup>
            </Marker>
          ))}
          <ReturnToLocationButton userLocation={userLocation} />
        </MapContainer>
      )}
    </div>
  );
}
