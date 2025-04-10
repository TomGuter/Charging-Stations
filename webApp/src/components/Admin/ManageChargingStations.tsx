import { useState, useEffect } from "react";
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
import "./ManageChargingStations.css";

interface ChargingStation {
  charherRowId: number;
  _id: string;
  location: string;
  description: string;
  revenue: number;
  picture: string;
  userId: string;
}

export default function ManageChargingStations() {
  const [ChargingStations, setChargingStations] = useState<ChargingStation[]>(
    []
  );
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [editChargingStation, setEditChargingStation] = useState<number | null>(
    null
  );

  const [pictureUrls, setPictureUrls] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchChargingStations = async () => {
      const userId = localStorage.getItem("userId");
      const accessToken = localStorage.getItem("accessToken");

      if (!userId) {
        alert("User ID is required to fetch charging stations");
        return;
      }

      try {
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/admin/getAllChargers`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch charge stations");
        }

        const data = await response.json();

        if (data.chargers && Array.isArray(data.chargers)) {
          const fetchedStations = data.chargers.map(
            (station: ChargingStation) => ({
              charherRowId: station._id,
              _id: station._id,
              location: station.location,
              description: station.description,
              revenue: station.revenue || 0,
              picture: station.picture || "",
              userId: station.userId,
            })
          );

          setChargingStations(fetchedStations);
        } else {
          console.error(
            "Expected an array under 'chargers', but received:",
            data
          );
          alert(
            "Error: Expected an array of charge stations under 'chargers'."
          );
        }
      } catch (error) {
        console.error("Error fetching charge stations:", error);
      }
    };

    fetchChargingStations();
  }, []);

  const filterChargingStations = () => {
    return ChargingStations.filter((station) =>
      station.location.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const deleteChargingStation = async (charherRowId: number) => {
    const stationToDelete = ChargingStations.find(
      (station) => station.charherRowId === charherRowId
    );

    if (!stationToDelete) {
      alert("Failed to find the station to delete");
      return;
    }

    try {
      const userId = localStorage.getItem("userId");
      const accessToken = localStorage.getItem("accessToken");

      if (!userId || !accessToken) {
        alert("User ID or access token is missing. Cannot delete charger.");
        return;
      }

      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/addChargingStation/deleteChargerById/${stationToDelete._id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to delete charger: ${response.statusText}`);
      }

      await response.json();

      setChargingStations((prevStations) =>
        prevStations.filter((station) => station.charherRowId !== charherRowId)
      );

      alert("Charging station deleted successfully!");
    } catch (error) {
      console.error("Error deleting charging station:", error);
      alert("Failed to delete the charging station. Please try again.");
    }
  };

  const handleEditChargingStation = (charherRowId: number) => {
    setEditChargingStation(charherRowId);
  };

  const handlePictureChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    rowId: string
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPictureUrls((prev) => ({
          ...prev,
          [rowId]: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveEdit = async () => {
    if (editChargingStation === null) return;

    const editedStation = ChargingStations.find(
      (station) => station.charherRowId === editChargingStation
    );

    if (!editedStation) {
      alert("Failed to find the station to save");
      return;
    }

    try {
      const userId = localStorage.getItem("userId");
      const accessToken = localStorage.getItem("accessToken");

      if (!userId || !accessToken) {
        alert("User ID or access token is missing. Cannot save changes.");
        return;
      }

      const formData = new FormData();
      formData.append("Location", editedStation.location);
      formData.append("Description", editedStation.description);
      formData.append("userId", editedStation.userId);
      if (
        pictureUrls[editedStation._id] &&
        pictureUrls[editedStation._id].startsWith("data:image")
      ) {
        try {
          const file = await fetch(pictureUrls[editedStation._id]).then((res) =>
            res.blob()
          );

          const fileType = file.type;
          const extension = fileType.split("/")[1];

          formData.append("image", file, `${editedStation._id}.${extension}`);
        } catch (error) {
          console.error("Error processing image file:", error);
          alert("Failed to process the image. Please try again.");
          return;
        }
      }

      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/addChargingStation/updateCharger/${editedStation._id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to save changes: ${response.statusText}`);
      }

      await response.json();

      setEditChargingStation(null);
      alert("Charging station updated successfully!");
    } catch (error) {
      console.error("Error saving changes:", error);
      alert("Failed to save changes. Please try again.");
    }
  };

  const handleCancelEdit = () => {
    setEditChargingStation(null);
  };

  const handleChange = (
    charherRowId: number,
    field: keyof ChargingStation,
    value: string
  ) => {
    setChargingStations((prevStations) =>
      prevStations.map((station) =>
        station.charherRowId === charherRowId
          ? {
              ...station,
              [field]: field === "revenue" ? parseFloat(value) : value,
            }
          : station
      )
    );
  };

  const filteredChargingStations = filterChargingStations();
  const totalChargingStations = filteredChargingStations.length;

  // const totalRevenue = filteredChargingStations.reduce(
  //   (sum, station) => sum + station.revenue,
  //   0
  // );

  return (
    <Box sx={{ padding: 3, backgroundColor: "#f5f5f5", borderRadius: 2 }}>
      <Typography
        variant="h4"
        gutterBottom
        sx={{ fontWeight: "bold", color: "#333" }}
      >
        Manage All Charging Stations
      </Typography>

      <Typography
        variant="subtitle1"
        gutterBottom
        sx={{ marginBottom: 1, fontWeight: "medium", color: "#555" }}
      >
        Total Charging Stations: {totalChargingStations}
      </Typography>

      {/* <Typography
        variant="subtitle1"
        gutterBottom
        sx={{ marginBottom: 2, fontWeight: "medium", color: "#555" }}
      >
        Total Money Earned: ${totalRevenue.toFixed(2)}
      </Typography> */}

      <TextField
        label="Search by location, email, or owner's name"
        variant="outlined"
        fullWidth
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        sx={{
          marginBottom: 2,
          backgroundColor: "#fff",
          borderRadius: 1,
        }}
      />

      <TableContainer
        component={Paper}
        sx={{
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
          maxHeight: "400px",
          overflowY: "auto",
        }}
      >
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead
            sx={{
              color: "#fff",
              position: "sticky",
              top: "0",
              zIndex: 1,
            }}
          >
            <TableRow>
              <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                Charger Id
              </TableCell>
              <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                Location
              </TableCell>
              <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                Description
              </TableCell>
              <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                Revenue Earned
              </TableCell>
              <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                Picture
              </TableCell>

              <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredChargingStations.map((station) => (
              <TableRow
                key={station._id}
                sx={{ "&:hover": { backgroundColor: "#f1f1f1" } }}
              >
                <TableCell>{station._id}</TableCell>
                <TableCell>
                  {editChargingStation === station.charherRowId ? (
                    <Input
                      value={station.location}
                      onChange={(e) =>
                        handleChange(
                          station.charherRowId,
                          "location",
                          e.target.value
                        )
                      }
                      sx={{ marginBottom: 1 }}
                    />
                  ) : (
                    station.location
                  )}
                </TableCell>
                <TableCell>
                  {editChargingStation === station.charherRowId ? (
                    <Input
                      value={station.description}
                      onChange={(e) =>
                        handleChange(
                          station.charherRowId,
                          "description",
                          e.target.value
                        )
                      }
                      sx={{ marginBottom: 1 }}
                    />
                  ) : (
                    station.description
                  )}
                </TableCell>
                <TableCell>
                  {editChargingStation === station.charherRowId ? (
                    <Input
                      value={station.revenue}
                      onChange={(e) =>
                        handleChange(
                          station.charherRowId,
                          "revenue",
                          e.target.value
                        )
                      }
                      sx={{ marginBottom: 1 }}
                      type="number"
                    />
                  ) : (
                    `$${station.revenue.toFixed(2)}`
                  )}
                </TableCell>
                <TableCell>
                  {/* Display current or new image */}
                  {pictureUrls[station.charherRowId] ? (
                    <img
                      src={pictureUrls[station.charherRowId]}
                      alt="Charger"
                      style={{
                        width: "50px",
                        height: "50px",
                        objectFit: "cover",
                        borderRadius: "4px",
                      }}
                    />
                  ) : (
                    <img
                      src={`${import.meta.env.VITE_BACKEND_URL}${station.picture}`}
                      alt="Charger"
                      style={{
                        width: "50px",
                        height: "50px",
                        objectFit: "cover",
                        borderRadius: "4px",
                      }}
                    />
                  )}

                  {/* File input to change the image */}
                  {editChargingStation === station.charherRowId && (
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        handlePictureChange(e, String(station.charherRowId))
                      }
                    />
                  )}
                </TableCell>

                <TableCell>
                  {editChargingStation === station.charherRowId ? (
                    <div>
                      <button onClick={handleSaveEdit}>Save</button>
                      <button onClick={handleCancelEdit}>Cancel</button>
                    </div>
                  ) : (
                    <div>
                      <button
                        onClick={() =>
                          handleEditChargingStation(station.charherRowId)
                        }
                      >
                        Edit
                      </button>
                      <button
                        onClick={() =>
                          deleteChargingStation(station.charherRowId)
                        }
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
