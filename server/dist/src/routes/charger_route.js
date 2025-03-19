"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const charger_controller_1 = __importDefault(require("../controllers/charger_controller"));
const user_controller_auth_1 = require("../controllers/user_controller_auth");
const uploads_1 = __importDefault(require("../uploads"));
const router = (0, express_1.Router)();
/**
 * @swagger
 * tags:
 *   name: Charging Stations
 *   description: The Charging Stations API
 */
/**
 * @swagger
 * components:
 *   schemas:
 *     Comment:
 *       type: object
 *       required:
 *         - text
 *       properties:
 *         text:
 *           type: string
 *           description: Comment text
 *       example:
 *         text: Great charging station!
 *     ChargingStation:
 *       type: object
 *       required:
 *         - userId
 *         - location
 *         - chargingRate
 *         - price
 *         - description
 *         - imageFile
 *       properties:
 *         _id:
 *           type: string
 *           description: The unique identifier of the charging station
 *         latitude:
 *           type: number
 *           description: The latitude of the charging station
 *         longitude:
 *           type: number
 *           description: The longitude of the charging station
 *         price:
 *           type: number
 *           description: Price for using the charging station
 *         rating:
 *           type: number
 *           description: Rating of the charging station
 *         picture:
 *           type: string
 *           description: Picture URL of the charging station
 *         description:
 *           type: string
 *           description: Description of the charging station
 *         comments:
 *           type: array
 *           description: List of comments for the charging station
 *           items:
 *             $ref: '#/components/schemas/Comment'
 *         userId:
 *           type: string
 *           description: The ID of the user who added the charging station
 *       example:
 *         Location:
 *         Price:
 *         rating:
 *         Description:
 */
/**
 * @swagger
 * /addChargingStation/addCharger:
 *   post:
 *     summary: Add a new charging station
 *     description: Add a new charging station with details. The `userId` is automatically associated with the authenticated user.
 *     tags:
 *       - Charging Stations
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 description: The ID of the user adding the charging station
 *               location:
 *                 type: string
 *                 description: The location of the charging station
 *               chargingRate:
 *                 type: number
 *                 description: Charging rate of the charging station
 *               price:
 *                 type: number
 *                 description: Price for using the charging station
 *               description:
 *                 type: string
 *                 description: Description of the charging station
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Image file of the charging station
 *             example:
 *               userId: 67861a6f42063748092fa962
 *               location: "123 Main St, Anytown, USA"
 *               chargingRate: 5
 *               price: 10
 *               description: "A new charging station"
 *               image: "image.jpg"
 *     responses:
 *       201:
 *         description: Charging station created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message
 *                 chargingStation:
 *                   $ref: '#/components/schemas/ChargingStation'
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
router.post("/addCharger", user_controller_auth_1.authMiddleware, uploads_1.default.single("image"), (req, res) => {
    charger_controller_1.default.addChargingStation(req, res);
});
/**
 * @swagger
 * /addChargingStation/getChargerById/{chargerId}:
 *   get:
 *     summary: Get a charging station by ID
 *     description: Retrieve details of a charging station using its unique ID.
 *     tags:
 *       - Charging Stations
 *     parameters:
 *       - in: path
 *         name: chargerId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the charging station
 *     responses:
 *       200:
 *         description: Charging station retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ChargingStation'
 *       404:
 *         description: Charging station not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Charging station not found
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Failed to retrieve charging station
 */
router.get("/getChargerById/:chargerId", (req, res) => {
    charger_controller_1.default.getChargerById(req, res);
});
/**
 * @swagger
 * /addChargingStation/getChargersByUserId/chargers/{userId}:
 *   get:
 *     summary: Get all charging stations by user ID
 *     description: Retrieve a list of all charging stations that belong to a specific user based on their user ID.
 *     tags:
 *       - Charging Stations
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The user ID to filter charging stations by
 *     responses:
 *       200:
 *         description: List of charging stations retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ChargingStation'
 *       404:
 *         description: No charging stations found for the given user ID
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: No charging stations found for this user
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Failed to retrieve charging stations
 */
router.get("/getChargersByUserId/chargers/:userId", user_controller_auth_1.authMiddleware, (req, res) => {
    charger_controller_1.default.getChargersByUserId(req, res);
});
/**
 * @swagger
 * /addChargingStation/updateCharger/{chargerId}:
 *   put:
 *     summary: Update charging station details
 *     description: Update the details of a specific charging station based on its ID.
 *     tags:
 *       - Charging Stations
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: chargerId
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique ID of the charging station to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ChargingStation'
 *     responses:
 *       200:
 *         description: Charging station updated successfully
 *       404:
 *         description: Charging station not found
 *       500:
 *         description: Server error
 */
router.put("/updateCharger/:chargerId", uploads_1.default.single("image"), user_controller_auth_1.authMiddleware, (req, res) => {
    charger_controller_1.default.updateCharger(req, res);
});
router.put("/toggleLikeDislikeCharger/", user_controller_auth_1.authMiddleware, (req, res) => {
    charger_controller_1.default.toggleLikeDislikeCharger(req, res);
});
/**
 * @swagger
 * /addChargingStation/deleteChargerById/{chargerId}:
 *   delete:
 *     summary: Delete a charging station by ID
 *     description: Deletes a specific charging station based on the provided charger ID.
 *     tags:
 *       - Charging Stations
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: chargerId
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique ID of the charging station to delete
 *     responses:
 *       200:
 *         description: Charging station deleted successfully
 *       404:
 *         description: Charging station not found
 *       500:
 *         description: Server error
 */
router.delete("/deleteChargerById/:chargerId/", user_controller_auth_1.authMiddleware, (req, res) => {
    charger_controller_1.default.deleteChargerById(req, res);
});
/**
 * @swagger
 * /addChargingStation/getAllChargers:
 *   get:
 *     summary: Get all charging stations
 *     description: Retrieve a list of all charging stations.
 *     tags:
 *       - Charging Stations
 *     responses:
 *       200:
 *         description: List of charging stations retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ChargingStation'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Failed to retrieve charging stations"
 */
router.get("/getAllChargers", (req, res) => {
    charger_controller_1.default.getAllChargers(req, res);
});
/**
 * @swagger
 * /addChargingStation/getUserByChargerId/{chargerId}:
 *   get:
 *     summary: Get user by charger ID
 *     description: Retrieve the user who added a specific charging station using its ID.
 *     tags:
 *       - Charging Stations
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: chargerId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the charging station
 *     responses:
 *       200:
 *         description: User retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "60d0fe4f5311236168a109ca"
 *                     firstName:
 *                       type: string
 *                       example: "Tom"
 *                     lastName:
 *                       type: string
 *                       example: "Guter"
 *                     email:
 *                       type: string
 *                       example: "test@gmail.com"
 *                     phoneNumber:
 *                       type: string
 *                       example: "0541234567"
 *       404:
 *         description: Charging station not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Charging station not found"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Server error"
 */
router.get("/getUserByChargerId/:chargerId", user_controller_auth_1.authMiddleware, (req, res) => {
    charger_controller_1.default.getUserByChargerId(req, res);
});
exports.default = router;
//# sourceMappingURL=charger_route.js.map