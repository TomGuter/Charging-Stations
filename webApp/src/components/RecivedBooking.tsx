import React, { useState, useEffect } from "react";
import { AiOutlineCheckCircle, AiOutlineCloseCircle } from "react-icons/ai";
import "./RecivedBooking.css";
import { Charger } from "../types/types";
import { Booking } from "../types/types";

interface ReceivedBookingProps {
  chargers: Charger[];
}

const ReceivedBooking: React.FC<ReceivedBookingProps> = ({ chargers }) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedCharger, setSelectedCharger] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const handleStatusChange = async (id: string, newStatus: string) => {
    setLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/bookings/updateBooking/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update booking status on the server");
      }


      setBookings((prevBookings) =>
        prevBookings.map((booking) =>
          booking._id === id ? { ...booking, Status: newStatus } : booking
        )
      );

      alert(
        `Booking ${
          newStatus === "Confirmed" ? "confirmed" : "rejected"
        } successfully`
      );
    } catch (error) {
      console.error("Error updating booking status:", error);
      alert("Failed to update booking status");
    } finally {
      setLoading(false);
    }
  };

  const fetchBookingsByChargerId = async (chargerId: string) => {
    setLoading(true);
    try {
      const bookingsResponse = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/bookings/getBookingByChargerId/${chargerId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );

      if (!bookingsResponse.ok) {
        throw new Error(`Failed to fetch bookings for charger ${chargerId}`);
      }

      const bookingsData = await bookingsResponse.json();
      setBookings(bookingsData);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedCharger) {
      fetchBookingsByChargerId(selectedCharger);
    }
  }, [selectedCharger]);

  const handleChargerChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCharger(event.target.value);
  };

  return (
    <div className="received-booking-container">
      <h3>Received Bookings</h3>

      <div className="charger-selection">
        <label htmlFor="charger-select">Select Charger:</label>
        <div className="custom-select">
          <div
            className="select-selected"
            onClick={() => setIsOpen(!isOpen)}
            aria-expanded={isOpen}
          >
            {selectedCharger ? (
              <>
                <span className="charger-id">
                  {
                    chargers.find((c) => c.chargerId === selectedCharger)
                      ?.chargerId
                  }
                </span>
                <span className="charger-location">
                  {
                    chargers.find((c) => c.chargerId === selectedCharger)
                      ?.location
                  }
                </span>
              </>
            ) : (
              "--Select a charger--"
            )}
          </div>
          {isOpen && (
            <div className="select-items">
              {chargers.map((charger) => (
                <div
                  key={charger._id}
                  className={`select-item ${
                    selectedCharger === charger.chargerId ? "selected" : ""
                  }`}
                  onClick={() => {
                    handleChargerChange({
                      target: {
                        value: charger.chargerId,
                        id: "charger-select",
                        name: "charger-select",
                      } as HTMLSelectElement,
                    } as React.ChangeEvent<HTMLSelectElement>);
                    setIsOpen(false);
                  }}
                >
                  <span className="charger-id">{charger.chargerId}</span>
                  <span className="charger-location">{charger.location}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* If no charger selected, show a message */}
      {!selectedCharger && <p>Please select a charger to view bookings.</p>}

      {selectedCharger && (
        <div className="booking-details"  style={{ width: "60%", overflow: "auto" }}>
          {loading ? (
            <p>Loading...</p>
          ) : bookings.length === 0 ? (
            <p>No bookings received yet.</p>
          ) : (
            <table className="booking-table">
              <thead>
                <tr>
                  <th>BookingId</th>
                  <th>Date</th>
                  <th>Start Time</th>
                  <th>End Time</th>
                  <th>Contact Number</th>
                  <th>Message</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking._id}>
                    <td>{booking.chargerId}</td>
                    <td>{new Date(booking.Date).toLocaleDateString()}</td>
                    <td>{new Date(booking.StartTime).toLocaleTimeString()}</td>
                    <td>{new Date(booking.StartTime).toLocaleTimeString()}</td>
                    <td>{booking.contactNumber}</td>
                    <td>{booking.Message}</td>
                    <td
                      className={`status ${
                        booking.Status === "Pending"
                          ? "status-pending"
                          : booking.Status === "Confirmed"
                          ? "status-confirmed"
                          : "status-rejected"
                      }`}
                    >
                      {booking.Status === "Confirmed" && (
                        <AiOutlineCheckCircle className="status-icon confirmed" />
                      )}
                      {booking.Status === "Rejected" && (
                        <AiOutlineCloseCircle className="status-icon rejected" />
                      )}
                      {booking.Status === "Pending" && "Pending"}
                    </td>
                    <td>
                      {(booking.Status === "Pending" ||
                        booking.Status === "Confirmed" ||
                        booking.Status === "Rejected") && (
                        <div className="action-buttons">
                          {booking.Status !== "Confirmed" && (
                            <button
                              onClick={() =>
                                handleStatusChange(booking._id, "Confirmed")
                              }
                              disabled={loading}
                            >
                              Confirm
                            </button>
                          )}
                          {booking.Status !== "Rejected" && (
                            <button
                              style={{ backgroundColor: "red" }}
                              onClick={() =>
                                handleStatusChange(booking._id, "Rejected")
                              }
                              disabled={loading}
                            >
                              Reject
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

export default ReceivedBooking;
