"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const book_a_chrager_model_1 = __importDefault(require("../models/book_a_chrager.model"));
const bookCharger = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { chargerId, startTime, endTime, date, message, contactNumber, userId, } = req.body;
        const parsedStartTime = new Date(`${date}T${startTime}:00`);
        const parsedEndTime = new Date(`${date}T${endTime}:00`);
        const parsedDate = new Date(date);
        const booking = new book_a_chrager_model_1.default({
            chargerId,
            StartTime: parsedStartTime,
            EndTime: parsedEndTime,
            Date: parsedDate,
            Message: message,
            contactNumber,
            userId,
        });
        yield booking.save();
        res.status(201).json({ message: "Charger booked successfully" });
    }
    catch (error) {
        res.status(500).json({ message: "Failed to book charger", error });
    }
});
const getAllBookings = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const bookings = yield book_a_chrager_model_1.default.find({});
        res.status(200).json(bookings);
    }
    catch (error) {
        res.status(500).json({ message: "Failed to fetch bookings", error });
    }
});
const getBookingById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const bookingId = req.params.bookingId;
        const booking = yield book_a_chrager_model_1.default.findById(bookingId);
        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }
        res.status(200).json(booking);
    }
    catch (error) {
        res.status(500).json({ message: "Failed to fetch booking", error });
    }
});
const getBookingByChargerId = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const chargerId = req.params.chargerId;
        const bookings = yield book_a_chrager_model_1.default.find({ chargerId });
        if (!bookings) {
            return res.status(404).json({ message: "Booking not found" });
        }
        res.status(200).json(bookings);
    }
    catch (error) {
        res.status(500).json({ message: "Failed to fetch booking", error });
    }
});
const getBookingByUserId = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.params.userId;
        const booking = yield book_a_chrager_model_1.default.find({ userId });
        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }
        res.status(200).json(booking);
    }
    catch (error) {
        res.status(500).json({ message: "Failed to fetch booking", error });
    }
});
const deleteBookingByID = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const bookingId = req.params.bookingId;
        const booking = yield book_a_chrager_model_1.default.findOneAndDelete({ _id: bookingId });
        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }
        res.status(200).json({ message: "Booking deleted successfully" });
    }
    catch (error) {
        res.status(500).json({ message: "Failed to delete booking", error });
    }
});
const updateBooking = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const bookingId = req.params.bookingId;
        const booking = yield book_a_chrager_model_1.default.findById(bookingId);
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
        yield booking.save();
        res.status(200).json({ message: "Booking updated successfully" });
    }
    catch (error) {
        res.status(500).json({ message: "Failed to update booking", error });
    }
});
exports.default = {
    bookCharger,
    getAllBookings,
    getBookingById,
    deleteBookingByID,
    getBookingByUserId,
    getBookingByChargerId,
    updateBooking,
};
//# sourceMappingURL=book_a_charger_controller.js.map