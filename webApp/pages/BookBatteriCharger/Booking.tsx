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

type FormValue = string;

export default function Booking() {
  const [chargerOwner, setChargerOwner] = useState<ChargerOwner | null>(null);
  const navigate = useNavigate();
  const location = useLocation() as any;
  const charger = location.state?.charger;

  const [formData, setFormData] = useState({
    chargerId: charger?._id || "",
    userId: localStorage.getItem("userId") || "",

    // required by schema
    dateLeave: "",
    timeLeave: "",
    currentBatteryLevel: "",
    desiredBatteryLevel: "",
    sitePicker: "",
    vehicleModel: "",
    vehicleLicensePlate: "",
    vehicleDriverFullName: "",
    dialCode: "+972",
    vehicleDriverPhoneNumber: "",

    // optional by schema
    vehicleYear: "",
    vehicleColor: "",
    parkLocationSpotId: "",
    parkLocationFloor: "",
    sendSmsOnComplete: "false",
    note: "",
    message: "",

    // legacy optional (controller supports them; leave empty)
    date: "",
    startTime: "",
    endTime: "",
    contactNumber: "",
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
          setChargerOwner(data.user);
        } catch (error) {
          console.error("Error fetching user by charger ID:", error);
        }
      };

      fetchUserByChargerId();
    }
  }, [charger, navigate]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value as FormValue,
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    if (!formData.chargerId || !formData.userId) {
      setError("Missing charger or user.");
      return;
    }

    if (!formData.dateLeave || !formData.timeLeave) {
      setError("Please select date of leave and hour of leave.");
      return;
    }

    const pct = (v: string) => Number(v);
    if (
      Number.isNaN(pct(formData.currentBatteryLevel)) ||
      Number.isNaN(pct(formData.desiredBatteryLevel))
    ) {
      setError("Battery levels must be numbers.");
      return;
    }
    if (
      pct(formData.currentBatteryLevel) < 0 ||
      pct(formData.currentBatteryLevel) > 100 ||
      pct(formData.desiredBatteryLevel) < 0 ||
      pct(formData.desiredBatteryLevel) > 100
    ) {
      setError("Battery levels must be between 0 and 100.");
      return;
    }

    if (!formData.vehicleDriverFullName.trim()) {
      setError("Full name is required.");
      return;
    }
    if (!formData.vehicleModel.trim()) {
      setError("Vehicle model is required.");
      return;
    }
    if (!formData.vehicleLicensePlate.trim()) {
      setError("License plate is required.");
      return;
    }
    if (!formData.sitePicker.trim()) {
      setError("Site is required.");
      return;
    }
    if (!formData.dialCode || !formData.vehicleDriverPhoneNumber) {
      setError("Phone dial code and number are required.");
      return;
    }
    if (!/^\+?\d+$/.test(formData.dialCode) || !/^[1-9]\d{6,14}$/.test(formData.vehicleDriverPhoneNumber)) {
      setError("Please enter a valid phone number.");
      return;
    }

    try {
      const accessToken = localStorage.getItem("accessToken");
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/bookingsBatteriCharger/bookCharger`,
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
        const err = await response.json().catch(() => ({}));
        throw new Error(err?.message || "Failed to create booking.");
      }

      setSuccessMessage("Booking successfully submitted!");
      setFormData((prev) => ({
        ...prev,
        chargerId: charger._id || "",
        userId: localStorage.getItem("userId") || "",
        dateLeave: "",
        timeLeave: "",
        currentBatteryLevel: "",
        desiredBatteryLevel: "",
        sitePicker: "",
        vehicleModel: "",
        vehicleLicensePlate: "",
        vehicleDriverFullName: "",
        dialCode: "+972",
        vehicleDriverPhoneNumber: "",
        vehicleYear: "",
        vehicleColor: "",
        parkLocationSpotId: "",
        parkLocationFloor: "",
        sendSmsOnComplete: "false",
        note: "",
        message: "",
        date: "",
        startTime: "",
        endTime: "",
        contactNumber: "",
      }));

      navigate("/ActivityHistory", { state: { message: "Booking submitted!" } });
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
        {/* Leave time */}
        <div className="form-row">
          <div className="form-group">
            <label className="form-label" htmlFor="dateLeave">
              Date Of Leave
            </label>
            <input
              type="date"
              id="dateLeave"
              name="dateLeave"
              value={formData.dateLeave}
              onChange={handleChange}
              required
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="timeLeave">
              Hour Of Leave
            </label>
            <input
              type="time"
              id="timeLeave"
              name="timeLeave"
              value={formData.timeLeave}
              onChange={handleChange}
              required
              className="form-input"
            />
          </div>
        </div>

        {/* Battery */}
        <div className="form-row">
          <div className="form-group">
            <label className="form-label" htmlFor="currentBatteryLevel">
              Current Battery Level (%)
            </label>
            <input
              type="number"
              id="currentBatteryLevel"
              name="currentBatteryLevel"
              min={0}
              max={100}
              placeholder="50"
              value={formData.currentBatteryLevel}
              onChange={handleChange}
              required
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="desiredBatteryLevel">
              Desired Battery Level (%)
            </label>
            <input
              type="number"
              id="desiredBatteryLevel"
              name="desiredBatteryLevel"
              min={0}
              max={100}
              placeholder="80"
              value={formData.desiredBatteryLevel}
              onChange={handleChange}
              required
              className="form-input"
            />
          </div>
        </div>

        {/* Site + Parking */}
        <div className="form-row">
          <div className="form-group">
            <label className="form-label" htmlFor="sitePicker">
              Site
            </label>
            <input
              type="text"
              id="sitePicker"
              name="sitePicker"
              placeholder="Midtown TLV -2"
              value={formData.sitePicker}
              onChange={handleChange}
              required
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="parkLocationSpotId">
              Parking Location ID
            </label>
            <input
              type="text"
              id="parkLocationSpotId"
              name="parkLocationSpotId"
              placeholder="0"
              value={formData.parkLocationSpotId}
              onChange={handleChange}
              className="form-input"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label" htmlFor="parkLocationFloor">
              Parking Location Floor
            </label>
            <input
              type="text"
              id="parkLocationFloor"
              name="parkLocationFloor"
              placeholder="-2"
              value={formData.parkLocationFloor}
              onChange={handleChange}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="sendSmsOnComplete">
              Send SMS When Charging Completes
            </label>
            <select
              id="sendSmsOnComplete"
              name="sendSmsOnComplete"
              value={formData.sendSmsOnComplete}
              onChange={handleChange}
              className="form-input"
            >
              <option value="false">No</option>
              <option value="true">Yes</option>
            </select>
          </div>
        </div>

        {/* Vehicle */}
        <div className="form-group">
          <label className="form-label" htmlFor="vehicleModel">
            Vehicle Model
          </label>
          <input
            type="text"
            id="vehicleModel"
            name="vehicleModel"
            placeholder="Tesla Model 3"
            value={formData.vehicleModel}
            onChange={handleChange}
            required
            className="form-input"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label" htmlFor="vehicleLicensePlate">
              License Plate Number
            </label>
            <input
              type="text"
              id="vehicleLicensePlate"
              name="vehicleLicensePlate"
              placeholder="12345678"
              value={formData.vehicleLicensePlate}
              onChange={handleChange}
              required
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="vehicleYear">
              Year
            </label>
            <input
              type="number"
              id="vehicleYear"
              name="vehicleYear"
              placeholder="2024"
              value={formData.vehicleYear}
              onChange={handleChange}
              className="form-input"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label" htmlFor="vehicleColor">
              Color
            </label>
            <input
              type="text"
              id="vehicleColor"
              name="vehicleColor"
              placeholder="Desert Yellow"
              value={formData.vehicleColor}
              onChange={handleChange}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="vehicleDriverFullName">
              Full Name
            </label>
            <input
              type="text"
              id="vehicleDriverFullName"
              name="vehicleDriverFullName"
              placeholder="Tony Stark"
              value={formData.vehicleDriverFullName}
              onChange={handleChange}
              required
              className="form-input"
            />
          </div>
        </div>

        {/* Phone */}
        <div className="form-row">
          <div className="form-group">
            <label className="form-label" htmlFor="dialCode">
              Dial Code
            </label>
            <select
              id="dialCode"
              name="dialCode"
              value={formData.dialCode}
              onChange={handleChange}
              className="form-input"
            >
              <option value="+972">+972</option>
              <option value="+1">+1</option>
              <option value="+44">+44</option>
              <option value="+49">+49</option>
              <option value="+33">+33</option>
            </select>
          </div>

          <div className="form-group" style={{ width: "100%" }}>
            <label className="form-label" htmlFor="vehicleDriverPhoneNumber">
              Phone Number
            </label>
            <input
              type="tel"
              id="vehicleDriverPhoneNumber"
              name="vehicleDriverPhoneNumber"
              placeholder="503972042"
              value={formData.vehicleDriverPhoneNumber}
              onChange={handleChange}
              required
              className="form-input"
            />
          </div>
        </div>

        {/* Notes/messages */}
        <div className="form-group">
          <label className="form-label" htmlFor="message">
            Message
          </label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            className="form-textarea"
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="note">
            Notes
          </label>
          <textarea
            id="note"
            name="note"
            value={formData.note}
            onChange={handleChange}
            className="form-textarea"
          />
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




// import { useState, useEffect, ChangeEvent, FormEvent } from "react";
// import { useLocation, useNavigate } from "react-router-dom";
// import "./Booking.css";
// import ReviewCard from "../../src/components/ReviewCard/ReviewCard";

// interface ChargerOwner {
//   _id: string;
//   firstName: string;
//   lastName: string;
//   email: string;
//   picture: string;
// }

// export default function Booking() {
//   const [chargerOwner, setChargerOwner] = useState<ChargerOwner | null>(null);
//   const navigate = useNavigate();
//   const location = useLocation();
//   const charger = location.state?.charger;

//   const [formData, setFormData] = useState({
//     chargerId: charger?._id || "",
//     firstName: "",
//     lastName: "",
//     contactNumber: "",
//     message: "",
//     date: "",
//     startTime: "",
//     endTime: "",
//     userId: localStorage.getItem("userId") || "",
//   });

//   const [error, setError] = useState("");
//   const [successMessage, setSuccessMessage] = useState("");

//   useEffect(() => {
//     if (!charger) {
//       navigate("/Home", { state: { message: "You have to pick a charger!" } });
//       return;
//     }

//     if (charger._id) {
//       const fetchUserByChargerId = async () => {
//         try {
//           const accessToken = localStorage.getItem("accessToken");
//           const response = await fetch(
//             `${import.meta.env.VITE_BACKEND_URL}/addChargingStation/getUserByChargerId/${charger._id}`,
//             {
//               method: "GET",
//               headers: {
//                 Authorization: `Bearer ${accessToken}`,
//                 "Content-Type": "application/json",
//               },
//             }
//           );

//           if (!response.ok) {
//             throw new Error("Failed to fetch user details.");
//           }

//           const data = await response.json();
//           const userData = data.user;
//           setChargerOwner(userData);
//         } catch (error) {
//           console.error("Error fetching user by charger ID:", error);
//         }
//       };

//       fetchUserByChargerId();
//     }
//   }, [charger, navigate]);

//   const handleChange = (
//     e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
//   ) => {
//     setFormData({
//       ...formData,
//       [e.target.name]: e.target.value,
//     });
//   };

//   const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
//     e.preventDefault();
//     setError("");
//     setSuccessMessage("");

//     const contactNumberRegex = /^\d+$/;
//     if (!contactNumberRegex.test(formData.contactNumber)) {
//       setError("Contact number must contain only numbers.");
//       return;
//     }

//     const startTime = new Date(`${formData.date}T${formData.startTime}:00`);
//     const endTime = new Date(`${formData.date}T${formData.endTime}:00`);

//     if (startTime >= endTime) {
//       setError("Start time must be earlier than end time.");
//       return;
//     }
//     try {
//       const accessToken = localStorage.getItem("accessToken");
//       const response = await fetch(
//         `${import.meta.env.VITE_BACKEND_URL}/bookings/bookCharger`,
//         {
//           method: "POST",
//           headers: {
//             Authorization: `Bearer ${accessToken}`,
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify(formData),
//         }
//       );

//       if (!response.ok) {
//         throw new Error("Failed to create booking.");
//       }

//       setSuccessMessage("Booking successfully submitted!");
//       setFormData({
//         chargerId: charger._id || "",
//         firstName: "",
//         lastName: "",
//         contactNumber: "",
//         message: "",
//         date: "",
//         startTime: "",
//         endTime: "",
//         userId: localStorage.getItem("userId") || "",
//       });
//       navigate("/ActivityHistory", {
//         state: { message: "Booking submitted!" },
//       });
//     } catch (error) {
//       console.error(error);
//       setError("An error occurred while submitting the booking.");
//     }
//   };

//   return (
//     <div className="booking-row">
//       <h2
//         className="booking-form-title"
//         style={{
//           fontSize: "40px",
//           fontWeight: "bold",
//           textAlign: "center",
//           color: "black",
//           WebkitBackgroundClip: "text",
//         }}
//       >
//         Charging Station <br />
//         Booking
//       </h2>
//       <form className="booking-form" onSubmit={handleSubmit}>
//         <div className="form-row">
//           <div className="form-group">
//             <label className="form-label" htmlFor="firstName">
//               First Name
//             </label>
//             <input
//               type="text"
//               id="firstName"
//               name="firstName"
//               value={formData.firstName}
//               onChange={handleChange}
//               required
//               className="form-input"
//             />
//           </div>

//           <div className="form-group">
//             <label className="form-label" htmlFor="lastName">
//               Last Name
//             </label>
//             <input
//               type="text"
//               id="lastName"
//               name="lastName"
//               value={formData.lastName}
//               onChange={handleChange}
//               required
//               className="form-input"
//             />
//           </div>
//         </div>

//         <div className="form-row">
//           <div className="form-group">
//             <label className="form-label" htmlFor="contactNumber">
//               Contact Number
//             </label>
//             <input
//               type="tel"
//               id="contactNumber"
//               name="contactNumber"
//               value={formData.contactNumber}
//               onChange={handleChange}
//               required
//               className="form-input"
//             />
//           </div>
//         </div>

//         <div className="form-group">
//           <label className="form-label" htmlFor="message">
//             Message
//           </label>
//           <textarea
//             id="message"
//             name="message"
//             value={formData.message}
//             onChange={handleChange}
//             required
//             className="form-textarea"
//           ></textarea>
//         </div>

//         <div className="form-group">
//           <label className="form-label" htmlFor="date">
//             Date
//           </label>
//           <input
//             type="date"
//             id="date"
//             name="date"
//             value={formData.date}
//             onChange={handleChange}
//             required
//             className="form-input"
//           />
//         </div>

//         <div className="form-row">
//           <div className="form-group">
//             <label className="form-label" htmlFor="startTime">
//               Start Time
//             </label>
//             <input
//               type="time"
//               id="startTime"
//               name="startTime"
//               value={formData.startTime}
//               onChange={handleChange}
//               required
//               className="form-input"
//             />
//           </div>

//           <div className="form-group">
//             <label className="form-label" htmlFor="endTime">
//               End Time
//             </label>
//             <input
//               type="time"
//               id="endTime"
//               name="endTime"
//               value={formData.endTime}
//               onChange={handleChange}
//               required
//               className="form-input"
//             />
//           </div>
//         </div>

//         {error && <p className="error">{error}</p>}
//         {successMessage && <p className="success">{successMessage}</p>}

//         <button type="submit" className="submit-button">
//           Submit
//         </button>
//       </form>

//       <div className="review-container">
//         {charger ? (
//           <ReviewCard
//             userName={
//               chargerOwner && chargerOwner.firstName && chargerOwner.lastName
//                 ? `${chargerOwner.firstName} ${chargerOwner.lastName}`
//                 : "Unknown Owner"
//             }
//             location={charger.location || "Unknown Location"}
//             rating={charger.rating || 0}
//             picture={
//               charger.picture
//                 ? `${import.meta.env.VITE_BACKEND_URL}${charger.picture}`
//                 : "https://macelectricco.com/wp-content/uploads/2022/09/Mac-Electric-Featured-Image-Template-5.png"
//             }
//             charger={charger}
//           />
//         ) : (
//           <p>Loading charger details...</p>
//         )}
//       </div>
//     </div>
//   );
// }
