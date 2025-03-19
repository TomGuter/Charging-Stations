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
const add_charging_model_1 = __importDefault(require("../models/add_charging_model"));
const book_a_chrager_model_1 = __importDefault(require("../models/book_a_chrager.model"));
const axios_1 = __importDefault(require("axios"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const getCoordinates = (address) => __awaiter(void 0, void 0, void 0, function* () {
    const apiKey = process.env.OPENCAGE_API_KEY;
    const url = `${process.env.OPENCAGE_API_URL}=${encodeURIComponent(address)}&key=${apiKey}`;
    try {
        const response = yield axios_1.default.get(url);
        const data = response.data;
        if (data.results.length > 0) {
            const latitude = data.results[0].geometry.lat;
            const longitude = data.results[0].geometry.lng;
            console.log("Coordinates:", latitude, longitude);
            return { latitude, longitude };
        }
        else {
            console.error("No results found for the given address.");
            return null;
        }
    }
    catch (error) {
        console.error("Error fetching coordinates:", error);
        return null;
    }
});
const addChargingStation = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId, location, chargingRate, price, description } = req.body;
        const imageFile = req.file;
        if (!userId ||
            !location ||
            !chargingRate ||
            !price ||
            !description ||
            !imageFile) {
            return res
                .status(400)
                .json({
                error: "All fields, including userId and an image, are required.",
            });
        }
        let coordinates;
        if (req.body.test) {
            coordinates = { latitude: req.body.latitude, longitude: req.body.longitude };
        }
        else {
            coordinates = yield getCoordinates(location);
        }
        if (!coordinates) {
            return res.status(400).json({ error: "Invalid location" });
        }
        const { latitude, longitude } = coordinates;
        const newChargingStation = new add_charging_model_1.default({
            userId,
            location,
            latitude,
            longitude,
            price: parseFloat(price),
            chargingRate: parseFloat(chargingRate),
            description,
            picture: `/uploads/${userId}/${imageFile.filename}`,
        });
        yield newChargingStation.save();
        res.status(201).json({
            message: "Charging station added successfully",
            chargingStation: newChargingStation,
        });
    }
    catch (error) {
        console.error("Error in addChargingStation:", error);
        res.status(500).json({ message: "Failed to add charging station", error });
    }
});
const getChargerById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { chargerId } = req.params;
        const chargingStation = yield add_charging_model_1.default.findById(chargerId);
        if (!chargingStation) {
            return res.status(404).json({ message: "Charging station not found" });
        }
        res.status(200).json({ message: "Charger retrieved successfully", chargingStation });
    }
    catch (error) {
        res.status(500).json({ message: "Failed to retrieve charger", error });
    }
});
const getChargersByUserId = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.params;
        const chargers = yield add_charging_model_1.default.find({ userId });
        if (!chargers || chargers.length == 0) {
            return res
                .status(404)
                .json({ message: "No charging stations found for this user" });
        }
        res.status(200).json({ chargers });
    }
    catch (error) {
        res.status(500).json({ message: "Failed to get charging stations", error });
    }
});
const getAllChargers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const chargers = yield add_charging_model_1.default.find();
        if (!chargers || chargers.length == 0) {
            return res.status(404).json({ message: "No charging stations found" });
        }
        res.status(200).json({ chargers });
    }
    catch (error) {
        res.status(500).json({ message: "Failed to get charging stations", error });
    }
});
const updateCharger = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { chargerId } = req.params;
        const chargingStation = yield add_charging_model_1.default.findById(chargerId);
        if (!chargingStation) {
            return res.status(404).json({ message: "Charging station not found" });
        }
        if (req.body.Location && chargingStation.location !== req.body.Location) {
            const coordinates = yield getCoordinates(req.body.Location);
            if (coordinates) {
                chargingStation.latitude = coordinates.latitude;
                chargingStation.longitude = coordinates.longitude;
                chargingStation.location = req.body.Location;
            }
            else {
                return res.status(400).json({ message: "Invalid location" });
            }
        }
        if (req.body.ChargingRate)
            chargingStation.chargingRate = req.body.ChargingRate;
        if (req.body.Price)
            chargingStation.price = req.body.Price;
        if (req.body.Description)
            chargingStation.description = req.body.Description;
        if (req.file) {
            if (chargingStation.picture) {
                const existingPicturePath = path_1.default.resolve(__dirname, `../${chargingStation.picture}`);
                if (fs_1.default.existsSync(existingPicturePath)) {
                    fs_1.default.unlinkSync(existingPicturePath);
                }
            }
            chargingStation.picture = `/uploads/${req.body.userId}/${req.file.filename}`;
        }
        yield chargingStation.save();
        res.status(200).json({
            message: "Charging station updated successfully",
            chargingStation,
        });
    }
    catch (error) {
        console.error("Error updating charging station:", error);
        res
            .status(500)
            .json({ message: "Failed to update charging station", error });
    }
});
const deleteChargerById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { chargerId } = req.params;
        const charger = yield add_charging_model_1.default.findById(chargerId);
        if (!charger) {
            return res.status(404).json({ message: "Charging station not found" });
        }
        if (charger.picture) {
            const existingPicturePath = path_1.default.resolve(__dirname, `../${charger.picture}`);
            if (fs_1.default.existsSync(existingPicturePath)) {
                fs_1.default.unlinkSync(existingPicturePath);
            }
        }
        yield add_charging_model_1.default.findByIdAndDelete(chargerId);
        yield book_a_chrager_model_1.default.deleteMany({ chargerId });
        res.status(200).json({ message: "Comment deleted successfully" });
    }
    catch (error) {
        res.status(500).json({ message: "Failed to delete comment", error });
    }
});
const getUserByChargerId = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { chargerId } = req.params;
        const chargingStation = yield add_charging_model_1.default.findById(chargerId);
        if (!chargingStation) {
            return res.status(404).json({ message: "Charging station not found" });
        }
        const user = chargingStation.userId;
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({ user });
    }
    catch (error) {
        res.status(500).json({ message: "Failed to get user", error });
    }
});
const toggleLikeDislikeCharger = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { like, dislike } = req.body;
    const userId = req.body.userId;
    const chargerId = req.body.chargerId;
    try {
        const charger = yield add_charging_model_1.default.findById(chargerId);
        if (!charger) {
            return res.status(404).json({ message: "Charger not found" });
        }
        charger.likes = (_a = charger.likes) !== null && _a !== void 0 ? _a : 0;
        charger.dislikes = (_b = charger.dislikes) !== null && _b !== void 0 ? _b : 0;
        if (like) {
            if (charger.likedUsers.includes(userId)) {
                charger.likes--;
                charger.likedUsers = charger.likedUsers.filter((id) => !id.equals(userId));
            }
            else {
                charger.likes++;
                charger.likedUsers.push(userId);
                if (charger.dislikedUsers.includes(userId)) {
                    charger.dislikes--;
                    charger.dislikedUsers = charger.dislikedUsers.filter((id) => !id.equals(userId));
                }
            }
        }
        if (dislike) {
            if (charger.dislikedUsers.includes(userId)) {
                charger.dislikes--;
                charger.dislikedUsers = charger.dislikedUsers.filter((id) => !id.equals(userId));
            }
            else {
                charger.dislikes++;
                charger.dislikedUsers.push(userId);
                if (charger.likedUsers.includes(userId)) {
                    charger.likes--;
                    charger.likedUsers = charger.likedUsers.filter((id) => !id.equals(userId));
                }
            }
        }
        yield charger.save();
        res.json(charger);
    }
    catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});
exports.default = {
    addChargingStation,
    getChargerById,
    getAllChargers,
    updateCharger,
    deleteChargerById,
    getChargersByUserId,
    getUserByChargerId,
    toggleLikeDislikeCharger,
};
//# sourceMappingURL=charger_controller.js.map