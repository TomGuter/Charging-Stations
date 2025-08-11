import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
    },
    text: {
        type: String,
        required: true,
    },
    likes: {
        type: Number,
        required: false,
        default: 0,
    },
    dislikes: {
        type: Number,
        required: false,
        default: 0,
    },
    likedUsers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
    }],
    dislikedUsers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
    }],
    Rating: {
        type: Number,
        required: false,
        default: 0,
    },
    Date: {
        type: Date,
        required: false,
        default: Date.now,
    },
});

const chargingSchema = new mongoose.Schema({
    location: {
        type: String,
        required: false,
    },
    latitude: {
        type: Number,
        required: false,
        default: 0.0,
    },
    longitude: {
        type: Number,
        required: false,
        default: 0.0,
    },
    price: {
        type: Number,
        required: true,
    },
    rating: {
        type: Number,
        required: false,
        default: 0,
    },
    chargingRate: {
        type: Number,
        required: false,
        default: 0,
    },
    picture: {
        type: String,
        required: false,
    },
    description: {
        type: String,
        required: false,
    },
    chargerType: {
        type: String,
        required: false,
        default: "none",
    },
    comments: {
        type: [commentSchema],
        default: [],
    },
    likes: {
        type: Number,
        required: false,
        default: 0,
    },
    dislikes: {
        type: Number,
        required: false,
        default: 0,
    },
    likedUsers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
    }],
    dislikedUsers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
    }],
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
    },

});

const chargingModel = mongoose.model("Charging", chargingSchema);
export default chargingModel;
