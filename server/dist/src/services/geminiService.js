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
const dotenv_1 = __importDefault(require("dotenv"));
const axios_1 = __importDefault(require("axios"));
const https_1 = __importDefault(require("https"));
const car_data_model_1 = __importDefault(require("../models/car_data_model"));
const user_model_1 = __importDefault(require("../models/user_model"));
dotenv_1.default.config();
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = process.env.GEMINI_API_URL;
if (!GEMINI_API_KEY) {
    throw new Error("Gemini API key is not set in the .env file");
}
const agent = new https_1.default.Agent({
    keepAlive: false, // Disable keep-alive
    maxSockets: 1, // Limit concurrent connections
});
const saveCarData = (userId, brandName, carModel, year, range, fastChargingSpeed, homeChargingSpeed, batteryCapacity) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const user = yield user_model_1.default.findById(userId);
        if (!user) {
            console.error("User not found");
            return;
        }
        const existingCar = yield car_data_model_1.default.findOne({ userId });
        if (existingCar && existingCar._id.toString() === ((_a = user.carDetails) === null || _a === void 0 ? void 0 : _a.toString())) {
            existingCar.brandName = brandName;
            existingCar.carModel = carModel;
            existingCar.year = year;
            existingCar.range = range;
            existingCar.fastChargingSpeed = fastChargingSpeed;
            existingCar.homeChargingSpeed = homeChargingSpeed;
            existingCar.batteryCapacity = batteryCapacity;
            yield existingCar.save();
            console.log("Car information updated successfully!");
        }
        else {
            const newCarData = new car_data_model_1.default({
                userId,
                brandName,
                carModel,
                year,
                range,
                fastChargingSpeed,
                homeChargingSpeed,
                batteryCapacity,
            });
            yield newCarData.save();
            console.log("New car information saved successfully");
            user.carDetails = newCarData._id;
            yield user.save();
        }
    }
    catch (error) {
        console.error("Error saving car data:", error);
    }
});
const generateCarInfo = (text, userId, brandName, carModel, year) => __awaiter(void 0, void 0, void 0, function* () {
    const url = `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`;
    const systemPrompt = `Provide only the range (in km), fast charging speed (in kW), home charging speed (in kw) and battery capacity (in kWh) for ${text}. 
                       Format response exactly like this: range: number, fast charging speed: number, home charging speed: number, battery capacity: number.
                       Only provide these two metrics, no additional text.`;
    const payload = {
        contents: [
            {
                parts: [{ text: systemPrompt }],
            },
        ],
    };
    try {
        const agent = new https_1.default.Agent({ keepAlive: false, maxSockets: 1 });
        const config = {
            headers: { "Content-Type": "application/json" },
            httpsAgent: agent,
            timeout: 10000,
        };
        const response = yield axios_1.default.post(url, payload, config);
        const data = response.data;
        const responseText = data.candidates[0].content.parts[0].text.trim();
        const [rangePart, fastChargingPart, homeChargingPart, batteryPart] = responseText.split(',').map(part => part.trim());
        const range = parseInt(rangePart.split(':')[1]);
        const fastChargingSpeed = parseInt(fastChargingPart.split(':')[1]);
        const homeChargingSpeed = parseInt(homeChargingPart.split(':')[1]);
        const batteryCapacity = parseInt(batteryPart.split(':')[1]);
        yield saveCarData(userId, brandName, carModel, year, range, fastChargingSpeed, homeChargingSpeed, batteryCapacity);
        return `Range: ${range}km, Fast charging Speed: ${fastChargingSpeed}kw, Home charging speed: ${homeChargingSpeed}kw, Battery Capacity: ${batteryCapacity}kwh`;
    }
    catch (error) {
        console.error("Error generating content:", error);
        throw error;
    }
    finally {
        agent.destroy();
    }
});
exports.default = generateCarInfo;
//# sourceMappingURL=geminiService.js.map