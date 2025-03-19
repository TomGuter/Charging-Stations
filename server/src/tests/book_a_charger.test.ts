import request from "supertest";
import moduleApp from "../server";
import mongoose from "mongoose";
import userModel from "../models/user_model";
import { Express } from "express";
import chargingStationModel from "../models/add_charging_model";
import BookCharger from "../models/book_a_chrager.model";
import path from "path";
import fs from "fs";

let app: Express;

interface TestUser {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber: string;
  picture: string | null;
  selectedChargingStations: [];
  carDetails: string | null;
  refreshTokens: string[];
  _id: mongoose.Types.ObjectId;
}

const testUser: TestUser = {
  firstName: "Tom2",
  lastName: "Guter",
  email: "tom@user.com",
  password: "123456",
  phoneNumber: "0541234567",
  picture: null,
  selectedChargingStations: [],
  carDetails: null,
  refreshTokens: [],
  _id: new mongoose.Types.ObjectId(),
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
  userId: new mongoose.Types.ObjectId(),
  likes: 0,
  dislikes: 0,
  likedUsers: [],
  dislikedUsers: [],
  comments: [
    {
      userId: new mongoose.Types.ObjectId(),
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
  userId: new mongoose.Types.ObjectId(),
};

beforeAll(async () => {
  app = await moduleApp();

  await userModel.findOneAndDelete({ email: testUser.email });
  await chargingStationModel.findOneAndDelete({
    location: newChargingStation.location,
  });

  const registerResponse = await request(app)
    .post("/auth/signUp")
    .send(testUser);
  expect(registerResponse.statusCode).toBe(200);

  const loginResponse = await request(app)
    .post("/auth/login")
    .send({ email: testUser.email, password: testUser.password });
  expect(loginResponse.statusCode).toBe(200);

  testUser.refreshTokens.push(loginResponse.body.accessToken);
  testUser.refreshTokens.push(loginResponse.body.refreshToken);
  testUser._id = loginResponse.body._id;
  newChargingStation.userId = testUser._id;

  bookingCharger.userId = testUser._id;
});

afterAll(async () => {
  await request(app)
    .delete(`/auth/deleteUser/${testUser._id}`)
    .set("authorization", `Bearer ${testUser.refreshTokens[0]}`);
    
  await mongoose.connection.close();
});

let chargerId: string;
let bookingId: string;

describe("Book a charger", () => {
  test("should add a new charging station", async () => {
    const imagePath = path.resolve(__dirname, "sedan_test.png");
    console.log("imagePath", imagePath);
    if (!fs.existsSync(imagePath)) {
      throw new Error(`File not found: ${imagePath}`);
    }

    const response = await request(app)
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
  });

  test("should book a charger", async () => {
    bookingCharger.chargerId = chargerId;
    bookingCharger.userId = testUser._id;

    const bookChargerResponse = await request(app)
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
  });

  test("should fail to book a charger with invalid charger id", async () => {
    const bookChargerResponse = await request(app)
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
  });

  test("should get all bookings", async () => {
    const getAllBookingsResponse = await request(app)
      .get("/bookings/getAllBookings")
      .set("authorization", `Bearer ${testUser.refreshTokens[0]}`);

    expect(getAllBookingsResponse.statusCode).toBe(200);
    expect(getAllBookingsResponse.body.length).toBeGreaterThan(0);
  });

  test("should fail to get all bookings - internal server error", async () => {
    const originalFind = BookCharger.find;
    BookCharger.find = jest.fn().mockRejectedValue(new Error("Internal server error"));
  
    const getAllBookingsResponse = await request(app)
      .get("/bookings/getAllBookings")
      .set("authorization", `Bearer ${testUser.refreshTokens[0]}`);
  
    expect(getAllBookingsResponse.statusCode).toBe(500);
    expect(getAllBookingsResponse.body).toHaveProperty("message", "Failed to fetch bookings");
  
    BookCharger.find = originalFind;
  });

  test("should get booking by charger id", async () => {
    const getBookingByChargerIdResponse = await request(app)
      .get(`/bookings/getBookingByChargerId/${chargerId}`)
      .set("authorization", `Bearer ${testUser.refreshTokens[0]}`);

    expect(getBookingByChargerIdResponse.statusCode).toBe(200);
    expect(getBookingByChargerIdResponse.body.length).toBeGreaterThan(0);
  });


  test("should fail to get booking by charger id - internal server error", async () => {
    const originalFind = BookCharger.find;
    BookCharger.find = jest.fn().mockRejectedValue(new Error("Internal server error"));
  
    const getBookingByChargerIdResponse = await request(app)
      .get(`/bookings/getBookingByChargerId/${chargerId}`)
      .set("authorization", `Bearer ${testUser.refreshTokens[0]}`);
  
    expect(getBookingByChargerIdResponse.statusCode).toBe(500);
    expect(getBookingByChargerIdResponse.body).toHaveProperty("message", "Failed to fetch booking");
  
    BookCharger.find = originalFind;
  });


  test("should get booking by userId", async () => {
    const getBookingByUserIdResponse = await request(app)
      .get(`/bookings/getBookingByUserId/${testUser._id}`)
      .set("authorization", `Bearer ${testUser.refreshTokens[0]}`);

    expect(getBookingByUserIdResponse.statusCode).toBe(200);
    expect(getBookingByUserIdResponse.body.length).toBeGreaterThan(0);
  });


  test("should fail to get booking by user id - internal server error", async () => {
    const originalFind = BookCharger.find;
    BookCharger.find = jest.fn().mockRejectedValue(new Error("Internal server error"));
  
    const getBookingByUserIdResponse = await request(app)
      .get(`/bookings/getBookingByUserId/${testUser._id}`)
      .set("authorization", `Bearer ${testUser.refreshTokens[0]}`);
  
    expect(getBookingByUserIdResponse.statusCode).toBe(500);
    expect(getBookingByUserIdResponse.body).toHaveProperty("message", "Failed to fetch booking");
  
    BookCharger.find = originalFind;
  });

  test("should get booking by id successfully", async () => {
    const getBookingByUserIdResponse = await request(app)
      .get(`/bookings/getBookingByUserId/${testUser._id}`)
      .set("authorization", `Bearer ${testUser.refreshTokens[0]}`);
    
    bookingId = getBookingByUserIdResponse.body[0]._id;
    
  
    const getBookingByIdResponse = await request(app)
      .get(`/bookings/getBookingById/${bookingId}`)
      .set("authorization", `Bearer ${testUser.refreshTokens[0]}`);
  
    expect(getBookingByIdResponse.statusCode).toBe(200);
    expect(getBookingByIdResponse.body).toHaveProperty("_id", bookingId);
  });

  test("should fail to get booking by id - booking not found", async () => {
    const nonExistentBookingId = new mongoose.Types.ObjectId();
    const getBookingByIdResponse = await request(app)
      .get(`/bookings/getBookingById/${nonExistentBookingId}`)
      .set("authorization", `Bearer ${testUser.refreshTokens[0]}`);
  
    expect(getBookingByIdResponse.statusCode).toBe(404);
    expect(getBookingByIdResponse.body).toHaveProperty("message", "Booking not found");
  });

  test("should fail to get booking by id - internal server error", async () => {
    const originalFindById = BookCharger.findById;
    BookCharger.findById = jest.fn().mockRejectedValue(new Error("Internal server error"));
  
    const getBookingByUserIdResponse = await request(app)
      .get(`/bookings/getBookingByUserId/${testUser._id}`)
      .set("authorization", `Bearer ${testUser.refreshTokens[0]}`);
    
    const bookingId = getBookingByUserIdResponse.body[0]._id;
  
    const getBookingByIdResponse = await request(app)
      .get(`/bookings/getBookingById/${bookingId}`)
      .set("authorization", `Bearer ${testUser.refreshTokens[0]}`);
  
    expect(getBookingByIdResponse.statusCode).toBe(500);
    expect(getBookingByIdResponse.body).toHaveProperty("message", "Failed to fetch booking");
  
    BookCharger.findById = originalFindById;
  });

  test("should update booking", async () => {
    const getBookingByUserIdResponse = await request(app)
      .get(`/bookings/getBookingByUserId/${testUser._id}`)
      .set("authorization", `Bearer ${testUser.refreshTokens[0]}`);
    
    const bookingId = getBookingByUserIdResponse.body[0]._id;
    const updateBookingResponse = await request(app)
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
  });

  test("should delete booking by id successfully", async () => {
  
    const deleteBookingResponse = await request(app)
      .delete(`/bookings/deleteBookingByID/${bookingId}`)
      .set("authorization", `Bearer ${testUser.refreshTokens[0]}`);
  
    expect(deleteBookingResponse.statusCode).toBe(200);
    expect(deleteBookingResponse.body).toHaveProperty("message", "Booking deleted successfully");
  });

  test("should fail to delete booking by id - booking not found", async () => {
    const nonExistentBookingId = new mongoose.Types.ObjectId();
    const deleteBookingResponse = await request(app)
      .delete(`/bookings/deleteBookingByID/${nonExistentBookingId}`)
      .set("authorization", `Bearer ${testUser.refreshTokens[0]}`);
  
    expect(deleteBookingResponse.statusCode).toBe(404);
    expect(deleteBookingResponse.body).toHaveProperty("message", "Booking not found");
  });

  test("should fail to delete booking by id - internal server error", async () => {
    const originalFindOneAndDelete = BookCharger.findOneAndDelete;
    BookCharger.findOneAndDelete = jest.fn().mockRejectedValue(new Error("Internal server error"));
  
    const deleteBookingResponse = await request(app)
      .delete(`/bookings/deleteBookingByID/${bookingId}`)
      .set("authorization", `Bearer ${testUser.refreshTokens[0]}`);
  
    expect(deleteBookingResponse.statusCode).toBe(500);
    expect(deleteBookingResponse.body).toHaveProperty("message", "Failed to delete booking");
  
    BookCharger.findOneAndDelete = originalFindOneAndDelete;
  });

});
