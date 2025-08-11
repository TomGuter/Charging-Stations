"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const BookCharger = new mongoose_1.default.Schema({
    chargerId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
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
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "Users",
    },
    dateLeave: { type: Date, required: true },
    timeLeave: { type: String, required: true },
    currentBatteryLevel: { type: Number, required: true, min: 0, max: 100 },
    desiredBatteryLevel: { type: Number, required: true, min: 0, max: 100 },
    parkLocationSpotId: { type: String, required: false },
    sendSmsOnComplete: { type: Boolean, required: false, default: false },
    sitePicker: { type: String, required: true },
    vehicleModel: { type: String, required: true },
    vehicleLicensePlate: { type: String, required: true },
    vehicleYear: { type: Number, required: false },
    vehicleColor: { type: String, required: false },
    vehicleDriverFullName: { type: String, required: true },
    dialCode: { type: String, required: true },
    vehicleDriverPhoneNumber: { type: String, required: true },
    parkLocationFloor: { type: String, required: false },
    note: { type: String, required: false },
});
const bookBatteriCharger = mongoose_1.default.model("BookBatteriCharger", BookCharger);
exports.default = bookBatteriCharger;
//# sourceMappingURL=book_batteri_charger_model.js.map