import { Router } from "express";
import book_a_charger_controller from "../controllers/book_a_charger_controller";
import { authMiddleware } from "../controllers/user_controller_auth";

const router = Router();



/**
 * @swagger
 * tags:
 *   name: Create Bookings
 *   description: The Charging Stations Bookings API
 */




/**
 * @swagger
 * components:
 *   schemas:
 *     BookCharger:
 *       type: object
 *       required:
 *         - chargerId
 *         - startTime
 *         - endTime
 *         - date
 *         - contactNumber
 *         - message
 *       properties:
 *         chargerId:
 *           type: string
 *           description: The ID of the charging station.
 *           example: ""
 *         startTime:
 *           type: string
 *           format: time
 *           description: The start time of the booking in HH:MM format.
 *           example: "08:00"
 *         endTime:
 *           type: string
 *           format: time
 *           description: The end time of the booking in HH:MM format.
 *           example: "10:00"
 *         date:
 *           type: string
 *           format: date
 *           description: The date of the booking in YYYY-MM-DD format.
 *           example: "2025-03-10"
 *         contactNumber:
 *           type: string
 *           description: The contact number of the user.
 *           example: "0541234567"
 *         message:
 *           type: string
 *           description: The message from the user.
 *           example: "Please confirm my booking."
 *         Status:
 *           type: string
 *           description: The status of the booking.
 *           example: "Pending"
 *         userId:
 *           type: string
 *           description: The ID of the user who made the booking.
 *           example: ""
 */



/**
 * @swagger
 * /bookings/bookCharger:
 *   post:
 *     summary: Book a charging station
 *     description: Allows a user to book a charging station.
 *     tags:
 *       - Create Bookings
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BookCharger'
 *     responses:
 *       201:
 *         description: Booking created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Booking created successfully"
 *                 booking:
 *                   $ref: '#/components/schemas/BookCharger'
 *       400:
 *         description: Invalid input
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid input"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Unauthorized"
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
router.post("/bookCharger", authMiddleware, book_a_charger_controller.bookCharger);








/**
 * @swagger
 * /bookings/getAllBookings:
 *   get:
 *     summary: Get all bookings
 *     description: Retrieve a list of all bookings.
 *     tags:
 *       - Create Bookings
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of bookings retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/BookCharger'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Unauthorized"
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
router.get("/getAllBookings", authMiddleware, book_a_charger_controller.getAllBookings);






/**
 * @swagger
 * /bookings/getBookingById/{bookingId}:
 *   get:
 *     summary: Get booking by ID
 *     description: Retrieve a booking by its ID.
 *     tags:
 *       - Create Bookings
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the booking to retrieve.
 *     responses:
 *       200:
 *         description: Booking retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BookCharger'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Unauthorized"
 *       404:
 *         description: Booking not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Booking not found"
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
router.get("/getBookingById/:bookingId", authMiddleware, book_a_charger_controller.getBookingById);







/**
 * @swagger
 * /bookings/getBookingByChargerId/{chargerId}:
 *   get:
 *     summary: Get bookings by charger ID
 *     description: Retrieve all bookings for a specific charging station using its ID.
 *     tags:
 *       - Create Bookings
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: chargerId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the charging station to retrieve bookings for.
 *     responses:
 *       200:
 *         description: Bookings retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/BookCharger'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Unauthorized"
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
router.get("/getBookingByChargerId/:chargerId", authMiddleware, book_a_charger_controller.getBookingByChargerId);





/**
 * @swagger
 * /bookings/getBookingByUserId/{userId}:
 *   get:
 *     summary: Get bookings by user ID
 *     description: Retrieve all bookings made by a specific user using their ID.
 *     tags:
 *       - Create Bookings
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user to retrieve bookings for.
 *     responses:
 *       200:
 *         description: Bookings retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/BookCharger'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Unauthorized"
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
router.get("/getBookingByUserId/:userId", authMiddleware, book_a_charger_controller.getBookingByUserId);




/**
 * @swagger
 * /bookings/updateBooking/{bookingId}:
 *   put:
 *     summary: Update a booking by ID
 *     description: Update the details of a booking by its ID.
 *     tags:
 *       - Create Bookings
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the booking to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BookCharger'
 *     responses:
 *       200:
 *         description: Booking updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Booking updated successfully"
 *                 booking:
 *                   $ref: '#/components/schemas/BookCharger'
 *       400:
 *         description: Invalid input
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid input"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Unauthorized"
 *       404:
 *         description: Booking not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Booking not found"
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
router.put("/updateBooking/:bookingId", authMiddleware, book_a_charger_controller.updateBooking);




/**
 * @swagger
 * /bookings/deleteBookingByID/{bookingId}:
 *   delete:
 *     summary: Delete a booking by ID
 *     description: Delete a booking by its ID.
 *     tags:
 *       - Create Bookings
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the booking to delete.
 *     responses:
 *       200:
 *         description: Booking deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Booking deleted successfully"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Unauthorized"
 *       404:
 *         description: Booking not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Booking not found"
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
router.delete("/deleteBookingByID/:bookingId", authMiddleware, book_a_charger_controller.deleteBookingByID);




export default router;