import request from "supertest";
import moduleApp from "../server";
import mongoose from "mongoose";
import userModel from "../models/user_model";
import { Express } from "express";
import path from "path";
import fs from "fs";
import chargingStationModel from "../models/add_charging_model";

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
  picture: "",
  description: "A new charging station",
  userId: new mongoose.Types.ObjectId(),
  likes: 0,
  dislikes: 0,
  likedUsers: [],
  dislikedUsers: [],
  comments: [],
};



beforeAll(async () => {
  app = await moduleApp();

  await userModel.findOneAndDelete({ email: testUser.email });

  const registerResponse = await request(app)
    .post("/auth/signUp")
    .send(testUser);
  expect(registerResponse.statusCode).toBe(200);

  const loginResponse = await request(app)
    .post("/auth/login")
    .send({ email: testUser.email, password: testUser.password });
  expect(loginResponse.statusCode).toBe(200);

  testUser.refreshTokens.push(loginResponse.body.accessToken)  ;
  testUser.refreshTokens.push(loginResponse.body.refreshToken);  ;
  testUser._id = loginResponse.body._id;
  newChargingStation.userId = testUser._id;
});

afterAll(async () => {
  await request(app)
  .delete(`/auth/deleteUser/${testUser._id}`)
  .set("authorization", `Bearer ${testUser.refreshTokens[0]}`);
  
  await mongoose.connection.close();
});




let chargerId: string;

describe("add charging station Test Suite", () => {

  test("should add a new charging station", async () => {
    const imagePath = path.resolve(__dirname, "sedan_test.png");
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

  test("should fail to add a new charging station - missing fields", async () => {
    const response = await request(app)
      .post("/addChargingStation/addCharger")
      .set("authorization", `Bearer ${testUser.refreshTokens[0]}`)
    
    expect(response.status).toBe(400);
    expect(response.body.error).toBe("All fields, including userId and an image, are required.");
  });


  test("should get charging station by id", async () => {
    const response = await request(app)
      .get(`/addChargingStation/getChargerById/${chargerId}`)
      .set("authorization", `Bearer ${testUser.refreshTokens[0]}`)
      .field("test", "test")

    expect(response.status).toBe(200);
  });

  test("should fail to get charging station by id - invalid id", async () => {
    const wrongId = "178b07b45241b1227ffe2b9a";
    const response = await request(app)
      .get(`/addChargingStation/getChargerById/${wrongId}`)
      .set("authorization", `Bearer ${testUser.refreshTokens[0]}`);

    expect(response.status).toBe(404);
  });

  test("should fail to get charging station by id - internal server error", async () => {
    const originalFindById = chargingStationModel.findById;
    chargingStationModel.findById = jest.fn().mockRejectedValue(new Error("Internal server error"));
  
    const response = await request(app)
      .get(`/addChargingStation/getChargerById/${chargerId}`)
      .set("authorization", `Bearer ${testUser.refreshTokens[0]}`);
  
    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty("message", "Failed to retrieve charger");
  
    chargingStationModel.findById = originalFindById;
  });

  test("should fail to get charging station by user id - invalid id", async () => {
    const wrongId = "178b07b45241b1227ffe2b9p";
    const response = await request(app)
    .get(`/addChargingStation/getChargersByUserId/chargers/${wrongId}`)
    .set("authorization", `Bearer ${testUser.refreshTokens[0]}`);

    expect(response.status).toBe(500);
    expect(response.body.message).toBe("Failed to get charging stations");
  });

  
  
  test("should get charging station by user id", async () => {
    const response = await request(app)
      .get(`/addChargingStation/getChargersByUserId/chargers/${testUser._id}`)
      .set("authorization", `Bearer ${testUser.refreshTokens[0]}`);

    expect(response.status).toBe(200);
  });

  
  test("shuold update the charging station", async () => {
    const response = await request(app)
      .put(`/addChargingStation/updateCharger/${chargerId}`)
      .set("authorization", `Bearer ${testUser.refreshTokens[0]}`)
      .send({ Description: "updated station", Price: 20, ChargingRate: 10 });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Charging station updated successfully");

    const charger = await chargingStationModel.findById(chargerId);
    expect(charger?.description).toBe("updated station");
  });

  test("should fail to update the charging station - invalid id", async () => {
    const wrongChargerId = "178b07b45241b1227ffe2b9a";
    const response = await request(app)
      .put(`/addChargingStation/updateCharger/${wrongChargerId}`)
      .set("authorization", `Bearer ${testUser.refreshTokens[0]}`)
      .send({ Description: "updated station", Price: 20 });
    
    expect(response.status).toBe(404);
    expect(response.body.message).toBe("Charging station not found");
  });

  test("should fail to update the charging station - internal server error", async () => {
    const originalFindById = chargingStationModel.findById;
    chargingStationModel.findById = jest.fn().mockRejectedValue(new Error("Internal server error"));
  
    const response = await request(app)
      .put(`/addChargingStation/updateCharger/${chargerId}`)
      .set("authorization", `Bearer ${testUser.refreshTokens[0]}`)
      .send({ Description: "updated station", Price: 20, ChargingRate: 10 });
  
    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty("message", "Failed to update charging station");
  
    chargingStationModel.findById = originalFindById;
  }, 5000);

  test("should toggleLikeDislikeCharger - situation 1", async () => {
    let response = await request(app)
      .put(`/addChargingStation/toggleLikeDislikeCharger`)
      .set("authorization", `Bearer ${testUser.refreshTokens[0]}`)
      .send({
        chargerId: chargerId,
        userId: testUser._id,
        like: true
    });

    expect(response.status).toBe(200);
    expect(response.body.likes).toBe(1);
    expect(response.body.dislikes).toBe(0);

    response = await request(app)
      .put(`/addChargingStation/toggleLikeDislikeCharger`)
      .set("authorization", `Bearer ${testUser.refreshTokens[0]}`)
      .send({
        chargerId: chargerId,
        userId: testUser._id,
        like: true
    });

    expect(response.status).toBe(200);
    expect(response.body.likes).toBe(0);
    expect(response.body.dislikes).toBe(0);

    response = await request(app)
      .put(`/addChargingStation/toggleLikeDislikeCharger`)
      .set("authorization", `Bearer ${testUser.refreshTokens[0]}`)
      .send({
        chargerId: chargerId,
        userId: testUser._id,
        dislike: true
    });

    expect(response.status).toBe(200);
    expect(response.body.likes).toBe(0);
    expect(response.body.dislikes).toBe(1);

    response = await request(app)
      .put(`/addChargingStation/toggleLikeDislikeCharger`)
      .set("authorization", `Bearer ${testUser.refreshTokens[0]}`)
      .send({
        chargerId: chargerId,
        userId: testUser._id,
        dislike: true
    });

    expect(response.status).toBe(200);
    expect(response.body.likes).toBe(0);
    expect(response.body.dislikes).toBe(0);

  }, 5000);

  test("should toggleLikeDislikeCharger - situation 2", async () => {
    let response = await request(app)
      .put(`/addChargingStation/toggleLikeDislikeCharger`)
      .set("authorization", `Bearer ${testUser.refreshTokens[0]}`)
      .send({
        chargerId: chargerId,
        userId: testUser._id,
        dislike: true
    });

    expect(response.status).toBe(200);
    expect(response.body.likes).toBe(0);
    expect(response.body.dislikes).toBe(1);

    response = await request(app)
      .put(`/addChargingStation/toggleLikeDislikeCharger`)
      .set("authorization", `Bearer ${testUser.refreshTokens[0]}`)
      .send({
        chargerId: chargerId,
        userId: testUser._id,
        like: true
    });

    expect(response.status).toBe(200);
    expect(response.body.likes).toBe(1);
    expect(response.body.dislikes).toBe(0);

    response = await request(app)
      .put(`/addChargingStation/toggleLikeDislikeCharger`)
      .set("authorization", `Bearer ${testUser.refreshTokens[0]}`)
      .send({
        chargerId: chargerId,
        userId: testUser._id,
        dislike: true
    });

    expect(response.status).toBe(200);
    expect(response.body.likes).toBe(0);
    expect(response.body.dislikes).toBe(1);

  }, 5000);

  test("should fail to toggle like/dislike - charger not found", async () => {
    const nonExistentChargerId = new mongoose.Types.ObjectId();
    const response = await request(app)
      .put(`/addChargingStation/toggleLikeDislikeCharger`)
      .set("authorization", `Bearer ${testUser.refreshTokens[0]}`)
      .send({
        chargerId: nonExistentChargerId,
        userId: testUser._id,
        like: true
      });
  
    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty("message", "Charger not found");
  });

  test("should fail to toggleLikeDislikeCharger - invalid id", async () => {
    const wrongId = "178b07b45241b1227ffe2rra";
    const response = await request(app)
      .put(`/addChargingStation/toggleLikeDislikeCharger`)
      .set("authorization", `Bearer ${testUser.refreshTokens[0]}`)
      .send({
        chargerId: wrongId,
        userId: testUser._id,
        like: true
    });
    expect(response.status).toBe(500);
    expect(response.body.message).toBe("Server error");
  });

  test("should get all charging stations", async () => {
    const response = await request(app)
      .get(`/addChargingStation/getAllChargers`)


    expect(response.status).toBe(200);
    expect(response.body.chargers.length).toBeGreaterThan(0);
  });

  test("should fail to get all charging stations - no charging stations found", async () => {
    const originalFind = chargingStationModel.find;
    chargingStationModel.find = jest.fn().mockResolvedValue([]);
  
    const response = await request(app)
      .get(`/addChargingStation/getAllChargers`);
  
    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty("message", "No charging stations found");
  
    chargingStationModel.find = originalFind;
  });

  test("should fail to get all charging stations - internal server error", async () => {
    const originalFind = chargingStationModel.find;
    chargingStationModel.find = jest.fn().mockRejectedValue(new Error("Internal server error"));

    const response = await request(app)
      .get(`/addChargingStation/getAllChargers`);

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty("message", "Failed to get charging stations");

    chargingStationModel.find = originalFind;
  });


  test("should get user by charger id", async () => {
    const response = await request(app)
      .get(`/addChargingStation/getUserByChargerId/${chargerId}`)
      .set("authorization", `Bearer ${testUser.refreshTokens[0]}`)
    expect(response.status).toBe(200);
  });

  test("should fail to get user by charger id - invalid id", async () => {
    const wrongId = "178b07b45241b1227ffe2b9r";
    const response = await request(app)
      .get(`/addChargingStation/getUserByChargerId/${wrongId}`)
      .set("authorization", `Bearer ${testUser.refreshTokens[0]}`);

    expect(response.status).toBe(500);
    expect(response.body.message).toBe("Failed to get user");
  });

  test("should fail to get user by charger id - charging station not found", async () => {
    const nonExistentChargerId = new mongoose.Types.ObjectId();
    const response = await request(app)
      .get(`/addChargingStation/getUserByChargerId/${nonExistentChargerId}`)
      .set("authorization", `Bearer ${testUser.refreshTokens[0]}`);

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty("message", "Charging station not found");
  });

  test("should fail to get user by charger id - user not found", async () => {
    const chargerWithoutUser = new chargingStationModel({
      location: "Test Location",
      latitude: 0,
      longitude: 0,
      price: 0,
      chargingRate: 0,
      description: "Test Description",
      picture: "test.jpg",
      userId: null, 
    });
    await chargerWithoutUser.save();

    const response = await request(app)
      .get(`/addChargingStation/getUserByChargerId/${chargerWithoutUser._id}`)
      .set("authorization", `Bearer ${testUser.refreshTokens[0]}`);

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty("message", "User not found");

    await chargingStationModel.findByIdAndDelete(chargerWithoutUser._id);
  });

  test("should fail to get user by charger id - internal server error", async () => {
    const originalFindById = chargingStationModel.findById;
    chargingStationModel.findById = jest.fn().mockRejectedValue(new Error("Internal server error"));

    const response = await request(app)
      .get(`/addChargingStation/getUserByChargerId/${chargerId}`)
      .set("authorization", `Bearer ${testUser.refreshTokens[0]}`);

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty("message", "Failed to get user");

    chargingStationModel.findById = originalFindById;
  });
  


  test("should delete the charging station", async () => {
    const response = await request(app)
      .delete(`/addChargingStation/deleteChargerById/${chargerId}`)
      .set("authorization", `Bearer ${testUser.refreshTokens[0]}`)

      
    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Comment deleted successfully");

    const charger = await chargingStationModel.findById(chargerId);
    expect(charger).toBeNull();


  }, 5000);

  test("should fail to delete the charging station - invalid id", async () => {
    const response = await request(app)
      .delete(`/addChargingStation/deleteChargerById/${chargerId}`)
      .set("authorization", `Bearer ${testUser.refreshTokens[0]}`);

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("Charging station not found");
  }, 5000);

  test("should fail to delete the charging station - internal server error", async () => {
    const originalFindById = chargingStationModel.findById;
    chargingStationModel.findById = jest.fn().mockRejectedValue(new Error("Internal server error"));
  
    const response = await request(app)
      .delete(`/addChargingStation/deleteChargerById/${chargerId}`)
      .set("authorization", `Bearer ${testUser.refreshTokens[0]}`);
  
    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty("message", "Failed to delete comment");
  
    chargingStationModel.findById = originalFindById;
  }, 5000);

  test("should fail to get charging stations by user id - no charging stations found", async () => {
    const response = await request(app)
      .get(`/addChargingStation/getChargersByUserId/chargers/${testUser._id}`)
      .set("authorization", `Bearer ${testUser.refreshTokens[0]}`);
  
    expect(response.status).toBe(404);
  }, 5000);

});
