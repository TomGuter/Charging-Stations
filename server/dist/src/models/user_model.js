"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const userSchema = new mongoose_1.default.Schema({
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
        required: false,
        default: null,
    },
    selectedChargingStations: {
        type: [mongoose_1.default.Schema.Types.ObjectId],
        ref: "Charging",
        default: [],
    },
    carDetails: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "CarData",
        required: false,
        default: null,
    },
    refreshTokens: {
        type: [String],
        default: [],
    },
});
const userModel = mongoose_1.default.model("Users", userSchema);
exports.default = userModel;
//# sourceMappingURL=user_model.js.map