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
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const add_charging_model_1 = __importDefault(require("../models/add_charging_model"));
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
    picture: "",
    description: "A new charging station",
    userId: new mongoose_1.default.Types.ObjectId(),
    likes: 0,
    dislikes: 0,
    likedUsers: [],
    dislikedUsers: [],
    comments: [],
};
beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
    app = yield (0, server_1.default)();
    yield user_model_1.default.findOneAndDelete({ email: testUser.email });
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
    ;
    testUser._id = loginResponse.body._id;
    newChargingStation.userId = testUser._id;
}));
afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, supertest_1.default)(app)
        .delete(`/auth/deleteUser/${testUser._id}`)
        .set("authorization", `Bearer ${testUser.refreshTokens[0]}`);
    yield mongoose_1.default.connection.close();
}));
let chargerId;
describe("add charging station Test Suite", () => {
    test("should add a new charging station", () => __awaiter(void 0, void 0, void 0, function* () {
        const imagePath = path_1.default.resolve(__dirname, "sedan_test.png");
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
    test("should fail to add a new charging station - missing fields", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app)
            .post("/addChargingStation/addCharger")
            .set("authorization", `Bearer ${testUser.refreshTokens[0]}`);
        expect(response.status).toBe(400);
        expect(response.body.error).toBe("All fields, including userId and an image, are required.");
    }));
    test("should get charging station by id", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app)
            .get(`/addChargingStation/getChargerById/${chargerId}`)
            .set("authorization", `Bearer ${testUser.refreshTokens[0]}`)
            .field("test", "test");
        expect(response.status).toBe(200);
    }));
    test("should fail to get charging station by id - invalid id", () => __awaiter(void 0, void 0, void 0, function* () {
        const wrongId = "178b07b45241b1227ffe2b9a";
        const response = yield (0, supertest_1.default)(app)
            .get(`/addChargingStation/getChargerById/${wrongId}`)
            .set("authorization", `Bearer ${testUser.refreshTokens[0]}`);
        expect(response.status).toBe(404);
    }));
    test("should fail to get charging station by id - internal server error", () => __awaiter(void 0, void 0, void 0, function* () {
        const originalFindById = add_charging_model_1.default.findById;
        add_charging_model_1.default.findById = jest.fn().mockRejectedValue(new Error("Internal server error"));
        const response = yield (0, supertest_1.default)(app)
            .get(`/addChargingStation/getChargerById/${chargerId}`)
            .set("authorization", `Bearer ${testUser.refreshTokens[0]}`);
        expect(response.status).toBe(500);
        expect(response.body).toHaveProperty("message", "Failed to retrieve charger");
        add_charging_model_1.default.findById = originalFindById;
    }));
    test("should fail to get charging station by user id - invalid id", () => __awaiter(void 0, void 0, void 0, function* () {
        const wrongId = "178b07b45241b1227ffe2b9p";
        const response = yield (0, supertest_1.default)(app)
            .get(`/addChargingStation/getChargersByUserId/chargers/${wrongId}`)
            .set("authorization", `Bearer ${testUser.refreshTokens[0]}`);
        expect(response.status).toBe(500);
        expect(response.body.message).toBe("Failed to get charging stations");
    }));
    test("should get charging station by user id", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app)
            .get(`/addChargingStation/getChargersByUserId/chargers/${testUser._id}`)
            .set("authorization", `Bearer ${testUser.refreshTokens[0]}`);
        expect(response.status).toBe(200);
    }));
    test("shuold update the charging station", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app)
            .put(`/addChargingStation/updateCharger/${chargerId}`)
            .set("authorization", `Bearer ${testUser.refreshTokens[0]}`)
            .send({ Description: "updated station", Price: 20, ChargingRate: 10 });
        expect(response.status).toBe(200);
        expect(response.body.message).toBe("Charging station updated successfully");
        const charger = yield add_charging_model_1.default.findById(chargerId);
        expect(charger === null || charger === void 0 ? void 0 : charger.description).toBe("updated station");
    }));
    test("should fail to update the charging station - invalid id", () => __awaiter(void 0, void 0, void 0, function* () {
        const wrongChargerId = "178b07b45241b1227ffe2b9a";
        const response = yield (0, supertest_1.default)(app)
            .put(`/addChargingStation/updateCharger/${wrongChargerId}`)
            .set("authorization", `Bearer ${testUser.refreshTokens[0]}`)
            .send({ Description: "updated station", Price: 20 });
        expect(response.status).toBe(404);
        expect(response.body.message).toBe("Charging station not found");
    }));
    test("should fail to update the charging station - internal server error", () => __awaiter(void 0, void 0, void 0, function* () {
        const originalFindById = add_charging_model_1.default.findById;
        add_charging_model_1.default.findById = jest.fn().mockRejectedValue(new Error("Internal server error"));
        const response = yield (0, supertest_1.default)(app)
            .put(`/addChargingStation/updateCharger/${chargerId}`)
            .set("authorization", `Bearer ${testUser.refreshTokens[0]}`)
            .send({ Description: "updated station", Price: 20, ChargingRate: 10 });
        expect(response.status).toBe(500);
        expect(response.body).toHaveProperty("message", "Failed to update charging station");
        add_charging_model_1.default.findById = originalFindById;
    }), 5000);
    test("should toggleLikeDislikeCharger - situation 1", () => __awaiter(void 0, void 0, void 0, function* () {
        let response = yield (0, supertest_1.default)(app)
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
        response = yield (0, supertest_1.default)(app)
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
        response = yield (0, supertest_1.default)(app)
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
        response = yield (0, supertest_1.default)(app)
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
    }), 5000);
    test("should toggleLikeDislikeCharger - situation 2", () => __awaiter(void 0, void 0, void 0, function* () {
        let response = yield (0, supertest_1.default)(app)
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
        response = yield (0, supertest_1.default)(app)
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
        response = yield (0, supertest_1.default)(app)
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
    }), 5000);
    test("should fail to toggle like/dislike - charger not found", () => __awaiter(void 0, void 0, void 0, function* () {
        const nonExistentChargerId = new mongoose_1.default.Types.ObjectId();
        const response = yield (0, supertest_1.default)(app)
            .put(`/addChargingStation/toggleLikeDislikeCharger`)
            .set("authorization", `Bearer ${testUser.refreshTokens[0]}`)
            .send({
            chargerId: nonExistentChargerId,
            userId: testUser._id,
            like: true
        });
        expect(response.status).toBe(404);
        expect(response.body).toHaveProperty("message", "Charger not found");
    }));
    test("should fail to toggleLikeDislikeCharger - invalid id", () => __awaiter(void 0, void 0, void 0, function* () {
        const wrongId = "178b07b45241b1227ffe2rra";
        const response = yield (0, supertest_1.default)(app)
            .put(`/addChargingStation/toggleLikeDislikeCharger`)
            .set("authorization", `Bearer ${testUser.refreshTokens[0]}`)
            .send({
            chargerId: wrongId,
            userId: testUser._id,
            like: true
        });
        expect(response.status).toBe(500);
        expect(response.body.message).toBe("Server error");
    }));
    test("should get all charging stations", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app)
            .get(`/addChargingStation/getAllChargers`);
        expect(response.status).toBe(200);
        expect(response.body.chargers.length).toBeGreaterThan(0);
    }));
    test("should fail to get all charging stations - no charging stations found", () => __awaiter(void 0, void 0, void 0, function* () {
        const originalFind = add_charging_model_1.default.find;
        add_charging_model_1.default.find = jest.fn().mockResolvedValue([]);
        const response = yield (0, supertest_1.default)(app)
            .get(`/addChargingStation/getAllChargers`);
        expect(response.status).toBe(404);
        expect(response.body).toHaveProperty("message", "No charging stations found");
        add_charging_model_1.default.find = originalFind;
    }));
    test("should fail to get all charging stations - internal server error", () => __awaiter(void 0, void 0, void 0, function* () {
        const originalFind = add_charging_model_1.default.find;
        add_charging_model_1.default.find = jest.fn().mockRejectedValue(new Error("Internal server error"));
        const response = yield (0, supertest_1.default)(app)
            .get(`/addChargingStation/getAllChargers`);
        expect(response.status).toBe(500);
        expect(response.body).toHaveProperty("message", "Failed to get charging stations");
        add_charging_model_1.default.find = originalFind;
    }));
    test("should get user by charger id", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app)
            .get(`/addChargingStation/getUserByChargerId/${chargerId}`)
            .set("authorization", `Bearer ${testUser.refreshTokens[0]}`);
        expect(response.status).toBe(200);
    }));
    test("should fail to get user by charger id - invalid id", () => __awaiter(void 0, void 0, void 0, function* () {
        const wrongId = "178b07b45241b1227ffe2b9r";
        const response = yield (0, supertest_1.default)(app)
            .get(`/addChargingStation/getUserByChargerId/${wrongId}`)
            .set("authorization", `Bearer ${testUser.refreshTokens[0]}`);
        expect(response.status).toBe(500);
        expect(response.body.message).toBe("Failed to get user");
    }));
    test("should fail to get user by charger id - charging station not found", () => __awaiter(void 0, void 0, void 0, function* () {
        const nonExistentChargerId = new mongoose_1.default.Types.ObjectId();
        const response = yield (0, supertest_1.default)(app)
            .get(`/addChargingStation/getUserByChargerId/${nonExistentChargerId}`)
            .set("authorization", `Bearer ${testUser.refreshTokens[0]}`);
        expect(response.status).toBe(404);
        expect(response.body).toHaveProperty("message", "Charging station not found");
    }));
    test("should fail to get user by charger id - user not found", () => __awaiter(void 0, void 0, void 0, function* () {
        const chargerWithoutUser = new add_charging_model_1.default({
            location: "Test Location",
            latitude: 0,
            longitude: 0,
            price: 0,
            chargingRate: 0,
            description: "Test Description",
            picture: "test.jpg",
            userId: null,
        });
        yield chargerWithoutUser.save();
        const response = yield (0, supertest_1.default)(app)
            .get(`/addChargingStation/getUserByChargerId/${chargerWithoutUser._id}`)
            .set("authorization", `Bearer ${testUser.refreshTokens[0]}`);
        expect(response.status).toBe(404);
        expect(response.body).toHaveProperty("message", "User not found");
        yield add_charging_model_1.default.findByIdAndDelete(chargerWithoutUser._id);
    }));
    test("should fail to get user by charger id - internal server error", () => __awaiter(void 0, void 0, void 0, function* () {
        const originalFindById = add_charging_model_1.default.findById;
        add_charging_model_1.default.findById = jest.fn().mockRejectedValue(new Error("Internal server error"));
        const response = yield (0, supertest_1.default)(app)
            .get(`/addChargingStation/getUserByChargerId/${chargerId}`)
            .set("authorization", `Bearer ${testUser.refreshTokens[0]}`);
        expect(response.status).toBe(500);
        expect(response.body).toHaveProperty("message", "Failed to get user");
        add_charging_model_1.default.findById = originalFindById;
    }));
    test("should delete the charging station", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app)
            .delete(`/addChargingStation/deleteChargerById/${chargerId}`)
            .set("authorization", `Bearer ${testUser.refreshTokens[0]}`);
        expect(response.status).toBe(200);
        expect(response.body.message).toBe("Comment deleted successfully");
        const charger = yield add_charging_model_1.default.findById(chargerId);
        expect(charger).toBeNull();
    }), 5000);
    test("should fail to delete the charging station - invalid id", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app)
            .delete(`/addChargingStation/deleteChargerById/${chargerId}`)
            .set("authorization", `Bearer ${testUser.refreshTokens[0]}`);
        expect(response.status).toBe(404);
        expect(response.body.message).toBe("Charging station not found");
    }), 5000);
    test("should fail to delete the charging station - internal server error", () => __awaiter(void 0, void 0, void 0, function* () {
        const originalFindById = add_charging_model_1.default.findById;
        add_charging_model_1.default.findById = jest.fn().mockRejectedValue(new Error("Internal server error"));
        const response = yield (0, supertest_1.default)(app)
            .delete(`/addChargingStation/deleteChargerById/${chargerId}`)
            .set("authorization", `Bearer ${testUser.refreshTokens[0]}`);
        expect(response.status).toBe(500);
        expect(response.body).toHaveProperty("message", "Failed to delete comment");
        add_charging_model_1.default.findById = originalFindById;
    }), 5000);
    test("should fail to get charging stations by user id - no charging stations found", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app)
            .get(`/addChargingStation/getChargersByUserId/chargers/${testUser._id}`)
            .set("authorization", `Bearer ${testUser.refreshTokens[0]}`);
        expect(response.status).toBe(404);
    }), 5000);
});
//# sourceMappingURL=add_charger.test.js.map