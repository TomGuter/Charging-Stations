import request from "supertest";
import moduleApp from "../server";
import mongoose from "mongoose";
import { Express } from "express";
import userModel from "../models/user_model";
import path from "path";
import fs from "fs";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

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

const testUserError: TestUser = {
  firstName: "Tom2",
  lastName: "Guter",
  email: "tom@user.com",
  password: "",
  phoneNumber: "0541234567",
  picture: null, 
  selectedChargingStations: [], 
  carDetails: null,
  refreshTokens: [], 
  _id: new mongoose.Types.ObjectId(), 
};

let app: Express;

beforeAll(async () => {
  app = await moduleApp();
  await userModel.findOneAndDelete({ email: testUser.email });
});

afterAll(async () => {
  await mongoose.connection.close();
});




describe("Auth Tests", () => {
  test("Auth Registration", async () => {
    const registerResponse = await request(app)
        .post("/auth/signUp")
        .send(testUser);
      expect(registerResponse.statusCode).toBe(200);
  });

  test("Auth Registration fail", async () => {
    
    const registerResponse = await request(app)
        .post("/auth/signUp")
        .send(testUserError);
      expect(registerResponse.statusCode).not.toBe(200);
  
  });

  test("Auth Registration fail - register the same user", async () => {
    
    const registerResponse = await request(app)
        .post("/auth/signUp")
        .send(testUser);
      expect(registerResponse.statusCode).not.toBe(200);
      expect(registerResponse.text).toBe("User already exists");
  
  });

  test("should fail to sign up - internal server error", async () => {
    const originalCreate = userModel.create;
    userModel.create = jest.fn().mockRejectedValue(new Error("Internal server error"));
  
    const response = await request(app)
      .post("/auth/signUp")
      .send({
        firstName: "Tom",
        lastName: "Guter",
        email: "tom@user2.com",
        password: "123456",
        phoneNumber: "0541234567"
      });
  
    expect(response.status).toBe(400);
  
    userModel.create = originalCreate;
  });

  
  test("Auth Login", async () => {
     const loginResponse = await request(app)
        .post("/auth/login")
        .send({ email: testUser.email, password: testUser.password });
      expect(loginResponse.statusCode).toBe(200);
    
      testUser.refreshTokens.push(loginResponse.body.accessToken)  ;
      testUser.refreshTokens.push(loginResponse.body.refreshToken);  ;
      testUser._id = loginResponse.body._id;
  });

  test("Make sure two access tokens are not the same", async () => {
    
    expect(testUser.refreshTokens[0]).not.toBe(testUser.refreshTokens[1]);
  });

  test("Auth Login fail - missing email", async () => {
    const loginResponse = await request(app)
      .post("/auth/login")
      .send({ email: "", password: "wrongPassword" });
    expect(loginResponse.statusCode).toBe(400);
    expect(loginResponse.text).toBe("wrong email or password");
  });
  
  test("Auth Login fail - wrong password", async () => {
    const loginResponse = await request(app)
      .post("/auth/login")
      .send({ email: testUser.email, password: "wrongPassword" });
    expect(loginResponse.statusCode).toBe(400);
    expect(loginResponse.text).toBe("wrong email or password");
  });
  
  test("Auth Login fail - wrong email", async () => {
    const loginResponse = await request(app)
      .post("/auth/login")
      .send({ email: "wrong@gmail.com", password: "wrongPassword" });
    expect(loginResponse.statusCode).toBe(400);
    expect(loginResponse.text).toBe("wrong email or password");
  });

  test("should fail to login - missing auth configuration", async () => {
    const originalTokenSecret = process.env.TOKEN_SECRET;
    delete process.env.TOKEN_SECRET;

    const response = await request(app)
      .post("/auth/login")
      .send({ email: testUser.email, password: testUser.password });

    expect(response.statusCode).toBe(400);
    expect(response.text).toBe("missing auth configuration");

    process.env.TOKEN_SECRET = originalTokenSecret;
  });

  test("should fail to login - internal server error", async () => {
    const originalFindOne = userModel.findOne;
    userModel.findOne = jest.fn().mockRejectedValue(new Error("Internal server error"));

    const response = await request(app)
      .post("/auth/login")
      .send({ email: testUser.email, password: testUser.password });

    expect(response.statusCode).toBe(400);

    userModel.findOne = originalFindOne;
  });
  

  test("should get all users successfully", async () => {
    const response = await request(app)
      .get("/auth/getAllUsers")
      .set("authorization", `Bearer ${testUser.refreshTokens[0]}`)
      .send();
    expect(response.statusCode).toBe(200);
    expect(response.body).toBeInstanceOf(Array);
  });

  test("should fail to get all users - internal server error", async () => {
    const originalFind = userModel.find;
    userModel.find = jest.fn().mockRejectedValue(new Error("Internal server error"));
  
    const response = await request(app)
      .get("/auth/getAllUsers")
      .set("authorization", `Bearer ${testUser.refreshTokens[0]}`)
      .send();
  
    expect(response.statusCode).toBe(500);
    expect(response.body).toHaveProperty("message", "Internal server error");
  
    userModel.find = originalFind;
  });

  test("should get user by id successfully", async () => {
    const response = await request(app)
      .get(`/auth/getUserById/${testUser._id}`)
      .set("authorization", `Bearer ${testUser.refreshTokens[0]}`)
      .send();
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("_id", testUser._id.toString());
  });

  test("should fail to get user by id - user not found", async () => {
    const nonExistentUserId = new mongoose.Types.ObjectId();
    const response = await request(app)
      .get(`/auth/getUserById/${nonExistentUserId}`)
      .set("authorization", `Bearer ${testUser.refreshTokens[0]}`)
      .send();
    expect(response.statusCode).toBe(404);
    expect(response.body).toHaveProperty("message", "User not found");
  });

  test("should fail to get user by id - internal server error", async () => {
    const originalFindById = userModel.findById;
    userModel.findById = jest.fn().mockRejectedValue(new Error("Internal server error"));
  
    const response = await request(app)
      .get(`/auth/getUserById/${testUser._id}`)
      .set("authorization", `Bearer ${testUser.refreshTokens[0]}`)
      .send();
  
    expect(response.statusCode).toBe(500);
    expect(response.body).toHaveProperty("message", "Internal server error");
  
    userModel.findById = originalFindById;
  });
  

  test("should verify access token successfully", async () => {
    const response = await request(app)
      .get("/auth/verifyAccessToken")
      .set("authorization", `Bearer ${testUser.refreshTokens[0]}`)
      .send();
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("message", "Token is valid");
    expect(response.body).toHaveProperty("decodedToken");
  });
  
  test("should fail to verify access token - missing token", async () => {
    const response = await request(app)
      .get("/auth/verifyAccessToken")
      .set("authorization", `Bearer `)
      .send();
    expect(response.statusCode).toBe(401);
    expect(response.text).toBe("missing token");
  });
  
  test("should fail to verify access token - invalid token", async () => {
    const response = await request(app)
      .get("/auth/verifyAccessToken")
      .set("authorization", `Bearer invalidToken`)
      .send();
    expect(response.statusCode).toBe(403);
    expect(response.text).toBe("invalid token access");
  });

  
  test("should refresh token successfully", async () => {
    const response = await request(app)
      .post("/auth/refresh")
      .send({ refreshToken: testUser.refreshTokens[1] });
  
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("accessToken");
    expect(response.body).toHaveProperty("refreshToken");
    testUser.refreshTokens[0] = response.body.accessToken;
    testUser.refreshTokens[1] = response.body.refreshToken;
  });

  test("should fail to refresh token - missing refresh token", async () => {
    const response = await request(app)
      .post("/auth/refresh")
      .send({ refreshToken: "" });
  
    expect(response.statusCode).toBe(400);
    expect(response.text).toBe("Invalid token");
  });

  test("Invalid refresh token", async () => {
    const response = await request(app)
      .post("/auth/refresh")
      .send({ refreshToken: "invalidToken" });
    expect(response.statusCode).not.toBe(200);
  });
  test("Refresh: Missing refresh token", async () => {
    const response = await request(app).post("/auth/refresh");
    expect(response.statusCode).not.toBe(200);
  });
  test("Missing TOKEN_SECRET in refresh", async () => {
    const originalSecret = process.env.TOKEN_SECRET;
    delete process.env.TOKEN_SECRET;
    const response = await request(app)
      .post("/auth/refresh")
      .send({ refreshToken: testUser.refreshTokens[1] });
    expect(response.statusCode).not.toBe(200);
    process.env.TOKEN_SECRET = originalSecret;
  });


  test("should update user by id", async () => {
      const imagePath = path.resolve(__dirname, "sedan_test.png");
      if (!fs.existsSync(imagePath)) {
        throw new Error(`File not found: ${imagePath}`);
      }

      const updatedUserData = {
          firstName: "UpdatedFirstName",
          lastName: "UpdatedLastName",
          phoneNumber: "0547654321"
      };
  
      const response = await request(app)
      .put(`/auth/updateUser/${testUser._id}`)
      .set("authorization", `Bearer ${testUser.refreshTokens[0]}`)
      .field("firstName", updatedUserData.firstName)
      .field("lastName", updatedUserData.lastName)
      .field("phoneNumber", updatedUserData.phoneNumber)
      .field("userId", testUser._id.toString())
      .attach("image", imagePath);
  
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("message", "User updated successfully");
    expect(response.body.user).toHaveProperty("firstName", updatedUserData.firstName);
    expect(response.body.user).toHaveProperty("lastName", updatedUserData.lastName);
    expect(response.body.user).toHaveProperty("phoneNumber", updatedUserData.phoneNumber);
  });

  test("should fail to update user - user not found", async () => {
    const nonExistentUserId = new mongoose.Types.ObjectId();
    const response = await request(app)
      .put(`/auth/updateUser/${nonExistentUserId}`)
      .set("authorization", `Bearer ${testUser.refreshTokens[0]}`)
      .send({
        firstName: "UpdatedFirstName",
        lastName: "UpdatedLastName",
        phoneNumber: "0547654321"
      });

    expect(response.statusCode).toBe(404);
    expect(response.body).toHaveProperty("message", "User not found");
  });

  test("should fail to update user - internal server error", async () => {
    const originalFindById = userModel.findById;
    userModel.findById = jest.fn().mockRejectedValue(new Error("Internal server error"));

    const response = await request(app)
      .put(`/auth/updateUser/${testUser._id}`)
      .set("authorization", `Bearer ${testUser.refreshTokens[0]}`)
      .send({
        firstName: "UpdatedFirstName",
        lastName: "UpdatedLastName",
        phoneNumber: "0547654321"
      });

    expect(response.statusCode).toBe(500);
    expect(response.body).toHaveProperty("message", "Internal server error");

    userModel.findById = originalFindById;
  });


  test("should fail to logout user - missing refresh token", async () => { 
    const response = await request(app)
        .post("/auth/logout")
        .set("authorization", `Bearer ${testUser.refreshTokens[0]}`)
        .send({ refreshToken: "" });
    expect(response.statusCode).toBe(400);
    expect(response.text).toBe("missing refresh token");
  });
  
  test("should fail to logout user - missing auth configuration", async () => {
    const originalTokenSecret = process.env.TOKEN_SECRET;
    delete process.env.TOKEN_SECRET;
  
    const response = await request(app)
      .post("/auth/logout")
      .set("authorization", `Bearer ${testUser.refreshTokens[0]}`)
      .send({ refreshToken: testUser.refreshTokens[1] });
  
    expect(response.statusCode).toBe(400);
    expect(response.text).toBe("missing auth configuration");
  
    process.env.TOKEN_SECRET = originalTokenSecret;
  });

  test("should fail to logout user - invalid token", async () => {
    const response = await request(app)
      .post("/auth/logout")
      .set("authorization", `Bearer ${testUser.refreshTokens[0]}`)
      .send({ refreshToken: "invalidToken" });
  
    expect(response.statusCode).toBe(403);
    expect(response.text).toBe("invalid token");
  });
  
  test("should fail to logout - user not found", async () => {
    if (!process.env.TOKEN_SECRET) {
      throw new Error("TOKEN_SECRET is not defined");
    }
    const refreshToken = jwt.sign({ _id: new mongoose.Types.ObjectId() }, process.env.TOKEN_SECRET, { expiresIn: '1h' });

    const response = await request(app)
      .post("/auth/logout")
      .set("authorization", `Bearer ${testUser.refreshTokens[0]}`)
      .send({ refreshToken });

    expect(response.statusCode).toBe(400);
    expect(response.text).toBe("invalid token");
  });

  test("should fail to logout - refresh token not in user's tokens", async () => {
    const userWithNullRefreshTokens = new userModel({
      firstName: "Tom",
      lastName: "Guter",
      email: "tom@user4.com",
      password: await bcrypt.hash("123456", 10),
      phoneNumber: "0541234567",
      refreshTokens: null,
    });
    await userWithNullRefreshTokens.save();
  
    if (!process.env.TOKEN_SECRET) {
      throw new Error("TOKEN_SECRET is not defined");
    }
    const refreshToken = jwt.sign({ _id: userWithNullRefreshTokens._id }, process.env.TOKEN_SECRET, { expiresIn: '1h' });
  
    const response = await request(app)
      .post("/auth/logout")
      .set("authorization", `Bearer ${testUser.refreshTokens[0]}`)
      .send({ refreshToken });
  
    expect(response.statusCode).toBe(400);
    expect(response.text).toBe("invalid token");
  
    await userModel.findOneAndDelete({ email: userWithNullRefreshTokens.email });
  }, 5000);

  test("should fail to logout - internal server error", async () => {
    const originalFindOne = userModel.findOne;
    userModel.findOne = jest.fn().mockRejectedValue(new Error("Internal server error"));

    const response = await request(app)
      .post("/auth/logout")
      .set("authorization", `Bearer ${testUser.refreshTokens[0]}`)
      .send({ refreshToken: testUser.refreshTokens[1] });

    expect(response.statusCode).toBe(400);
    expect(response.text).toBe("invalid token");

    userModel.findOne = originalFindOne;
  });

  test("should logout user", async () => {
    const response = await request(app)
        .post("/auth/logout")
        .set("authorization", `Bearer ${testUser.refreshTokens[0]}`)
        .send({ refreshToken: testUser.refreshTokens[1] });
    expect(response.statusCode).toBe(200);
  });

  test("Auth Login", async () => {
    const loginResponse = await request(app)
       .post("/auth/login")
       .send({ email: testUser.email, password: testUser.password });
     expect(loginResponse.statusCode).toBe(200);
   
     testUser.refreshTokens.push(loginResponse.body.accessToken)  ;
     testUser.refreshTokens.push(loginResponse.body.refreshToken);  ;
     testUser._id = loginResponse.body._id;
 });

 test("should delete user by id successfully", async () => {
  const response = await request(app)
    .delete(`/auth/deleteUser/${testUser._id}`)
    .set("authorization", `Bearer ${testUser.refreshTokens[0]}`)
    .send();
  expect(response.statusCode).toBe(200);
  expect(response.body).toHaveProperty("message", "User deleted successfully");
});

test("should fail to delete user by id - user not found", async () => {
  const nonExistentUserId = new mongoose.Types.ObjectId();
  const response = await request(app)
    .delete(`/auth/deleteUser/${nonExistentUserId}`)
    .set("authorization", `Bearer ${testUser.refreshTokens[0]}`)
    .send();
  expect(response.statusCode).toBe(404);
  expect(response.body).toHaveProperty("message", "User not found");
});

test("should fail to delete user by id - internal server error", async () => {
  const originalFindByIdAndDelete = userModel.findByIdAndDelete;
  userModel.findByIdAndDelete = jest.fn().mockRejectedValue(new Error("Internal server error"));

  const response = await request(app)
    .delete(`/auth/deleteUser/${testUser._id}`)
    .set("authorization", `Bearer ${testUser.refreshTokens[0]}`)
    .send();

  expect(response.statusCode).toBe(500);
  expect(response.body).toHaveProperty("message", "Internal server error");

  userModel.findByIdAndDelete = originalFindByIdAndDelete;
});

  test("should fail to refresh token - token timeout", async () => {
    if (!process.env.TOKEN_SECRET) {
      throw new Error("TOKEN_SECRET is not defined");
    }
    const shortLivedToken = jwt.sign({ _id: testUser._id }, process.env.TOKEN_SECRET, { expiresIn: '1s' });

    await new Promise(resolve => setTimeout(resolve, 2000));

    const response = await request(app)
      .post("/auth/refresh")
      .send({ refreshToken: shortLivedToken });

    expect(response.statusCode).toBe(403);
    expect(response.text).toBe("Invalid token");
  });

  test("should fail to refresh token - user not found", async () => {
    if (!process.env.TOKEN_SECRET) {
      throw new Error("TOKEN_SECRET is not defined");
    }
    const refreshToken = jwt.sign({ _id: new mongoose.Types.ObjectId() }, process.env.TOKEN_SECRET, { expiresIn: '1h' });

    const response = await request(app)
      .post("/auth/refresh")
      .send({ refreshToken });

    expect(response.statusCode).toBe(400);
    expect(response.text).toBe("Invalid token access");
  });

  test("should fail to refresh token - refresh token not in user's tokens", async () => {
    const userWithNullRefreshTokens = new userModel({
      firstName: "Tom",
      lastName: "Guter",
      email: "tom@user4.com",
      password: await bcrypt.hash("123456", 10),
      phoneNumber: "0541234567",
      refreshTokens: null,
    });
    await userWithNullRefreshTokens.save();

    if (!process.env.TOKEN_SECRET) {
      throw new Error("TOKEN_SECRET is not defined");
    }
    const refreshToken = jwt.sign({ _id: userWithNullRefreshTokens._id }, process.env.TOKEN_SECRET, { expiresIn: '1h' });

    const response = await request(app)
      .post("/auth/refresh")
      .send({ refreshToken });

    expect(response.statusCode).toBe(500);
    expect(response.text).toBe("Server error");

    await userModel.findByIdAndDelete(userWithNullRefreshTokens._id);
  }, 5000);

  test("should fail auth middleware - problem with configuration", async () => {
    const originalTokenSecret = process.env.TOKEN_SECRET;
    delete process.env.TOKEN_SECRET;
  
    const response = await request(app)
      .get("/auth/getAllUsers") 
      .set("authorization", `Bearer ${testUser.refreshTokens[0]}`)
      .send();
  
    expect(response.statusCode).toBe(400);
    expect(response.text).toBe("problem with configuration");
  
    process.env.TOKEN_SECRET = originalTokenSecret;
  });
  

});
