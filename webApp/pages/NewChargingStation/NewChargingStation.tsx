import React, { useState } from "react";
import "./NewChargingStation.css";

export default function NewChargingStation() {
  const [location, setLocation] = useState("");
  const [chargingRate, setChargingRate] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null); // State for image preview
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showLocationOption, setShowLocationOption] = useState(false);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file)); // Generate a preview URL
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
              setLocation(data.display_name);
            } else {
              setLocation(`${latitude}, ${longitude}`);
            }
          } catch (error) {
            console.error("Error fetching address:", error);
            setLocation(`${latitude}, ${longitude}`);
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const accessToken = localStorage.getItem("accessToken");

    if (!accessToken) {
      setError("You must be logged in to add a charging station.");
      return;
    }

    if (
      !location ||
      !chargingRate ||
      !price ||
      !description ||
      !selectedImage
    ) {
      setError("All fields, including an image, are required.");
      return;
    }

    const userId = localStorage.getItem("userId") || "";
    const formData = new FormData();
    formData.append("userId", userId);
    formData.append("location", location);
    formData.append("chargingRate", chargingRate);
    formData.append("price", price);
    formData.append("description", description);
    formData.append("image", selectedImage);
    formData.append("type", "charger");

    try {
      const response = await fetch(
        "http://localhost:3000/addChargingStation/addCharger",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("Failed to add charging station.");
      }

      setSuccessMessage("Charging station added successfully!");
      setError("");
      setLocation("");
      setChargingRate("");
      setPrice("");
      setDescription("");
      setSelectedImage(null);
      setImagePreview(null); // Clear the preview
    } catch (error) {
      console.error("Error:", error);
      setError("An error occurred while adding the charging station.");
      setSuccessMessage("");
    }
  };

  return (
    <div className="newChargingPage">
      <div className="form-card">
        <form className="charging-form" onSubmit={handleSubmit}>
          <h1>Add a New Charging Station</h1>

          <div className="input-group">
            <div className="location-group">
              <input
                type="text"
                placeholder="Location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
              />
              {showLocationOption && (
                <div className="location-dropdown">
                  <button
                    type="button"
                    onClick={handleUseCurrentLocation}
                    className="use-location-option"
                  >
                    Use Current Location
                  </button>
                </div>
              )}
            </div>
            <input
              type="text"
              placeholder="Charging rate"
              value={chargingRate}
              onChange={(e) => setChargingRate(e.target.value)}
            />
            <input
              type="text"
              placeholder="Price"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
            <input
              type="text"
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            <div className="image-upload">
              <label htmlFor="file-upload">Choose an Image</label>
              <input
                id="file-upload"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />
              {selectedImage && (
                <div>
                  <p>Selected image: {selectedImage.name}</p>
                  {imagePreview && (
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="image-preview"
                    />
                  )}
                </div>
              )}
            </div>
          </div>

          {error && <p className="error">{error}</p>}
          {successMessage && <p className="success">{successMessage}</p>}

          <button type="submit" className="add-btn">
            Add
          </button>
        </form>
      </div>
    </div>
  );
}
