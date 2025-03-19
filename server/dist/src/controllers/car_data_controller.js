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
const car_data_model_1 = __importDefault(require("../models/car_data_model"));
const user_model_1 = __importDefault(require("../models/user_model"));
const getCarData = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.body;
    if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
    }
    try {
        const user = yield user_model_1.default.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const carData = yield car_data_model_1.default.find({ userId: user._id });
        if (!carData || carData.length === 0) {
            const defaultCarData = new car_data_model_1.default({
                userId: user._id,
                brandName: "Unknown",
                carModel: "Unknown",
                year: 0,
                range: 0,
                fastChargingSpeed: 0,
                homeChargingSpeed: 0,
                batteryCapacity: 0,
            });
            return res.status(200).json([defaultCarData]);
        }
        res.status(200).json(carData);
    }
    catch (error) {
        console.error("Error fetching car data:", error);
        res.status(500).json({ message: "Internal server error", error });
    }
});
const deleteCarData = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.body;
    if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
    }
    try {
        const user = yield user_model_1.default.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const carData = yield car_data_model_1.default.deleteMany({ userId: user._id });
        res.status(200).json(carData);
    }
    catch (error) {
        console.error("Error deleting car data:", error);
        res.status(500).json({ message: "Internal server error", error });
    }
});
exports.default = { getCarData, deleteCarData };
//# sourceMappingURL=car_data_controller.js.map