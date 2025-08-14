import { Request, Response } from "express";
import BookCharger from "../models/book_a_chrager.model";


// const bookCharger = async (req: Request, res: Response) => {
//   try {
//     const {
//       chargerId,
//       startTime,
//       endTime,
//       date,
//       message,
//       contactNumber,
//       userId,
//     } = req.body;


//     const parsedStartTime = new Date(`${date}T${startTime}:00`);
//     const parsedEndTime = new Date(`${date}T${endTime}:00`);
//     const parsedDate = new Date(date); 

//     const booking = new BookCharger({
//       chargerId,
//       StartTime: parsedStartTime,
//       EndTime: parsedEndTime,
//       Date: parsedDate,
//       Message: message,
//       contactNumber,
//       userId,
//     });

//     await booking.save();

//     res.status(201).json({ message: "Charger booked successfully" });
//   } catch (error) {
//     res.status(500).json({ message: "Failed to book charger", error });
//   }
// };


const bookCharger = async (req: Request, res: Response) => {
  try {
    const {
      chargerId,
      startTime,
      endTime,
      date,
      message,
      contactNumber,
      userId,

      dateLeave,
      timeLeave,
      currentBatteryLevel,
      desiredBatteryLevel,
      parkLocationSpotId,
      sendSmsOnComplete,
      sitePicker,
      vehicleModel,
      vehicleLicensePlate,
      vehicleYear,
      vehicleColor,
      vehicleDriverFullName,
      dialCode,
      vehicleDriverPhoneNumber,
      parkLocationFloor,
      note,
    } = req.body;

    const parsedDate = date ? new Date(date) : undefined;
    const parsedStartTime =
      date && startTime ? new Date(`${date}T${startTime}:00`) : undefined;
    const parsedEndTime =
      date && endTime ? new Date(`${date}T${endTime}:00`) : undefined;

    const parsedDateLeave = dateLeave ? new Date(dateLeave) : undefined;
    if (parsedDateLeave !== undefined && isNaN(parsedDateLeave.getTime())) {
      return res.status(400).json({ message: "Invalid dateLeave format" });
    }

    const normalizedTimeLeave =
      timeLeave !== undefined && timeLeave !== null
        ? String(timeLeave).trim()
        : undefined;

    const parsedCurrentBatteryLevel =
      currentBatteryLevel !== undefined && currentBatteryLevel !== ""
        ? Number(currentBatteryLevel)
        : undefined;

    const parsedDesiredBatteryLevel =
      desiredBatteryLevel !== undefined && desiredBatteryLevel !== ""
        ? Number(desiredBatteryLevel)
        : undefined;

    if (
      (currentBatteryLevel !== undefined &&
        Number.isNaN(parsedCurrentBatteryLevel)) ||
      (desiredBatteryLevel !== undefined &&
        Number.isNaN(parsedDesiredBatteryLevel))
    ) {
      return res
        .status(400)
        .json({ message: "Battery levels must be numbers" });
    }

    const parsedVehicleYear =
      vehicleYear !== undefined && vehicleYear !== ""
        ? Number(vehicleYear)
        : undefined;

    const parsedSendSmsOnComplete =
      typeof sendSmsOnComplete === "boolean"
        ? sendSmsOnComplete
        : typeof sendSmsOnComplete === "string"
        ? sendSmsOnComplete.toLowerCase() === "true"
        : undefined;

    const booking = new BookCharger({
      chargerId,
      StartTime: parsedStartTime,
      EndTime: parsedEndTime,
      Date: parsedDate,
      Message: message,
      contactNumber,
      userId,

      dateLeave: parsedDateLeave,
      timeLeave: normalizedTimeLeave,
      currentBatteryLevel: parsedCurrentBatteryLevel,
      desiredBatteryLevel: parsedDesiredBatteryLevel,
      sitePicker: sitePicker !== undefined ? String(sitePicker).trim() : undefined,
      vehicleModel: vehicleModel !== undefined ? String(vehicleModel).trim() : undefined,
      vehicleLicensePlate:
        vehicleLicensePlate !== undefined ? String(vehicleLicensePlate).trim() : undefined,
      vehicleDriverFullName:
        vehicleDriverFullName !== undefined ? String(vehicleDriverFullName).trim() : undefined,
      dialCode: dialCode !== undefined ? String(dialCode).trim() : undefined,
      vehicleDriverPhoneNumber:
        vehicleDriverPhoneNumber !== undefined
          ? String(vehicleDriverPhoneNumber).trim()
          : undefined,
      parkLocationSpotId: parkLocationSpotId || undefined,
      sendSmsOnComplete: parsedSendSmsOnComplete,
      vehicleYear: parsedVehicleYear,
      vehicleColor: vehicleColor || undefined,
      parkLocationFloor: parkLocationFloor || undefined,
      note: note || undefined,
    });

    await booking.save();
    res
      .status(201)
      .json({ message: "Charger booked successfully", id: booking._id });
  } catch (error) {
    res.status(500).json({ message: "Failed to book charger", error });
  }
};



const getAllBookings = async (req: Request, res: Response) => {
  try {
    const bookings = await BookCharger.find({});
    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch bookings", error });
  }
};

const getBookingById = async (req: Request, res: Response) => {
  try {
    const bookingId = req.params.bookingId;
    const booking = await BookCharger.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    res.status(200).json(booking);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch booking", error });
  }
};

const getBookingByChargerId = async (req: Request, res: Response) => {
  try {
    const chargerId = req.params.chargerId;
    const bookings = await BookCharger.find({ chargerId });
    if (!bookings) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch booking", error });
  }
};

const getBookingByUserId = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;
    const booking = await BookCharger.find({ userId });
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    res.status(200).json(booking);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch booking", error });
  }
};

const deleteBookingByID = async (req: Request, res: Response) => {
  try {
    const bookingId = req.params.bookingId;
    const booking = await BookCharger.findOneAndDelete({ _id: bookingId });
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    res.status(200).json({ message: "Booking deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete booking", error });
  }
};


const updateBooking = async (req: Request, res: Response) => {
  try {
    const bookingId = req.params.bookingId;
    const booking = await BookCharger.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const { startTime, endTime, date, message, contactNumber, status } = req.body;

    if (startTime && date) {
      booking.StartTime = new Date(`${date}T${startTime}:00`);
    }
    if (endTime && date) {
      booking.EndTime = new Date(`${date}T${endTime}:00`);
    }
    if (date) {
      booking.Date = new Date(date);
    }
    if (message) {
      booking.Message = message;
    }
    if (contactNumber) {
      booking.contactNumber = contactNumber;
    }
    if (status) {
      booking.Status = status;
    }

    await booking.save();
    res.status(200).json({ message: "Booking updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to update booking", error });
  }
};



export default {
  bookCharger,
  getAllBookings,
  getBookingById,
  deleteBookingByID,
  getBookingByUserId,
  getBookingByChargerId,
  updateBooking,
};
