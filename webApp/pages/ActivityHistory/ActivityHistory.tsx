import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
} from "@mui/material";
import "./ActivityHistory.css";
import { Booking } from "../../src/types/types";
import { useNavigate } from "react-router-dom";


type Status = "Pending" | "Confirmed" | "Rejected";

const statusStyles: Record<Status, { backgroundColor: string; color: string }> =
  {
    Pending: { backgroundColor: "#FFA500", color: "white" },
    Confirmed: { backgroundColor: "#28a745", color: "white" },
    Rejected: { backgroundColor: "#dc3545", color: "white" },
  };

export default function ActivityHistory() {
  const [rows, setRows] = useState<Booking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const userId = localStorage.getItem("userId");

  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem("accessToken")) {
      navigate("/");
      return;
    }

    const fetchBookings = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/bookings/getBookingByUserId/${userId}`,
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

        const updatedBookings = await Promise.all(
          data.map(async (booking: Booking) => {
            const chargerResponse = await fetch(
              `${import.meta.env.VITE_BACKEND_URL}/addChargingStation/getChargerById/${booking.chargerId}`,
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

        setRows(updatedBookings);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching bookings:", error);
        setLoading(false);
      }
    };

    fetchBookings();
  }, [userId]);

  if (loading) {
    return <Typography>Loading bookings...</Typography>;
  }

  return (
    <div className="activity-history-container">
      <Typography variant="h5" className="table-title">
        Activity History
      </Typography>
      <TableContainer component={Paper} className="table-container">
        <Table stickyHeader>
        <TableHead style={{ position: "sticky", top: 0 }}>
            <TableRow className="table-header-row">
              <TableCell className="table-header-cell">Date</TableCell>
              <TableCell className="table-header-cell">Start Time</TableCell>
              <TableCell className="table-header-cell">End Time</TableCell>
              <TableCell className="table-header-cell">Location</TableCell>
              <TableCell className="table-header-cell">Status</TableCell> {}
              <TableCell className="table-header-cell">Picture</TableCell> {}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row._id} className="table-row">
                <TableCell className="table-cell">
                  {new Date(row.Date).toLocaleDateString()}
                </TableCell>
                <TableCell className="table-cell">
                  {new Date(row.StartTime).toLocaleTimeString()}
                </TableCell>
                <TableCell className="table-cell">
                  {new Date(row.EndTime).toLocaleTimeString()}
                </TableCell>
                <TableCell className="table-cell">{row.Location}</TableCell>
                <TableCell
                  className="table-cell"
                  style={statusStyles[row.Status as Status] || {}}
                >
                  {row.Status}
                </TableCell>
                <TableCell className="table-cell">
                  {row.chargerPicture ? (
                    <img
                      src={
                        row.chargerPicture
                          ? `${import.meta.env.VITE_BACKEND_URL}${row.chargerPicture}`
                          : "defaultPicture"
                      }
                      alt="Charging Station"
                      style={{
                        width: "100px",
                        height: "139px",
                        objectFit: "cover",
                        borderRadius: "8px",
                      }}
                    />
                  ) : (
                    <Typography>No Picture Available</Typography>
                  )}
                </TableCell>{" "}
                {}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}
