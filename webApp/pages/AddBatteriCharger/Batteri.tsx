import { useEffect, useState, ChangeEvent, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import "./Batteri.css";

// email: batteri@gmail.com
// password: battericharger

interface BatteriChargerForm {
  location: string;
  chargingRate: string;
  price: string;
  description: string;
  image: File | null;
}

export default function Batteri() {
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [formData, setFormData] = useState<BatteriChargerForm>({
    location: "",
    chargingRate: "",
    price: "",
    description: "",
    image: null,
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showLocationOption, setShowLocationOption] = useState(false);

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

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData((prev) => ({ ...prev, image: file }));
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleUseCurrentLocation = async () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
            );
            const data = await response.json();
            if (data && data.display_name) {
              setFormData((prev) => ({ ...prev, location: data.display_name }));
            } else {
              setFormData((prev) => ({
                ...prev,
                location: `${latitude}, ${longitude}`,
              }));
            }
          } catch (error) {
            console.error("Error fetching address:", error);
            setFormData((prev) => ({
              ...prev,
              location: `${latitude}, ${longitude}`,
            }));
          }
        },
        (error) => {
          console.error("Error getting location:", error);
          setError("Unable to fetch your location. Please try again.");
        }
      );
    } else {
      setError("Geolocation is not supported by your browser.");
    }
  };

  const handleInputFocus = () => {
    setShowLocationOption(true);
  };

  const handleInputBlur = () => {
    setTimeout(() => setShowLocationOption(false), 200);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setIsSubmitting(true);

    try {
      const accessToken = localStorage.getItem("accessToken");
      const userId = localStorage.getItem("userId");

      if (!accessToken || !userId) {
        setError("Authentication required");
        return;
      }

      const formDataToSend = new FormData();

      // Append all form fields
      Object.entries(formData).forEach(([key, value]) => {
        if (key === "image" && value) {
          formDataToSend.append("image", value);
        } else if (key !== "image") {
          formDataToSend.append(key, String(value));
        }
      });

      formDataToSend.append("userId", userId);
      formDataToSend.append("type", "batteri");
      formDataToSend.append("chargerType", "batteri");

      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/addChargingStation/addCharger`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "user-id": userId,
          },
          body: formDataToSend,
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to add Batteri charger");
      }

      setSuccessMessage("Batteri charger added successfully!");

      // Reset form
      setFormData({
        location: "",
        chargingRate: "",
        price: "",
        description: "",
        image: null,
      });
      setImagePreview(null);

      // Redirect after 2 seconds
      setTimeout(() => {
        navigate("/Home");
      }, 2000);
    } catch (error) {
      console.error("Error:", error);
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (hasAccess === null) return null;
  if (!hasAccess) return null;

  return (
    <div className="form-card">
      <div className="title1">
        <img
          src="https://batteri.energy/wp-content/uploads/2022/11/Logo1.png"
          alt="Batteri Logo"
          className="batteri-logo"
        />
        <h1>Add a New batteri charger</h1>
      </div>

      <form className="charging-form" onSubmit={handleSubmit}>
        <div className="propertis">
          <div className="location-group">
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              placeholder="Location"
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
              required
            />
            {showLocationOption && (
              <div className="location-dropdown">
                <button
                  type="button"
                  onClick={handleUseCurrentLocation}
                  className="use-location"
                >
                  Use Current Location
                </button>
              </div>
            )}
          </div>

          <div className="input-group">
            <input
              type="number"
              id="chargingRate"
              name="chargingRate"
              value={formData.chargingRate}
              onChange={handleInputChange}
              placeholder="Charging rate"
              required
            />
          </div>

          <div className="input-group">
            <input
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              placeholder="Price per hour"
              required
            />
          </div>

          <div className="input-group">
            <input
              type="text"
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Description"
              required
            />
          </div>

          <div className="image-upload-batteri">
            <label htmlFor="image-upload-batteri">Choose an Image</label>
            <input
              id="image-upload-batteri"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
            />
            {imagePreview && (
              <img
                src={imagePreview}
                alt="Charger preview"
                className="image-preview"
              />
            )}
          </div>

          {error && <p style={{ color: "red" }}>{error}</p>}
          {successMessage && <p style={{ color: "green" }}>{successMessage}</p>}
        </div>

        <button
          type="submit"
          className="add-btn-batteri"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Adding..." : "Add"}
        </button>
      </form>
    </div>
  );
}
