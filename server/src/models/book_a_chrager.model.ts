import mongoose from "mongoose";

const BookCharger = new mongoose.Schema({
    chargerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Charging",
        required: true,
    },
    StartTime: {
        type: Date,
        required: false,
    },
    EndTime: {
        type: Date,
        required: false,
    },
    Date: {
        type: Date,
        required: false,
    },
    contactNumber: {
        type: String,
        required: false,
    },
    Message: {
        type: String,
        required: false,
    },
    Status: {
        type: String,
        default: "Pending",
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
    },

    dateLeave: { type: Date, required: false },
    timeLeave: { type: String, required: false },
    currentBatteryLevel: { type: Number, required: false, min: 0, max: 100 },
    desiredBatteryLevel: { type: Number, required: false, min: 0, max: 100 },
    parkLocationSpotId: { type: String, required: false },
    sendSmsOnComplete: { type: Boolean, required: false, default: false },
    sitePicker: { type: String, required: false },
    vehicleModel: { type: String, required: false },
    vehicleLicensePlate: { type: String, required: false },
    vehicleYear: { type: Number, required: false },
    vehicleColor: { type: String, required: false },
    vehicleDriverFullName: { type: String, required: false },
    dialCode: { type: String, required: false },
    vehicleDriverPhoneNumber: { type: String, required: false },
    parkLocationFloor: { type: String, required: false },
    note: { type: String, required: false },
});

const bookCharger = mongoose.model("BookCharger", BookCharger);
export default bookCharger;
