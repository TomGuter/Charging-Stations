import React, { useState } from "react";
import "./generalinfoheader.css";

type GeneralInfoHeaderProps = {
  name: string;
  Email: string;
  picturePath?: string; // Optional prop for the image path from the server
};

export default function GeneralInfoHeader({
  name: initialName,
  Email: initialEmail,
  picturePath,
}: GeneralInfoHeaderProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(initialName);
  const [firstName, setFirstName] = useState(initialName.split(" ")[0]);
  const [lastName, setLastName] = useState(initialName.split(" ")[1] || "");
  const [errors, setErrors] = useState({
    firstName: "",
    lastName: "",
  });
  const [loading, setLoading] = useState(false);
  const [picture, setPicture] = useState(
    picturePath ? `http://localhost:3000${picturePath}` : ""
  ); // Use server path for the picture

  const toggleEditMode = () => {
    setIsEditing(!isEditing);
    setErrors({ firstName: "", lastName: "" });
  };

  const validateInputs = () => {
    const newErrors = { firstName: "", lastName: "" };
    if (!firstName.trim()) newErrors.firstName = "First name is required.";
    if (!lastName.trim()) newErrors.lastName = "Last name is required.";

    setErrors(newErrors);
    return !Object.values(newErrors).some((error) => error !== "");
  };

  const updateUser = async () => {
    const userId = localStorage.getItem("userId");
    const accessToken = localStorage.getItem("accessToken");
  
    if (!userId || !accessToken) {
      alert("User is not authenticated");
      return;
    }
  
    const formData = new FormData();
    formData.append("userId", userId);
    formData.append("firstName", firstName.trim());
    formData.append("lastName", lastName.trim());
  
    // Only append a new image if a file was selected
    if (picture && picture.startsWith("data:image")) {
      const file = await fetch(picture).then((res) => res.blob());
      formData.append("image", file, "profile.jpg");
    }
  
    try {
      const response = await fetch(
        `http://localhost:3000/auth/updateUser/${userId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${accessToken}`, // Include the access token
          },
          body: formData, // Send the formData
        }
      );
  
      if (!response.ok) {
        throw new Error("Failed to update user");
      }
  
      const data = await response.json();
      console.log(data);
      alert("User updated successfully!");
    } catch (error) {
      console.error("Error updating user:", error);
      alert("Failed to update user.");
    }
  };
  

  const saveChanges = () => {
    if (!validateInputs()) return;
    setName(`${firstName.trim()} ${lastName.trim()}`);
    setIsEditing(false);
    updateUser(); 
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPicture(reader.result as string); // Update picture with the new file
      };
      reader.readAsDataURL(file); // Convert image to base64 string
    }
  };

  return (
    <div className="card-container">
      {!isEditing ? (
        <>
          <div className="patient-details">
            <h2>{name}</h2>
            {picture && (
              <img
                src={picture}
                alt="Profile"
                style={{
                  width: "50px",
                  height: "50px",
                  objectFit: "cover",
                  borderRadius: "4px",
                }}
              />
            )}
          </div>

          <div className="info-section">
            <div className="info-item">
              <span className="label">Email:</span>
              <span className="value">{initialEmail}</span>
            </div>
          </div>

          <div className="actions">
            <button className="schedule-btn" onClick={toggleEditMode}>
              Edit
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="patient-details">
            <label className="label">First Name</label>
            <input
              type="text"
              className="edit-input"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Enter first name"
            />
            {errors.firstName && (
              <p className="error-text">{errors.firstName}</p>
            )}
            <label className="label">Last Name</label>
            <input
              type="text"
              className="edit-input"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Enter last name"
            />
            {errors.lastName && <p className="error-text">{errors.lastName}</p>}
          </div>

          <div className="info-section">
            <div className="info-item">
              <span className="label">Email:</span>
              <span className="value">{initialEmail}</span>
            </div>
            <div className="info-item">
              <label className="label">Profile Image:</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="edit-input"
              />
              {picture && (
                <img
                  src={picture}
                  alt="Preview"
                  style={{
                    width: "50px",
                    height: "50px",
                    objectFit: "cover",
                    borderRadius: "4px",
                  }}
                />
              )}
            </div>
          </div>

          <div className="actions">
            <button className="schedule-btn" onClick={saveChanges} disabled={loading}>
              {loading ? "Saving..." : "Save"}
            </button>
            <button className="schedule-btn" onClick={toggleEditMode}>
              Cancel
            </button>
          </div>
        </>
      )}
    </div>
  );
}
