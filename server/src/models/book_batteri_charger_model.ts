import mongoose from "mongoose";

const BookCharger = new mongoose.Schema({
    chargerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Charging",
        required: true,
    },
    StartTime: {
        type: Date,
        required: true,
    },
    EndTime: {
        type: Date,
        required: true,
    },
    Date: {
        type: Date,
        required: true,
    },
    contactNumber: {
        type: String,
        required: true,
    },
    Message: {
        type: String,
        required: true,
    },
    Status: {
        type: String,
        default: "Pending",
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
    },
});

const bookBatteriCharger = mongoose.model("BookBatteriCharger", BookCharger);
export default bookBatteriCharger;
