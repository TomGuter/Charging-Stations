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
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "Users",
    },
});
const bookCharger = mongoose_1.default.model("BookCharger", BookCharger);
exports.default = bookCharger;
//# sourceMappingURL=book_a_chrager.model.js.map