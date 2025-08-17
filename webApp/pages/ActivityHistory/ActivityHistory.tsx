import { useEffect, useState } from "react";
import { Typography, Box } from "@mui/material";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../src/components/ui/table";
import { Booking } from "../../src/types/types";
import { useNavigate } from "react-router-dom";
import "./ActivityHistory.css";

export default function ActivityHistory() {
  const [rows, setRows] = useState<Booking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const userId = localStorage.getItem("userId");
  const navigate = useNavigate();

  useEffect(() => {
    // require auth
    if (!localStorage.getItem("accessToken")) {
      navigate("/");
      return;
    }

    // redirect BatteRi user straight to Home
    const email = (localStorage.getItem("email") || "").toLowerCase();
    const isBatteriUser = email === "batteri@gmail.com";
    if (isBatteriUser) {
      navigate("/Home", { replace: true });
      return;
    }

    const fetchBookings = async () => {
      try {
        const response = await fetch(
          `${
            import.meta.env.VITE_BACKEND_URL
          }/bookings/getBookingByUserId/${userId}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch bookings");
        }

        const data = await response.json();
        console.log("Raw bookings data:", data);
        console.log("Number of bookings:", data.length);

        const updatedBookings = await Promise.all(
          data.map(async (booking: Booking) => {
            console.log("Processing booking:", booking._id);
            const chargerResponse = await fetch(
              `${
                import.meta.env.VITE_BACKEND_URL
              }/addChargingStation/getChargerById/${booking.chargerId}`,
              {
                method: "GET",
                headers: {
                  Authorization: `Bearer ${localStorage.getItem(
                    "accessToken"
                  )}`,
                  "Content-Type": "application/json",
                },
              }
            );

            if (!chargerResponse.ok) {
              throw new Error("Failed to fetch charger location");
            }
            const chargerData = await chargerResponse.json();
            return {
              ...booking,
              Location: chargerData.chargingStation.location,
              chargerPicture: chargerData.chargingStation.picture,
            };
          })
        );

        console.log("Final processed bookings:", updatedBookings);
        setRows(updatedBookings);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching bookings:", error);
        setLoading(false);
      }
    };

    fetchBookings();
  }, [userId, navigate]);

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="200px"
      >
        <Typography variant="h6">Loading bookings...</Typography>
      </Box>
    );
  }

  console.log("Rendering with rows:", rows.length, "bookings:", rows);

  return (
    <div className="activity-history-container">
      <Typography variant="h5" className="table-title">
        Activity History ({rows.length} bookings)
      </Typography>

      <div className="table-wrapper">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Start Time</TableHead>
              <TableHead>End Time</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Station Picture</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="empty-state">
                  <Typography variant="h6" color="textSecondary">
                    No bookings found
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => {
                console.log("Rendering row:", row._id, "with data:", row);
                return (
                  <TableRow key={row._id}>
                    <TableCell>
                      {new Date(row.Date).toLocaleDateString("he-IL")}
                    </TableCell>
                    <TableCell>
                      {new Date(row.StartTime).toLocaleTimeString("he-IL", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </TableCell>
                    <TableCell>
                      {new Date(row.EndTime).toLocaleTimeString("he-IL", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </TableCell>
                    <TableCell>
                      <div className="location-cell" title={row.Location}>
                        {row.Location}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`status-badge status-${row.Status.toLowerCase()}`}
                      >
                        {row.Status}
                      </span>
                    </TableCell>
                    <TableCell>
                      {row.chargerPicture ? (
                        <img
                          src={`${import.meta.env.VITE_BACKEND_URL}${
                            row.chargerPicture
                          }`}
                          alt="Charging Station"
                          className="station-image"
                        />
                      ) : (
                        <div className="no-image-placeholder">
                          <span>No Image</span>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
