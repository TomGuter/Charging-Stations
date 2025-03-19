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
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
let app;
let comment1Id;
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
    comments: [],
};
beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
    app = yield (0, server_1.default)();
    yield user_model_1.default.findOneAndDelete({ email: testUser.email });
    yield add_charging_model_1.default.findOneAndDelete({ location: newChargingStation.location });
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
    test("should add a comment to the charging station", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app)
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
        const charger = yield add_charging_model_1.default.findById(chargerId);
        expect(charger).not.toBeNull();
        expect(charger === null || charger === void 0 ? void 0 : charger.comments.length).toBe(1);
        expect(charger === null || charger === void 0 ? void 0 : charger.comments[0].text).toBe("This is a test comment");
        comment1Id = (charger === null || charger === void 0 ? void 0 : charger.comments[0]._id.toString()) || "";
    }));
    test("should get the comment by id", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app)
            .get(`/addComments/getComment/${chargerId}/${comment1Id}`)
            .set("authorization", `Bearer ${testUser.refreshTokens[0]}`);
        expect(response.status).toBe(200);
        expect(response.body.message).toBe("Comment retrieved successfully");
        expect(response.body.comment.text).toBe("This is a test comment");
    }));
    test("should fail to get comment by id - charging station not found", () => __awaiter(void 0, void 0, void 0, function* () {
        const nonExistentChargerId = new mongoose_1.default.Types.ObjectId();
        const response = yield (0, supertest_1.default)(app)
            .get(`/addComments/getComment/${nonExistentChargerId}/${comment1Id}`)
            .set("authorization", `Bearer ${testUser.refreshTokens[0]}`);
        expect(response.status).toBe(404);
        expect(response.body).toHaveProperty("message", "Charging station not found");
    }));
    test("should fail to get comment by id - comment not found", () => __awaiter(void 0, void 0, void 0, function* () {
        const nonExistentCommentId = new mongoose_1.default.Types.ObjectId();
        const response = yield (0, supertest_1.default)(app)
            .get(`/addComments/getComment/${chargerId}/${nonExistentCommentId}`)
            .set("authorization", `Bearer ${testUser.refreshTokens[0]}`);
        expect(response.status).toBe(404);
        expect(response.body).toHaveProperty("message", "Comment not found");
    }));
    test("should fail to get comment by id - internal server error", () => __awaiter(void 0, void 0, void 0, function* () {
        const originalFindById = add_charging_model_1.default.findById;
        add_charging_model_1.default.findById = jest.fn().mockRejectedValue(new Error("Internal server error"));
        const response = yield (0, supertest_1.default)(app)
            .get(`/addComments/getComment/${chargerId}/${comment1Id}`)
            .set("authorization", `Bearer ${testUser.refreshTokens[0]}`);
        expect(response.status).toBe(500);
        expect(response.body).toHaveProperty("message", "Failed to retrieve comment");
        add_charging_model_1.default.findById = originalFindById;
    }));
    test("should update the comment", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app)
            .put(`/addComments/updateComment/${chargerId}/${comment1Id}`)
            .set("authorization", `Bearer ${testUser.refreshTokens[0]}`)
            .send({ text: "This is an updated comment" });
        expect(response.status).toBe(200);
        expect(response.body.message).toBe("Comment updated successfully");
        const charger = yield add_charging_model_1.default.findById(chargerId);
        expect(charger === null || charger === void 0 ? void 0 : charger.comments[0].text).toBe("This is an updated comment");
    }));
    test("should fail to update comment - charging station not found", () => __awaiter(void 0, void 0, void 0, function* () {
        const nonExistentChargerId = new mongoose_1.default.Types.ObjectId();
        const response = yield (0, supertest_1.default)(app)
            .put(`/addComments/updateComment/${nonExistentChargerId}/${comment1Id}`)
            .set("authorization", `Bearer ${testUser.refreshTokens[0]}`)
            .send({ text: "Updated comment text" });
        expect(response.status).toBe(404);
        expect(response.body).toHaveProperty("message", "Charging station not found");
    }));
    test("should fail to update comment - comment not found", () => __awaiter(void 0, void 0, void 0, function* () {
        const nonExistentCommentId = new mongoose_1.default.Types.ObjectId();
        const response = yield (0, supertest_1.default)(app)
            .put(`/addComments/updateComment/${chargerId}/${nonExistentCommentId}`)
            .set("authorization", `Bearer ${testUser.refreshTokens[0]}`)
            .send({ text: "Updated comment text" });
        expect(response.status).toBe(404);
        expect(response.body).toHaveProperty("message", "Comment not found");
    }));
    test("should fail to update comment - internal server error", () => __awaiter(void 0, void 0, void 0, function* () {
        const originalFindById = add_charging_model_1.default.findById;
        add_charging_model_1.default.findById = jest.fn().mockRejectedValue(new Error("Internal server error"));
        const response = yield (0, supertest_1.default)(app)
            .put(`/addComments/updateComment/${chargerId}/${comment1Id}`)
            .set("authorization", `Bearer ${testUser.refreshTokens[0]}`)
            .send({ text: "Updated comment text" });
        expect(response.status).toBe(500);
        expect(response.body).toHaveProperty("message", "Failed to update comment");
        add_charging_model_1.default.findById = originalFindById;
    }));
    test("should get comment by charger id", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app)
            .get(`/addComments/getCommentsByChargerId/${chargerId}`)
            .set("authorization", `Bearer ${testUser.refreshTokens[0]}`);
        expect(response.status).toBe(200);
        expect(response.body.comments[0].likes).toBe(0);
        expect(response.body.comments[0].text).toBe("This is an updated comment");
    }));
    test("should fail to get comments by charger id - charging station not found", () => __awaiter(void 0, void 0, void 0, function* () {
        const nonExistentChargerId = new mongoose_1.default.Types.ObjectId();
        const response = yield (0, supertest_1.default)(app)
            .get(`/addComments/getCommentsByChargerId/${nonExistentChargerId}`)
            .set("authorization", `Bearer ${testUser.refreshTokens[0]}`);
        expect(response.status).toBe(404);
        expect(response.body).toHaveProperty("message", "Charging station not found");
    }));
    test("should fail to get comments by charger id - internal server error", () => __awaiter(void 0, void 0, void 0, function* () {
        const originalFindById = add_charging_model_1.default.findById;
        add_charging_model_1.default.findById = jest.fn().mockRejectedValue(new Error("Internal server error"));
        const response = yield (0, supertest_1.default)(app)
            .get(`/addComments/getCommentsByChargerId/${chargerId}`)
            .set("authorization", `Bearer ${testUser.refreshTokens[0]}`);
        expect(response.status).toBe(500);
        expect(response.body).toHaveProperty("message", "Failed to retrieve comments");
        add_charging_model_1.default.findById = originalFindById;
    }));
    test("should toggleLikeDislikeComment - situation 1", () => __awaiter(void 0, void 0, void 0, function* () {
        let response = yield (0, supertest_1.default)(app)
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
        response = yield (0, supertest_1.default)(app)
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
        response = yield (0, supertest_1.default)(app)
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
        response = yield (0, supertest_1.default)(app)
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
    }));
    test("should toggleLikeDislikeComment - situation 2", () => __awaiter(void 0, void 0, void 0, function* () {
        let response = yield (0, supertest_1.default)(app)
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
        response = yield (0, supertest_1.default)(app)
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
        response = yield (0, supertest_1.default)(app)
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
    }));
    test("should fail to toggle like/dislike - comment not found", () => __awaiter(void 0, void 0, void 0, function* () {
        const nonExistentCommentId = new mongoose_1.default.Types.ObjectId();
        const response = yield (0, supertest_1.default)(app)
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
    }));
    test("should fail to toggle like/dislike - charger not found", () => __awaiter(void 0, void 0, void 0, function* () {
        const nonExistentChargerId = new mongoose_1.default.Types.ObjectId();
        const response = yield (0, supertest_1.default)(app)
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
    }));
    test("should fail to toggle like/dislike - internal server error", () => __awaiter(void 0, void 0, void 0, function* () {
        const originalFindById = add_charging_model_1.default.findById;
        add_charging_model_1.default.findById = jest.fn().mockRejectedValue(new Error("Internal server error"));
        const response = yield (0, supertest_1.default)(app)
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
        add_charging_model_1.default.findById = originalFindById;
    }));
    test("should delete the comment", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app)
            .delete(`/addComments/deleteComment/${chargerId}/${comment1Id}`)
            .set("authorization", `Bearer ${testUser.refreshTokens[0]}`);
        expect(response.status).toBe(200);
        expect(response.body.message).toBe("Comment deleted successfully");
        const charger = yield add_charging_model_1.default.findById(chargerId);
        expect(charger === null || charger === void 0 ? void 0 : charger.comments.length).toBe(0);
    }));
    test("should fail to delete comment by id - charging station not found", () => __awaiter(void 0, void 0, void 0, function* () {
        const nonExistentChargerId = new mongoose_1.default.Types.ObjectId();
        const response = yield (0, supertest_1.default)(app)
            .delete(`/addComments/deleteComment/${nonExistentChargerId}/${comment1Id}`)
            .set("authorization", `Bearer ${testUser.refreshTokens[0]}`);
        expect(response.status).toBe(404);
        expect(response.body).toHaveProperty("message", "Charging station not found");
    }));
    test("should fail to delete comment by id - comment not found", () => __awaiter(void 0, void 0, void 0, function* () {
        const nonExistentCommentId = new mongoose_1.default.Types.ObjectId();
        const response = yield (0, supertest_1.default)(app)
            .delete(`/addComments/deleteComment/${chargerId}/${nonExistentCommentId}`)
            .set("authorization", `Bearer ${testUser.refreshTokens[0]}`);
        expect(response.status).toBe(404);
        expect(response.body).toHaveProperty("message", "Comment not found");
    }));
    test("should fail to delete comment by id - internal server error", () => __awaiter(void 0, void 0, void 0, function* () {
        const originalFindById = add_charging_model_1.default.findById;
        add_charging_model_1.default.findById = jest.fn().mockRejectedValue(new Error("Internal server error"));
        const response = yield (0, supertest_1.default)(app)
            .delete(`/addComments/deleteComment/${chargerId}/${comment1Id}`)
            .set("authorization", `Bearer ${testUser.refreshTokens[0]}`);
        expect(response.status).toBe(500);
        expect(response.body).toHaveProperty("message", "Failed to delete comment");
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
});
//# sourceMappingURL=add_comments.test.js.map