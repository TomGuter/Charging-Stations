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
    default: 0,
  },
  dislikes: {
    type: Number,
    default: 0,
  },
  likedUsers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
    },
  ],
  dislikedUsers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
    },
  ],
  Rating: {
    type: Number,
    default: 0,
  },
  Date: {
    type: Date,
    default: Date.now,
  },
});

const batteriChargerSchema = new mongoose.Schema({
  location: {
    type: String,
  },
  latitude: {
    type: Number,
    default: 0.0,
  },
  longitude: {
    type: Number,
    default: 0.0,
  },
  price: {
    type: Number,
    required: true,
  },
  rating: {
    type: Number,
    default: 0,
  },
  chargingRate: {
    type: Number,
    default: 0,
  },
  picture: {
    type: String,
  },
  description: {
    type: String,
  },
  comments: {
    type: [commentSchema],
    default: [],
  },
  likes: {
    type: Number,
    default: 0,
  },
  dislikes: {
    type: Number,
    default: 0,
  },
  likedUsers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
    },
  ],
  dislikedUsers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
    },
  ],
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
  },
});

const BatteriCharger =
  mongoose.models.BatteriCharger ||
  mongoose.model("BatteriCharger", batteriChargerSchema);

export default BatteriCharger;
