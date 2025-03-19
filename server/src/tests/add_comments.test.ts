import request from "supertest";
import moduleApp from "../server";
import mongoose from "mongoose";
import userModel from "../models/user_model";
import { Express } from "express";
import chargingStationModel from "../models/add_charging_model";
import path from "path";
import fs from "fs";

let app: Express;
let comment1Id: string;

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
  comments: [],
};





beforeAll(async () => {
  app = await moduleApp();

  await userModel.findOneAndDelete({ email: testUser.email });
  await chargingStationModel.findOneAndDelete({  location: newChargingStation.location });

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


     test("should add a comment to the charging station", async () => {
      const response = await request(app)
          .post(`/addComments/addComment/${chargerId}`)
          .set("authorization", `Bearer ${testUser.refreshTokens[0]}`)
          .send({
              chargerId: chargerId,
              userId: testUser._id,
              text: "This is a test comment",
              likes: 0,
              rating: 0
          });
  
      expect(response.status).toBe(201);
      expect(response.body.text).toBe("This is a test comment");
  
      comment1Id = response.body._id;
  
      const charger = await chargingStationModel.findById(chargerId);
      expect(charger).not.toBeNull();
      expect(charger?.comments.length).toBe(1);
      expect(charger?.comments[0].text).toBe("This is a test comment");

      comment1Id = charger?.comments[0]._id.toString() || "";
    });

    test("should get the comment by id", async () => {
      const response = await request(app)
        .get(`/addComments/getComment/${chargerId}/${comment1Id}`)
        .set("authorization", `Bearer ${testUser.refreshTokens[0]}`);

        expect(response.status).toBe(200);
        expect(response.body.message).toBe("Comment retrieved successfully");
        expect(response.body.comment.text).toBe("This is a test comment");

    });

    test("should fail to get comment by id - charging station not found", async () => {
      const nonExistentChargerId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`/addComments/getComment/${nonExistentChargerId}/${comment1Id}`)
        .set("authorization", `Bearer ${testUser.refreshTokens[0]}`);
  
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("message", "Charging station not found");
    });

    test("should fail to get comment by id - comment not found", async () => {
      const nonExistentCommentId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`/addComments/getComment/${chargerId}/${nonExistentCommentId}`)
        .set("authorization", `Bearer ${testUser.refreshTokens[0]}`);
  
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("message", "Comment not found");
    });

    test("should fail to get comment by id - internal server error", async () => {
      const originalFindById = chargingStationModel.findById;
      chargingStationModel.findById = jest.fn().mockRejectedValue(new Error("Internal server error"));
  
      const response = await request(app)
        .get(`/addComments/getComment/${chargerId}/${comment1Id}`)
        .set("authorization", `Bearer ${testUser.refreshTokens[0]}`);
  
      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty("message", "Failed to retrieve comment");
  
      chargingStationModel.findById = originalFindById;
    });
    

    test("should update the comment", async () => {
      const response = await request(app)
        .put(`/addComments/updateComment/${chargerId}/${comment1Id}`)
        .set("authorization", `Bearer ${testUser.refreshTokens[0]}`)
        .send({ text: "This is an updated comment" });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Comment updated successfully");

      const charger = await chargingStationModel.findById(chargerId);
      expect(charger?.comments[0].text).toBe("This is an updated comment");
    });

    test("should fail to update comment - charging station not found", async () => {
      const nonExistentChargerId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .put(`/addComments/updateComment/${nonExistentChargerId}/${comment1Id}`)
        .set("authorization", `Bearer ${testUser.refreshTokens[0]}`)
        .send({ text: "Updated comment text" });
  
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("message", "Charging station not found");
    });

    test("should fail to update comment - comment not found", async () => {
      const nonExistentCommentId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .put(`/addComments/updateComment/${chargerId}/${nonExistentCommentId}`)
        .set("authorization", `Bearer ${testUser.refreshTokens[0]}`)
        .send({ text: "Updated comment text" });
  
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("message", "Comment not found");
    });

    test("should fail to update comment - internal server error", async () => {
      const originalFindById = chargingStationModel.findById;
      chargingStationModel.findById = jest.fn().mockRejectedValue(new Error("Internal server error"));
  
      const response = await request(app)
        .put(`/addComments/updateComment/${chargerId}/${comment1Id}`)
        .set("authorization", `Bearer ${testUser.refreshTokens[0]}`)
        .send({ text: "Updated comment text" });
  
      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty("message", "Failed to update comment");
  
      chargingStationModel.findById = originalFindById;
    });
  

    test("should get comment by charger id", async () => {
      const response = await request(app)
        .get(`/addComments/getCommentsByChargerId/${chargerId}`)
        .set("authorization", `Bearer ${testUser.refreshTokens[0]}`);

      expect(response.status).toBe(200);
      expect(response.body.comments[0].likes).toBe(0);
      expect(response.body.comments[0].text).toBe("This is an updated comment");

    });

    test("should fail to get comments by charger id - charging station not found", async () => {
      const nonExistentChargerId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`/addComments/getCommentsByChargerId/${nonExistentChargerId}`)
        .set("authorization", `Bearer ${testUser.refreshTokens[0]}`);
  
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("message", "Charging station not found");
    });

    test("should fail to get comments by charger id - internal server error", async () => {
      const originalFindById = chargingStationModel.findById;
      chargingStationModel.findById = jest.fn().mockRejectedValue(new Error("Internal server error"));
  
      const response = await request(app)
        .get(`/addComments/getCommentsByChargerId/${chargerId}`)
        .set("authorization", `Bearer ${testUser.refreshTokens[0]}`);
  
      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty("message", "Failed to retrieve comments");
  
      chargingStationModel.findById = originalFindById;
    });

    test("should toggleLikeDislikeComment - situation 1", async () => {
      let response = await request(app)
        .post(`/addComments/toggleLikeDislikeComment`)
        .set("authorization", `Bearer ${testUser.refreshTokens[0]}`)
        .send({
          chargerId: chargerId,
          commentId: comment1Id,
          userId: testUser._id,
          like: true
      });

      expect(response.status).toBe(200);
      expect(response.body.likes).toBe(1);
      expect(response.body.dislikes).toBe(0);

      response = await request(app)
        .post(`/addComments/toggleLikeDislikeComment`)
        .set("authorization", `Bearer ${testUser.refreshTokens[0]}`)
        .send({
          chargerId: chargerId,
          commentId: comment1Id,
          userId: testUser._id,
          like: true
      });

      expect(response.status).toBe(200);
      expect(response.body.likes).toBe(0);
      expect(response.body.dislikes).toBe(0);

      response = await request(app)
        .post(`/addComments/toggleLikeDislikeComment`)
        .set("authorization", `Bearer ${testUser.refreshTokens[0]}`)
        .send({
          chargerId: chargerId,
          commentId: comment1Id,
          userId: testUser._id,
          dislike: true
      });

      expect(response.status).toBe(200);
      expect(response.body.likes).toBe(0);
      expect(response.body.dislikes).toBe(1);

      response = await request(app)
        .post(`/addComments/toggleLikeDislikeComment`)
        .set("authorization", `Bearer ${testUser.refreshTokens[0]}`)
        .send({
          chargerId: chargerId,
          commentId: comment1Id,
          userId: testUser._id,
          dislike: true
      });

      expect(response.status).toBe(200);
      expect(response.body.likes).toBe(0);
      expect(response.body.dislikes).toBe(0);

    });

    test("should toggleLikeDislikeComment - situation 2", async () => {
      let response = await request(app)
        .post(`/addComments/toggleLikeDislikeComment`)
        .set("authorization", `Bearer ${testUser.refreshTokens[0]}`)
        .send({
          chargerId: chargerId,
          commentId: comment1Id,
          userId: testUser._id,
          dislike: true
      });

      expect(response.status).toBe(200);
      expect(response.body.likes).toBe(0);
      expect(response.body.dislikes).toBe(1);

      response = await request(app)
        .post(`/addComments/toggleLikeDislikeComment`)
        .set("authorization", `Bearer ${testUser.refreshTokens[0]}`)
        .send({
          chargerId: chargerId,
          commentId: comment1Id,
          userId: testUser._id,
          like: true
      });

      expect(response.status).toBe(200);
      expect(response.body.likes).toBe(1);
      expect(response.body.dislikes).toBe(0);

      response = await request(app)
        .post(`/addComments/toggleLikeDislikeComment`)
        .set("authorization", `Bearer ${testUser.refreshTokens[0]}`)
        .send({
          chargerId: chargerId,
          commentId: comment1Id,
          userId: testUser._id,
          dislike: true
      });

      expect(response.status).toBe(200);
      expect(response.body.likes).toBe(0);
      expect(response.body.dislikes).toBe(1);

    });

    test("should fail to toggle like/dislike - comment not found", async () => {
      const nonExistentCommentId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .post(`/addComments/toggleLikeDislikeComment`)
        .set("authorization", `Bearer ${testUser.refreshTokens[0]}`)
        .send({
          chargerId: chargerId,
          commentId: nonExistentCommentId,
          userId: testUser._id,
          like: true
        });
  
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("message", "Comment not found");
    });

    test("should fail to toggle like/dislike - charger not found", async () => {
      const nonExistentChargerId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .post(`/addComments/toggleLikeDislikeComment`)
        .set("authorization", `Bearer ${testUser.refreshTokens[0]}`)
        .send({
          chargerId: nonExistentChargerId,
          commentId: comment1Id,
          userId: testUser._id,
          like: true
        });
  
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("message", "Comment not found");
    });

    test("should fail to toggle like/dislike - internal server error", async () => {
      const originalFindById = chargingStationModel.findById;
      chargingStationModel.findById = jest.fn().mockRejectedValue(new Error("Internal server error"));
  
      const response = await request(app)
        .post(`/addComments/toggleLikeDislikeComment`)
        .set("authorization", `Bearer ${testUser.refreshTokens[0]}`)
        .send({
          chargerId: chargerId,
          commentId: comment1Id,
          userId: testUser._id,
          like: true
        });
  
      expect(response.status).toBe(500);
      expect(response.text).toBe("Server error");
  
      chargingStationModel.findById = originalFindById;
    });

    test("should delete the comment", async () => {
      const response = await request(app)
        .delete(`/addComments/deleteComment/${chargerId}/${comment1Id}`)
        .set("authorization", `Bearer ${testUser.refreshTokens[0]}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Comment deleted successfully");

      const charger = await chargingStationModel.findById(chargerId);
      expect(charger?.comments.length).toBe(0);

    });

    test("should fail to delete comment by id - charging station not found", async () => {
      const nonExistentChargerId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .delete(`/addComments/deleteComment/${nonExistentChargerId}/${comment1Id}`)
        .set("authorization", `Bearer ${testUser.refreshTokens[0]}`);
  
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("message", "Charging station not found");
    });

    test("should fail to delete comment by id - comment not found", async () => {
      const nonExistentCommentId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .delete(`/addComments/deleteComment/${chargerId}/${nonExistentCommentId}`)
        .set("authorization", `Bearer ${testUser.refreshTokens[0]}`);
  
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("message", "Comment not found");
    });

    test("should fail to delete comment by id - internal server error", async () => {
      const originalFindById = chargingStationModel.findById;
      chargingStationModel.findById = jest.fn().mockRejectedValue(new Error("Internal server error"));
  
      const response = await request(app)
        .delete(`/addComments/deleteComment/${chargerId}/${comment1Id}`)
        .set("authorization", `Bearer ${testUser.refreshTokens[0]}`);
  
      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty("message", "Failed to delete comment");
  
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
});
  


