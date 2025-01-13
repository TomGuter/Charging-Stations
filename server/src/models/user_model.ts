import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: false,
  },
  lastName: {
    type: String,
    required: false,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
    required: false,
  },
  picture: {
    type: String,
    required: false
  },
  refreshTokens: {
    type: [String],
    default: [],
  },
});

const userModel = mongoose.model("Users", userSchema);
export default userModel;
