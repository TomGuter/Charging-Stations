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
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
    },
});

const bookCharger = mongoose.model("BookCharger", BookCharger);
export default bookCharger;
