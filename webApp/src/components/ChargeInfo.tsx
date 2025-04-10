import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  TextField,
  Box,
  Input,
} from "@mui/material";
import "./ChargeInfo.css";

interface ChargerRow {
  id: number;
  chargerId: string;
  Location: string;
  ChargingRate: number;
  Description: string;
  Price: number;
  picture: string;
  userId: string;
}

type ChargeInfoProps = {
  rows: ChargerRow[];
};

export default function ChargeInfo({ rows }: ChargeInfoProps) {
  const [editableRow, setEditableRow] = useState<number | null>(null);
  const [editData, setEditData] = useState<ChargerRow | null>(null);

  const handleEditClick = (id: number) => {
    setEditableRow(id);
    const row = rows.find((row) => row.id === id);
    if (row) setEditData(row);
  };

  const handleSaveClick = async () => {
    if (!editData) return;

    const formData = new FormData();
    formData.append("chargerId", editData.chargerId);
    formData.append("Location", editData.Location.trim());
    formData.append("ChargingRate", editData.ChargingRate.toString());
    formData.append("Description", editData.Description.trim());
    formData.append("Price", editData.Price.toString());
    formData.append("userId", editData.userId);

    if (editData.picture && editData.picture.startsWith("data:image")) {
      try {
        const file = await fetch(editData.picture).then((res) => res.blob());
        const fileType = file.type;
        const extension = fileType.split("/")[1];
        formData.append("image", file, `${editData.chargerId}.${extension}`);
      } catch (error) {
        console.error("Error processing image file:", error);
        alert("Failed to process the image. Please try again.");
        return;
      }
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/addChargingStation/updateCharger/${editData.chargerId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
          body: formData,
        }
      );

      if (response.ok) {
        alert("Charger updated successfully!");
      } else {
        alert("Failed to update the charger.");
      }
    } catch (error) {
      console.error("Error updating the charger:", error);
      alert("An error occurred while updating the charger.");
    }

    setEditableRow(null);
    setEditData(null);
  };

  const handleCancelClick = () => {
    setEditableRow(null);
    setEditData(null);
  };

  const handleDeleteClick = async (id: number) => {
    const charger = rows.find((row) => row.id === id);
    if (charger) {
      const confirmed = window.confirm(
        `Are you sure you want to delete charger at ${charger.Location}?`
      );
      if (confirmed) {
        try {
          const response = await fetch(
            `${import.meta.env.VITE_BACKEND_URL}/addChargingStation/deleteChargerById/${charger.chargerId}`,
            {
              method: "DELETE",
              headers: {
                Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
              },
            }
          );

          if (!response.ok) {
            throw new Error("Failed to delete the charger.");
          }

          alert("Charger deleted successfully.");
        } catch (error) {
          console.error("Error deleting charger:", error);
          alert("Error deleting the charger. Please try again.");
        }
      }
    } else {
      alert("Charger not found.");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditData((prev) => (prev ? { ...prev, [name]: value } : prev));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditData((prev) =>
          prev ? { ...prev, picture: reader.result as string } : prev
        );
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <TableContainer component={Paper} className="table-container">
      <Typography variant="h5" className="table-title">
        My Charging Stations
      </Typography>
      <Table stickyHeader className="without-title">
        <TableHead>
          <TableRow className="table-header-row">
            <TableCell className="table-header-cell" style={{ color: "black" }}>
              Location
            </TableCell>
            <TableCell className="table-header-cell">Charging Rate</TableCell>
            <TableCell className="table-header-cell">Description</TableCell>
            <TableCell className="table-header-cell">Price</TableCell>
            <TableCell className="table-header-cell">Picture</TableCell>
            <TableCell className="table-header-cell">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id} className="table-row">
              <TableCell className="table-cell">
                {editableRow === row.id ? (
                  <TextField
                    name="Location"
                    value={editData?.Location || ""}
                    onChange={handleChange}
                    fullWidth
                  />
                ) : (
                  row.Location
                )}
              </TableCell>
              <TableCell className="table-cell">
                {editableRow === row.id ? (
                  <TextField
                    name="ChargingRate"
                    value={editData?.ChargingRate || ""}
                    onChange={handleChange}
                    fullWidth
                  />
                ) : (
                  row.ChargingRate
                )}
              </TableCell>
              <TableCell className="table-cell">
                {editableRow === row.id ? (
                  <TextField
                    name="Description"
                    value={editData?.Description || ""}
                    onChange={handleChange}
                    fullWidth
                  />
                ) : (
                  row.Description
                )}
              </TableCell>
              <TableCell className="table-cell">
                {editableRow === row.id ? (
                  <TextField
                    name="Price"
                    type="number"
                    value={editData?.Price || ""}
                    onChange={handleChange}
                    fullWidth
                  />
                ) : (
                  row.Price
                )}
              </TableCell>
              <TableCell className="table-cell">
                {editableRow === row.id ? (
                  <Box>
                    <Input
                      type="file"
                      onChange={handleFileChange}
                      fullWidth
                      className="file-upload-input"
                    />
                    {editData?.picture && (
                      <img
                        src={editData.picture}
                        alt="Preview"
                        style={{
                          width: "50px",
                          height: "50px",
                          objectFit: "cover",
                          borderRadius: "4px",
                        }}
                      />
                    )}
                  </Box>
                ) : row.picture ? (
                  <img
                    src={`${import.meta.env.VITE_BACKEND_URL}${row.picture}`}
                    alt="Charging Station"
                    style={{
                      width: "50px",
                      height: "50px",
                      objectFit: "cover",
                      borderRadius: "4px",
                    }}
                  />
                ) : (
                  <Typography variant="body2" color="textSecondary">
                    No Image
                  </Typography>
                )}
              </TableCell>
              <TableCell className="table-cell">
                {editableRow === row.id ? (
                  <Box display="flex" gap="16px" justifyContent="center">
                    <button
                      onClick={handleSaveClick}
                      className="schedule-btn save-btn"
                    >
                      Save
                    </button>
                    <button
                      onClick={handleCancelClick}
                      className="schedule-btn cancel-btn"
                    >
                      Cancel
                    </button>
                  </Box>
                ) : (
                  <Box display="flex" gap="16px" justifyContent="center">
                    <button
                      onClick={() => handleEditClick(row.id)}
                      className="schedule-btn edit-btn"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteClick(row.id)}
                      className="schedule-btn delete-btn"
                    >
                      Delete
                    </button>
                  </Box>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
