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
const express_1 = __importDefault(require("express"));
const car_data_controller_1 = __importDefault(require("../controllers/car_data_controller"));
const router = express_1.default.Router();
/**
 * @swagger
 * tags:
 *   name: Car Data API
 *   description: Controller for car data
 */
/**
 * @swagger
 * /carData/get-car-data:
 *   post:
 *     summary: Get car data
 *     description: Retrieve car data based on provided user ID.
 *     tags:
 *       - Car Data API
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *             properties:
 *               userId:
 *                 type: string
 *                 description: The ID of the user.
 *                 example: ""
 *     responses:
 *       200:
 *         description: Car data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   userId:
 *                     type: string
 *                     description: The ID of the user.
 *                     example: ""
 *                   brandName:
 *                     type: string
 *                     description: The brand of the car.
 *                     example: "Unknown"
 *                   carModel:
 *                     type: string
 *                     description: The model of the car.
 *                     example: "Unknown"
 *                   year:
 *                     type: integer
 *                     description: The year of the car.
 *                     example: 0
 *                   range:
 *                     type: integer
 *                     description: The range of the car in miles.
 *                     example: 0
 *                   fastChargingSpeed:
 *                     type: integer
 *                     description: The fast charging speed of the car in kW.
 *                     example: 0
 *                   homeChargingSpeed:
 *                     type: integer
 *                     description: The home charging speed of the car in kW.
 *                     example: 0
 *                   batteryCapacity:
 *                     type: integer
 *                     description: The battery capacity of the car in kWh.
 *                     example: 0
 *       400:
 *         description: Invalid input
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User ID is required"
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Internal server error"
 *                 error:
 *                   type: string
 *                   example: "Error details"
 */
router.post("/get-car-data", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    car_data_controller_1.default.getCarData(req, res);
}));
/**
 * @swagger
 * /carData/delete-car-data:
 *   delete:
 *     summary: Delete car data
 *     description: Delete car data based on provided user ID.
 *     tags:
 *       - Car Data API
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *             properties:
 *               userId:
 *                 type: string
 *                 description: The ID of the user.
 *                 example: ""
 *     responses:
 *       200:
 *         description: Car data deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Car data deleted successfully"
 *       400:
 *         description: Invalid input
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User ID is required"
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Internal server error"
 *                 error:
 *                   type: string
 *                   example: "Error details"
 */
router.delete("/delete-car-data", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    car_data_controller_1.default.deleteCarData(req, res);
}));
exports.default = router;
//# sourceMappingURL=car_data_route.js.map