"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const book_a_batteri_charger_controller_1 = __importDefault(require("../controllers/book_a_batteri_charger_controller"));
const user_controller_auth_1 = require("../controllers/user_controller_auth");
const router = (0, express_1.Router)();
router.post("/bookCharger", user_controller_auth_1.authMiddleware, book_a_batteri_charger_controller_1.default.bookCharger);
router.get("/getAllBookings", user_controller_auth_1.authMiddleware, book_a_batteri_charger_controller_1.default.getAllBookings);
router.get("/getBookingById/:bookingId", user_controller_auth_1.authMiddleware, book_a_batteri_charger_controller_1.default.getBookingById);
router.get("/getBookingByChargerId/:chargerId", user_controller_auth_1.authMiddleware, book_a_batteri_charger_controller_1.default.getBookingByChargerId);
router.get("/getBookingByUserId/:userId", user_controller_auth_1.authMiddleware, book_a_batteri_charger_controller_1.default.getBookingByUserId);
router.put("/updateBooking/:bookingId", user_controller_auth_1.authMiddleware, book_a_batteri_charger_controller_1.default.updateBooking);
router.delete("/deleteBookingByID/:bookingId", user_controller_auth_1.authMiddleware, book_a_batteri_charger_controller_1.default.deleteBookingByID);
exports.default = router;
//# sourceMappingURL=book_a_batteri_charger_route.js.map