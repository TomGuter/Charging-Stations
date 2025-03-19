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
const supertest_1 = __importDefault(require("supertest"));
const server_1 = __importDefault(require("../server"));
const mongoose_1 = __importDefault(require("mongoose"));
const user_model_1 = __importDefault(require("../models/user_model"));
const add_charging_model_1 = __importDefault(require("../models/add_charging_model"));
const book_a_chrager_model_1 = __importDefault(require("../models/book_a_chrager.model"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
let app;
const testUser = {
    firstName: "Tom2",
    lastName: "Guter",
    email: "tom@user.com",
    password: "123456",
    phoneNumber: "0541234567",
    picture: null,
    selectedChargingStations: [],
    carDetails: null,
    refreshTokens: [],
    _id: new mongoose_1.default.Types.ObjectId(),
};
const newChargingStation = {
    location: "New York",
    latitude: 40.7128,
    longitude: -74.006,
    price: 10,
    rating: 4.5,
    chargingRate: 5,
    picture: "http://example.com/picture.jpg",
    description: "A new charging station",
    userId: new mongoose_1.default.Types.ObjectId(),
    likes: 0,
    dislikes: 0,
    likedUsers: [],
    dislikedUsers: [],
    comments: [
        {
            userId: new mongoose_1.default.Types.ObjectId(),
            text: "Great station!!!!",
            likes: 0,
            dislikes: 0,
            likedUsers: [],
            dislikedUsers: [],
            Rating: 0,
            Date: new Date(),
        },
    ],
};
const bookingCharger = {
    bookingId: "",
    chargerId: "",
    StartTime: "10:00",
    EndTime: "12:00",
    Date: "2022-01-01",
    contactNumber: "0541234567",
    Message: "Booking for charging",
    Status: "Pending",
    userId: new mongoose_1.default.Types.ObjectId(),
};
beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
    app = yield (0, server_1.default)();
    yield user_model_1.default.findOneAndDelete({ email: testUser.email });
    yield add_charging_model_1.default.findOneAndDelete({
        location: newChargingStation.location,
    });
    const registerResponse = yield (0, supertest_1.default)(app)
        .post("/auth/signUp")
        .send(testUser);
    expect(registerResponse.statusCode).toBe(200);
    const loginResponse = yield (0, supertest_1.default)(app)
        .post("/auth/login")
        .send({ email: testUser.email, password: testUser.password });
    expect(loginResponse.statusCode).toBe(200);
    testUser.refreshTokens.push(loginResponse.body.accessToken);
    testUser.refreshTokens.push(loginResponse.body.refreshToken);
    testUser._id = loginResponse.body._id;
    newChargingStation.userId = testUser._id;
    bookingCharger.userId = testUser._id;
}));
afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, supertest_1.default)(app)
        .delete(`/auth/deleteUser/${testUser._id}`)
        .set("authorization", `Bearer ${testUser.refreshTokens[0]}`);
    yield mongoose_1.default.connection.close();
}));
let chargerId;
let bookingId;
describe("Book a charger", () => {
    test("should add a new charging station", () => __awaiter(void 0, void 0, void 0, function* () {
        const imagePath = path_1.default.resolve(__dirname, "sedan_test.png");
        console.log("imagePath", imagePath);
        if (!fs_1.default.existsSync(imagePath)) {
            throw new Error(`File not found: ${imagePath}`);
        }
        const response = yield (0, supertest_1.default)(app)
            .post("/addChargingStation/addCharger")
            .set("authorization", `Bearer ${testUser.refreshTokens[0]}`)
            .field("userId", testUser._id.toString())
            .field("location", newChargingStation.location)
            .field("chargingRate", newChargingStation.chargingRate.toString())
            .field("price", newChargingStation.price.toString())
            .field("description", newChargingStation.description)
            .field("latitude", newChargingStation.latitude.toString())
            .field("longitude", newChargingStation.longitude.toString())
            .field("test", "test")
            .attach("image", imagePath);
        if (response.status !== 201) {
            console.error("Error response:", response.body);
        }
        expect(response.status).toBe(201);
        expect(response.body.message).toBe("Charging station added successfully");
        expect(response.body.chargingStation).toHaveProperty("_id");
        chargerId = response.body.chargingStation._id;
    }));
    test("should book a charger", () => __awaiter(void 0, void 0, void 0, function* () {
        bookingCharger.chargerId = chargerId;
        bookingCharger.userId = testUser._id;
        const bookChargerResponse = yield (0, supertest_1.default)(app)
            .post("/bookings/bookCharger")
            .set("authorization", `Bearer ${testUser.refreshTokens[0]}`)
            .send({
            chargerId: bookingCharger.chargerId,
            startTime: bookingCharger.StartTime,
            endTime: bookingCharger.EndTime,
            date: bookingCharger.Date,
            message: bookingCharger.Message,
            contactNumber: bookingCharger.contactNumber,
            userId: bookingCharger.userId,
        });
        expect(bookChargerResponse.statusCode).toBe(201);
        expect(bookChargerResponse.body.message).toBe("Charger booked successfully");
    }));
    test("should fail to book a charger with invalid charger id", () => __awaiter(void 0, void 0, void 0, function* () {
        const bookChargerResponse = yield (0, supertest_1.default)(app)
            .post("/bookings/bookCharger")
            .set("authorization", `Bearer ${testUser.refreshTokens[0]}`)
            .send({
            chargerId: "invalid-charger-id",
            startTime: bookingCharger.StartTime,
            endTime: bookingCharger.EndTime,
            date: bookingCharger.Date,
            message: bookingCharger.Message,
            contactNumber: bookingCharger.contactNumber,
            userId: bookingCharger.userId,
        });
        expect(bookChargerResponse.statusCode).toBe(500);
        expect(bookChargerResponse.body.message).toBe("Failed to book charger");
    }));
    test("should get all bookings", () => __awaiter(void 0, void 0, void 0, function* () {
        const getAllBookingsResponse = yield (0, supertest_1.default)(app)
            .get("/bookings/getAllBookings")
            .set("authorization", `Bearer ${testUser.refreshTokens[0]}`);
        expect(getAllBookingsResponse.statusCode).toBe(200);
        expect(getAllBookingsResponse.body.length).toBeGreaterThan(0);
    }));
    test("should fail to get all bookings - internal server error", () => __awaiter(void 0, void 0, void 0, function* () {
        const originalFind = book_a_chrager_model_1.default.find;
        book_a_chrager_model_1.default.find = jest.fn().mockRejectedValue(new Error("Internal server error"));
        const getAllBookingsResponse = yield (0, supertest_1.default)(app)
            .get("/bookings/getAllBookings")
            .set("authorization", `Bearer ${testUser.refreshTokens[0]}`);
        expect(getAllBookingsResponse.statusCode).toBe(500);
        expect(getAllBookingsResponse.body).toHaveProperty("message", "Failed to fetch bookings");
        book_a_chrager_model_1.default.find = originalFind;
    }));
    test("should get booking by charger id", () => __awaiter(void 0, void 0, void 0, function* () {
        const getBookingByChargerIdResponse = yield (0, supertest_1.default)(app)
            .get(`/bookings/getBookingByChargerId/${chargerId}`)
            .set("authorization", `Bearer ${testUser.refreshTokens[0]}`);
        expect(getBookingByChargerIdResponse.statusCode).toBe(200);
        expect(getBookingByChargerIdResponse.body.length).toBeGreaterThan(0);
    }));
    test("should fail to get booking by charger id - internal server error", () => __awaiter(void 0, void 0, void 0, function* () {
        const originalFind = book_a_chrager_model_1.default.find;
        book_a_chrager_model_1.default.find = jest.fn().mockRejectedValue(new Error("Internal server error"));
        const getBookingByChargerIdResponse = yield (0, supertest_1.default)(app)
            .get(`/bookings/getBookingByChargerId/${chargerId}`)
            .set("authorization", `Bearer ${testUser.refreshTokens[0]}`);
        expect(getBookingByChargerIdResponse.statusCode).toBe(500);
        expect(getBookingByChargerIdResponse.body).toHaveProperty("message", "Failed to fetch booking");
        book_a_chrager_model_1.default.find = originalFind;
    }));
    test("should get booking by userId", () => __awaiter(void 0, void 0, void 0, function* () {
        const getBookingByUserIdResponse = yield (0, supertest_1.default)(app)
            .get(`/bookings/getBookingByUserId/${testUser._id}`)
            .set("authorization", `Bearer ${testUser.refreshTokens[0]}`);
        expect(getBookingByUserIdResponse.statusCode).toBe(200);
        expect(getBookingByUserIdResponse.body.length).toBeGreaterThan(0);
    }));
    test("should fail to get booking by user id - internal server error", () => __awaiter(void 0, void 0, void 0, function* () {
        const originalFind = book_a_chrager_model_1.default.find;
        book_a_chrager_model_1.default.find = jest.fn().mockRejectedValue(new Error("Internal server error"));
        const getBookingByUserIdResponse = yield (0, supertest_1.default)(app)
            .get(`/bookings/getBookingByUserId/${testUser._id}`)
            .set("authorization", `Bearer ${testUser.refreshTokens[0]}`);
        expect(getBookingByUserIdResponse.statusCode).toBe(500);
        expect(getBookingByUserIdResponse.body).toHaveProperty("message", "Failed to fetch booking");
        book_a_chrager_model_1.default.find = originalFind;
    }));
    test("should get booking by id successfully", () => __awaiter(void 0, void 0, void 0, function* () {
        const getBookingByUserIdResponse = yield (0, supertest_1.default)(app)
            .get(`/bookings/getBookingByUserId/${testUser._id}`)
            .set("authorization", `Bearer ${testUser.refreshTokens[0]}`);
        bookingId = getBookingByUserIdResponse.body[0]._id;
        const getBookingByIdResponse = yield (0, supertest_1.default)(app)
            .get(`/bookings/getBookingById/${bookingId}`)
            .set("authorization", `Bearer ${testUser.refreshTokens[0]}`);
        expect(getBookingByIdResponse.statusCode).toBe(200);
        expect(getBookingByIdResponse.body).toHaveProperty("_id", bookingId);
    }));
    test("should fail to get booking by id - booking not found", () => __awaiter(void 0, void 0, void 0, function* () {
        const nonExistentBookingId = new mongoose_1.default.Types.ObjectId();
        const getBookingByIdResponse = yield (0, supertest_1.default)(app)
            .get(`/bookings/getBookingById/${nonExistentBookingId}`)
            .set("authorization", `Bearer ${testUser.refreshTokens[0]}`);
        expect(getBookingByIdResponse.statusCode).toBe(404);
        expect(getBookingByIdResponse.body).toHaveProperty("message", "Booking not found");
    }));
    test("should fail to get booking by id - internal server error", () => __awaiter(void 0, void 0, void 0, function* () {
        const originalFindById = book_a_chrager_model_1.default.findById;
        book_a_chrager_model_1.default.findById = jest.fn().mockRejectedValue(new Error("Internal server error"));
        const getBookingByUserIdResponse = yield (0, supertest_1.default)(app)
            .get(`/bookings/getBookingByUserId/${testUser._id}`)
            .set("authorization", `Bearer ${testUser.refreshTokens[0]}`);
        const bookingId = getBookingByUserIdResponse.body[0]._id;
        const getBookingByIdResponse = yield (0, supertest_1.default)(app)
            .get(`/bookings/getBookingById/${bookingId}`)
            .set("authorization", `Bearer ${testUser.refreshTokens[0]}`);
        expect(getBookingByIdResponse.statusCode).toBe(500);
        expect(getBookingByIdResponse.body).toHaveProperty("message", "Failed to fetch booking");
        book_a_chrager_model_1.default.findById = originalFindById;
    }));
    test("should update booking", () => __awaiter(void 0, void 0, void 0, function* () {
        const getBookingByUserIdResponse = yield (0, supertest_1.default)(app)
            .get(`/bookings/getBookingByUserId/${testUser._id}`)
            .set("authorization", `Bearer ${testUser.refreshTokens[0]}`);
        const bookingId = getBookingByUserIdResponse.body[0]._id;
        const updateBookingResponse = yield (0, supertest_1.default)(app)
            .put(`/bookings/updateBooking/${bookingId}`)
            .set("authorization", `Bearer ${testUser.refreshTokens[0]}`)
            .send({
            bookingId: bookingId,
            chargerId: bookingCharger.chargerId,
            startTime: bookingCharger.StartTime,
            endTime: bookingCharger.EndTime,
            date: bookingCharger.Date,
            message: bookingCharger.Message,
            contactNumber: bookingCharger.contactNumber,
            userId: bookingCharger.userId,
            status: "Approved",
        });
        expect(updateBookingResponse.statusCode).toBe(200);
        expect(updateBookingResponse.body.message).toBe("Booking updated successfully");
    }));
    test("should delete booking by id successfully", () => __awaiter(void 0, void 0, void 0, function* () {
        const deleteBookingResponse = yield (0, supertest_1.default)(app)
            .delete(`/bookings/deleteBookingByID/${bookingId}`)
            .set("authorization", `Bearer ${testUser.refreshTokens[0]}`);
        expect(deleteBookingResponse.statusCode).toBe(200);
        expect(deleteBookingResponse.body).toHaveProperty("message", "Booking deleted successfully");
    }));
    test("should fail to delete booking by id - booking not found", () => __awaiter(void 0, void 0, void 0, function* () {
        const nonExistentBookingId = new mongoose_1.default.Types.ObjectId();
        const deleteBookingResponse = yield (0, supertest_1.default)(app)
            .delete(`/bookings/deleteBookingByID/${nonExistentBookingId}`)
            .set("authorization", `Bearer ${testUser.refreshTokens[0]}`);
        expect(deleteBookingResponse.statusCode).toBe(404);
        expect(deleteBookingResponse.body).toHaveProperty("message", "Booking not found");
    }));
    test("should fail to delete booking by id - internal server error", () => __awaiter(void 0, void 0, void 0, function* () {
        const originalFindOneAndDelete = book_a_chrager_model_1.default.findOneAndDelete;
        book_a_chrager_model_1.default.findOneAndDelete = jest.fn().mockRejectedValue(new Error("Internal server error"));
        const deleteBookingResponse = yield (0, supertest_1.default)(app)
            .delete(`/bookings/deleteBookingByID/${bookingId}`)
            .set("authorization", `Bearer ${testUser.refreshTokens[0]}`);
        expect(deleteBookingResponse.statusCode).toBe(500);
        expect(deleteBookingResponse.body).toHaveProperty("message", "Failed to delete booking");
        book_a_chrager_model_1.default.findOneAndDelete = originalFindOneAndDelete;
    }));
});
//# sourceMappingURL=book_a_charger.test.js.map