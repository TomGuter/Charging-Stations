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
const geminiService_1 = __importDefault(require("../services/geminiService"));
const router = express_1.default.Router();
/**
 * @swagger
 * tags:
 *   name: Gemini API
 *   description: Calling the API to get car information
 */
/**
 * @swagger
 * components:
 *   schemas:
 *     CarInfo:
 *       type: object
 *       required:
 *         - carBrand
 *         - carYear
 *         - carModel
 *         - userId
 *       properties:
 *         carBrand:
 *           type: string
 *           description: The brand of the car.
 *           example: "Tesla"
 *         carYear:
 *           type: integer
 *           description: The year of the car.
 *           example: 2024
 *         carModel:
 *           type: string
 *           description: The model of the car.
 *           example: "Model 3"
 *         userId:
 *           type: string
 *           description: The ID of the user.
 *           example: ""
 */
/**
 * @swagger
 * /gemini/generate-content:
 *   post:
 *     summary: Generate car information content
 *     description: Generate car information content based on car details.
 *     tags:
 *       - Gemini API
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CarInfo'
 *     responses:
 *       200:
 *         description: Content generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 result:
 *                   type: string
 *                   example: "Generated car information content"
 *       400:
 *         description: Invalid input
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "All car details (carBrand, carYear, carModel, userId) are required"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Failed to generate content"
 *                 error:
 *                   type: string
 *                   example: "Error details"
 */
router.post("/generate-content", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { carBrand, carYear, carModel, userId } = req.body;
    if (!carBrand || !carYear || !carModel || !userId) {
        return res.status(400).json({ error: "All car details (carBrand, carYear, carModel, userId) are required" });
    }
    try {
        const carInfoText = `Car Brand: ${carBrand}, Car Year: ${carYear}, Car Model: ${carModel}`;
        const result = yield (0, geminiService_1.default)(carInfoText, userId, carBrand, carModel, carYear);
        res.json(result);
    }
    catch (error) {
        console.error("Error generating content:", error);
        res.status(500).json({ message: "Failed to generate content", error });
    }
}));
exports.default = router;
//# sourceMappingURL=gemini_route.js.map