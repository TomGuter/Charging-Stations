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
}));
afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, supertest_1.default)(app)
        .delete(`/auth/deleteUser/${testUser._id}`)
        .set("authorization", `Bearer ${testUser.refreshTokens[0]}`);
    yield mongoose_1.default.connection.close();
}));
describe("create gemini content", () => {
    test("should get car data", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app)
            .post("/carData/get-car-data")
            .send({ userId: testUser._id });
        expect(response.statusCode).toBe(200);
        expect(response.body[0].userId).toEqual(testUser._id);
    }));
    test("should fail to get car data - missing user ID", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app)
            .post("/carData/get-car-data")
            .send({});
        expect(response.statusCode).toBe(400);
        expect(response.body).toHaveProperty("message", "User ID is required");
    }));
    test("should fail to get car data - user not found", () => __awaiter(void 0, void 0, void 0, function* () {
        const nonExistentUserId = new mongoose_1.default.Types.ObjectId();
        const response = yield (0, supertest_1.default)(app)
            .post("/carData/get-car-data")
            .send({ userId: nonExistentUserId });
        expect(response.statusCode).toBe(404);
        expect(response.body).toHaveProperty("message", "User not found");
    }));
    test("should fail to get car data - internal server error", () => __awaiter(void 0, void 0, void 0, function* () {
        const originalFindById = user_model_1.default.findById;
        user_model_1.default.findById = jest.fn().mockRejectedValue(new Error("Internal server error"));
        const response = yield (0, supertest_1.default)(app)
            .post("/carData/get-car-data")
            .send({ userId: testUser._id });
        expect(response.statusCode).toBe(500);
        expect(response.body).toHaveProperty("message", "Internal server error");
        user_model_1.default.findById = originalFindById;
    }));
    describe("delete car data", () => {
        test("should delete car data successfully", () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app)
                .delete("/carData/delete-car-data")
                .send({ userId: testUser._id });
            expect(response.statusCode).toBe(200);
            expect(response.body).toHaveProperty("deletedCount");
        }));
        test("should fail to delete car data - missing user ID", () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app)
                .delete("/carData/delete-car-data")
                .send({});
            expect(response.statusCode).toBe(400);
            expect(response.body).toHaveProperty("message", "User ID is required");
        }));
        test("should fail to delete car data - user not found", () => __awaiter(void 0, void 0, void 0, function* () {
            const nonExistentUserId = new mongoose_1.default.Types.ObjectId();
            const response = yield (0, supertest_1.default)(app)
                .delete("/carData/delete-car-data")
                .send({ userId: nonExistentUserId });
            expect(response.statusCode).toBe(404);
            expect(response.body).toHaveProperty("message", "User not found");
        }));
        test("should fail to delete car data - internal server error", () => __awaiter(void 0, void 0, void 0, function* () {
            const originalFindById = user_model_1.default.findById;
            user_model_1.default.findById = jest.fn().mockRejectedValue(new Error("Internal server error"));
            const response = yield (0, supertest_1.default)(app)
                .delete("/carData/delete-car-data")
                .send({ userId: testUser._id });
            expect(response.statusCode).toBe(500);
            expect(response.body).toHaveProperty("message", "Internal server error");
            user_model_1.default.findById = originalFindById;
        }));
    });
});
//# sourceMappingURL=car_data.test.js.map