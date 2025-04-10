import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./Booking.css";
import ReviewCard from "../../src/components/ReviewCard/ReviewCard";

interface ChargerOwner {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  picture: string;
}

export default function Booking() {
  const [chargerOwner, setChargerOwner] = useState<ChargerOwner | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const charger = location.state?.charger;

  const [formData, setFormData] = useState({
    chargerId: charger?._id || "",
    firstName: "",
    lastName: "",
    contactNumber: "",
    message: "",
    date: "",
    startTime: "",
    endTime: "",
    userId: localStorage.getItem("userId") || "",
  });

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (!charger) {
      navigate("/Home", { state: { message: "You have to pick a charger!" } });
      return;
    }

    if (charger._id) {
      const fetchUserByChargerId = async () => {
        try {
          const accessToken = localStorage.getItem("accessToken");
          const response = await fetch(
            `${import.meta.env.VITE_BACKEND_URL}/addChargingStation/getUserByChargerId/${charger._id}`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
              },
            }
          );

          if (!response.ok) {
            throw new Error("Failed to fetch user details.");
          }

          const data = await response.json();
          const userData = data.user;
          setChargerOwner(userData);
        } catch (error) {
          console.error("Error fetching user by charger ID:", error);
        }
      };

      fetchUserByChargerId();
    }
  }, [charger, navigate]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    const contactNumberRegex = /^\d+$/;
    if (!contactNumberRegex.test(formData.contactNumber)) {
      setError("Contact number must contain only numbers.");
      return;
    }

    const startTime = new Date(`${formData.date}T${formData.startTime}:00`);
    const endTime = new Date(`${formData.date}T${formData.endTime}:00`);

    if (startTime >= endTime) {
      setError("Start time must be earlier than end time.");
      return;
    }
    try {
      const accessToken = localStorage.getItem("accessToken");
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/bookings/bookCharger`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to create booking.");
      }

      setSuccessMessage("Booking successfully submitted!");
      setFormData({
        chargerId: charger._id || "",
        firstName: "",
        lastName: "",
        contactNumber: "",
        message: "",
        date: "",
        startTime: "",
        endTime: "",
        userId: localStorage.getItem("userId") || "",
      });
      navigate("/ActivityHistory", {
        state: { message: "Booking submitted!" },
      });
    } catch (error) {
      console.error(error);
      setError("An error occurred while submitting the booking.");
    }
  };

  return (
    <div className="booking-row">
      <h2
        className="booking-form-title"
        style={{
          fontSize: "40px",
          fontWeight: "bold",
          textAlign: "center",
          color: "black",
          WebkitBackgroundClip: "text",
        }}
      >
        Charging Station <br />
        Booking
      </h2>
      <form className="booking-form" onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label" htmlFor="firstName">
              First Name
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="lastName">
              Last Name
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
              className="form-input"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label" htmlFor="contactNumber">
              Contact Number
            </label>
            <input
              type="tel"
              id="contactNumber"
              name="contactNumber"
              value={formData.contactNumber}
              onChange={handleChange}
              required
              className="form-input"
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="message">
            Message
          </label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            required
            className="form-textarea"
          ></textarea>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="date">
            Date
          </label>
          <input
            type="date"
            id="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
            className="form-input"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label" htmlFor="startTime">
              Start Time
            </label>
            <input
              type="time"
              id="startTime"
              name="startTime"
              value={formData.startTime}
              onChange={handleChange}
              required
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="endTime">
              End Time
            </label>
            <input
              type="time"
              id="endTime"
              name="endTime"
              value={formData.endTime}
              onChange={handleChange}
              required
              className="form-input"
            />
          </div>
        </div>

        {error && <p className="error">{error}</p>}
        {successMessage && <p className="success">{successMessage}</p>}

        <button type="submit" className="submit-button">
          Submit
        </button>
      </form>

      <div className="review-container">
        {charger ? (
          <ReviewCard
            userName={
              chargerOwner && chargerOwner.firstName && chargerOwner.lastName
                ? `${chargerOwner.firstName} ${chargerOwner.lastName}`
                : "Unknown Owner"
            }
            location={charger.location || "Unknown Location"}
            rating={charger.rating || 0}
            picture={
              charger.picture
                ? `${import.meta.env.VITE_BACKEND_URL}${charger.picture}`
                : "https://macelectricco.com/wp-content/uploads/2022/09/Mac-Electric-Featured-Image-Template-5.png"
            }
            charger={charger}
          />
        ) : (
          <p>Loading charger details...</p>
        )}
      </div>
    </div>
  );
}
