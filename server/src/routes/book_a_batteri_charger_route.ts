import { Router } from "express";
import book_a_charger_controller from "../controllers/book_a_batteri_charger_controller";
import { authMiddleware } from "../controllers/user_controller_auth";

const router = Router();

router.post("/bookCharger", authMiddleware, book_a_charger_controller.bookCharger);
router.get("/getAllBookings", authMiddleware, book_a_charger_controller.getAllBookings);
router.get("/getBookingById/:bookingId", authMiddleware, book_a_charger_controller.getBookingById);
router.get("/getBookingByChargerId/:chargerId", authMiddleware, book_a_charger_controller.getBookingByChargerId);
router.get("/getBookingByUserId/:userId", authMiddleware, book_a_charger_controller.getBookingByUserId);
router.put("/updateBooking/:bookingId", authMiddleware, book_a_charger_controller.updateBooking);
router.delete("/deleteBookingByID/:bookingId", authMiddleware, book_a_charger_controller.deleteBookingByID);




export default router;