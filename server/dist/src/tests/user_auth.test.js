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
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
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
const testUserError = {
    firstName: "Tom2",
    lastName: "Guter",
    email: "tom@user.com",
    password: "",
    phoneNumber: "0541234567",
    picture: null,
    selectedChargingStations: [],
    carDetails: null,
    refreshTokens: [],
    _id: new mongoose_1.default.Types.ObjectId(),
};
let app;
beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
    app = yield (0, server_1.default)();
    yield user_model_1.default.findOneAndDelete({ email: testUser.email });
}));
afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
    yield mongoose_1.default.connection.close();
}));
describe("Auth Tests", () => {
    test("Auth Registration", () => __awaiter(void 0, void 0, void 0, function* () {
        const registerResponse = yield (0, supertest_1.default)(app)
            .post("/auth/signUp")
            .send(testUser);
        expect(registerResponse.statusCode).toBe(200);
    }));
    test("Auth Registration fail", () => __awaiter(void 0, void 0, void 0, function* () {
        const registerResponse = yield (0, supertest_1.default)(app)
            .post("/auth/signUp")
            .send(testUserError);
        expect(registerResponse.statusCode).not.toBe(200);
    }));
    test("Auth Registration fail - register the same user", () => __awaiter(void 0, void 0, void 0, function* () {
        const registerResponse = yield (0, supertest_1.default)(app)
            .post("/auth/signUp")
            .send(testUser);
        expect(registerResponse.statusCode).not.toBe(200);
        expect(registerResponse.text).toBe("User already exists");
    }));
    test("should fail to sign up - internal server error", () => __awaiter(void 0, void 0, void 0, function* () {
        const originalCreate = user_model_1.default.create;
        user_model_1.default.create = jest.fn().mockRejectedValue(new Error("Internal server error"));
        const response = yield (0, supertest_1.default)(app)
            .post("/auth/signUp")
            .send({
            firstName: "Tom",
            lastName: "Guter",
            email: "tom@user2.com",
            password: "123456",
            phoneNumber: "0541234567"
        });
        expect(response.status).toBe(400);
        user_model_1.default.create = originalCreate;
    }));
    test("Auth Login", () => __awaiter(void 0, void 0, void 0, function* () {
        const loginResponse = yield (0, supertest_1.default)(app)
            .post("/auth/login")
            .send({ email: testUser.email, password: testUser.password });
        expect(loginResponse.statusCode).toBe(200);
        testUser.refreshTokens.push(loginResponse.body.accessToken);
        testUser.refreshTokens.push(loginResponse.body.refreshToken);
        ;
        testUser._id = loginResponse.body._id;
    }));
    test("Make sure two access tokens are not the same", () => __awaiter(void 0, void 0, void 0, function* () {
        expect(testUser.refreshTokens[0]).not.toBe(testUser.refreshTokens[1]);
    }));
    test("Auth Login fail - missing email", () => __awaiter(void 0, void 0, void 0, function* () {
        const loginResponse = yield (0, supertest_1.default)(app)
            .post("/auth/login")
            .send({ email: "", password: "wrongPassword" });
        expect(loginResponse.statusCode).toBe(400);
        expect(loginResponse.text).toBe("wrong email or password");
    }));
    test("Auth Login fail - wrong password", () => __awaiter(void 0, void 0, void 0, function* () {
        const loginResponse = yield (0, supertest_1.default)(app)
            .post("/auth/login")
            .send({ email: testUser.email, password: "wrongPassword" });
        expect(loginResponse.statusCode).toBe(400);
        expect(loginResponse.text).toBe("wrong email or password");
    }));
    test("Auth Login fail - wrong email", () => __awaiter(void 0, void 0, void 0, function* () {
        const loginResponse = yield (0, supertest_1.default)(app)
            .post("/auth/login")
            .send({ email: "wrong@gmail.com", password: "wrongPassword" });
        expect(loginResponse.statusCode).toBe(400);
        expect(loginResponse.text).toBe("wrong email or password");
    }));
    test("should fail to login - missing auth configuration", () => __awaiter(void 0, void 0, void 0, function* () {
        const originalTokenSecret = process.env.TOKEN_SECRET;
        delete process.env.TOKEN_SECRET;
        const response = yield (0, supertest_1.default)(app)
            .post("/auth/login")
            .send({ email: testUser.email, password: testUser.password });
        expect(response.statusCode).toBe(400);
        expect(response.text).toBe("missing auth configuration");
        process.env.TOKEN_SECRET = originalTokenSecret;
    }));
    test("should fail to login - internal server error", () => __awaiter(void 0, void 0, void 0, function* () {
        const originalFindOne = user_model_1.default.findOne;
        user_model_1.default.findOne = jest.fn().mockRejectedValue(new Error("Internal server error"));
        const response = yield (0, supertest_1.default)(app)
            .post("/auth/login")
            .send({ email: testUser.email, password: testUser.password });
        expect(response.statusCode).toBe(400);
        user_model_1.default.findOne = originalFindOne;
    }));
    test("should get all users successfully", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app)
            .get("/auth/getAllUsers")
            .set("authorization", `Bearer ${testUser.refreshTokens[0]}`)
            .send();
        expect(response.statusCode).toBe(200);
        expect(response.body).toBeInstanceOf(Array);
    }));
    test("should fail to get all users - internal server error", () => __awaiter(void 0, void 0, void 0, function* () {
        const originalFind = user_model_1.default.find;
        user_model_1.default.find = jest.fn().mockRejectedValue(new Error("Internal server error"));
        const response = yield (0, supertest_1.default)(app)
            .get("/auth/getAllUsers")
            .set("authorization", `Bearer ${testUser.refreshTokens[0]}`)
            .send();
        expect(response.statusCode).toBe(500);
        expect(response.body).toHaveProperty("message", "Internal server error");
        user_model_1.default.find = originalFind;
    }));
    test("should get user by id successfully", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app)
            .get(`/auth/getUserById/${testUser._id}`)
            .set("authorization", `Bearer ${testUser.refreshTokens[0]}`)
            .send();
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty("_id", testUser._id.toString());
    }));
    test("should fail to get user by id - user not found", () => __awaiter(void 0, void 0, void 0, function* () {
        const nonExistentUserId = new mongoose_1.default.Types.ObjectId();
        const response = yield (0, supertest_1.default)(app)
            .get(`/auth/getUserById/${nonExistentUserId}`)
            .set("authorization", `Bearer ${testUser.refreshTokens[0]}`)
            .send();
        expect(response.statusCode).toBe(404);
        expect(response.body).toHaveProperty("message", "User not found");
    }));
    test("should fail to get user by id - internal server error", () => __awaiter(void 0, void 0, void 0, function* () {
        const originalFindById = user_model_1.default.findById;
        user_model_1.default.findById = jest.fn().mockRejectedValue(new Error("Internal server error"));
        const response = yield (0, supertest_1.default)(app)
            .get(`/auth/getUserById/${testUser._id}`)
            .set("authorization", `Bearer ${testUser.refreshTokens[0]}`)
            .send();
        expect(response.statusCode).toBe(500);
        expect(response.body).toHaveProperty("message", "Internal server error");
        user_model_1.default.findById = originalFindById;
    }));
    test("should verify access token successfully", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app)
            .get("/auth/verifyAccessToken")
            .set("authorization", `Bearer ${testUser.refreshTokens[0]}`)
            .send();
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty("message", "Token is valid");
        expect(response.body).toHaveProperty("decodedToken");
    }));
    test("should fail to verify access token - missing token", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app)
            .get("/auth/verifyAccessToken")
            .set("authorization", `Bearer `)
            .send();
        expect(response.statusCode).toBe(401);
        expect(response.text).toBe("missing token");
    }));
    test("should fail to verify access token - invalid token", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app)
            .get("/auth/verifyAccessToken")
            .set("authorization", `Bearer invalidToken`)
            .send();
        expect(response.statusCode).toBe(403);
        expect(response.text).toBe("invalid token access");
    }));
    test("should refresh token successfully", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app)
            .post("/auth/refresh")
            .send({ refreshToken: testUser.refreshTokens[1] });
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty("accessToken");
        expect(response.body).toHaveProperty("refreshToken");
        testUser.refreshTokens[0] = response.body.accessToken;
        testUser.refreshTokens[1] = response.body.refreshToken;
    }));
    test("should fail to refresh token - missing refresh token", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app)
            .post("/auth/refresh")
            .send({ refreshToken: "" });
        expect(response.statusCode).toBe(400);
        expect(response.text).toBe("Invalid token");
    }));
    test("Invalid refresh token", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app)
            .post("/auth/refresh")
            .send({ refreshToken: "invalidToken" });
        expect(response.statusCode).not.toBe(200);
    }));
    test("Refresh: Missing refresh token", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app).post("/auth/refresh");
        expect(response.statusCode).not.toBe(200);
    }));
    test("Missing TOKEN_SECRET in refresh", () => __awaiter(void 0, void 0, void 0, function* () {
        const originalSecret = process.env.TOKEN_SECRET;
        delete process.env.TOKEN_SECRET;
        const response = yield (0, supertest_1.default)(app)
            .post("/auth/refresh")
            .send({ refreshToken: testUser.refreshTokens[1] });
        expect(response.statusCode).not.toBe(200);
        process.env.TOKEN_SECRET = originalSecret;
    }));
    test("should update user by id", () => __awaiter(void 0, void 0, void 0, function* () {
        const imagePath = path_1.default.resolve(__dirname, "sedan_test.png");
        if (!fs_1.default.existsSync(imagePath)) {
            throw new Error(`File not found: ${imagePath}`);
        }
        const updatedUserData = {
            firstName: "UpdatedFirstName",
            lastName: "UpdatedLastName",
            phoneNumber: "0547654321"
        };
        const response = yield (0, supertest_1.default)(app)
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
    }));
    test("should fail to update user - user not found", () => __awaiter(void 0, void 0, void 0, function* () {
        const nonExistentUserId = new mongoose_1.default.Types.ObjectId();
        const response = yield (0, supertest_1.default)(app)
            .put(`/auth/updateUser/${nonExistentUserId}`)
            .set("authorization", `Bearer ${testUser.refreshTokens[0]}`)
            .send({
            firstName: "UpdatedFirstName",
            lastName: "UpdatedLastName",
            phoneNumber: "0547654321"
        });
        expect(response.statusCode).toBe(404);
        expect(response.body).toHaveProperty("message", "User not found");
    }));
    test("should fail to update user - internal server error", () => __awaiter(void 0, void 0, void 0, function* () {
        const originalFindById = user_model_1.default.findById;
        user_model_1.default.findById = jest.fn().mockRejectedValue(new Error("Internal server error"));
        const response = yield (0, supertest_1.default)(app)
            .put(`/auth/updateUser/${testUser._id}`)
            .set("authorization", `Bearer ${testUser.refreshTokens[0]}`)
            .send({
            firstName: "UpdatedFirstName",
            lastName: "UpdatedLastName",
            phoneNumber: "0547654321"
        });
        expect(response.statusCode).toBe(500);
        expect(response.body).toHaveProperty("message", "Internal server error");
        user_model_1.default.findById = originalFindById;
    }));
    test("should fail to logout user - missing refresh token", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app)
            .post("/auth/logout")
            .set("authorization", `Bearer ${testUser.refreshTokens[0]}`)
            .send({ refreshToken: "" });
        expect(response.statusCode).toBe(400);
        expect(response.text).toBe("missing refresh token");
    }));
    test("should fail to logout user - missing auth configuration", () => __awaiter(void 0, void 0, void 0, function* () {
        const originalTokenSecret = process.env.TOKEN_SECRET;
        delete process.env.TOKEN_SECRET;
        const response = yield (0, supertest_1.default)(app)
            .post("/auth/logout")
            .set("authorization", `Bearer ${testUser.refreshTokens[0]}`)
            .send({ refreshToken: testUser.refreshTokens[1] });
        expect(response.statusCode).toBe(400);
        expect(response.text).toBe("missing auth configuration");
        process.env.TOKEN_SECRET = originalTokenSecret;
    }));
    test("should fail to logout user - invalid token", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app)
            .post("/auth/logout")
            .set("authorization", `Bearer ${testUser.refreshTokens[0]}`)
            .send({ refreshToken: "invalidToken" });
        expect(response.statusCode).toBe(403);
        expect(response.text).toBe("invalid token");
    }));
    test("should fail to logout - user not found", () => __awaiter(void 0, void 0, void 0, function* () {
        if (!process.env.TOKEN_SECRET) {
            throw new Error("TOKEN_SECRET is not defined");
        }
        const refreshToken = jsonwebtoken_1.default.sign({ _id: new mongoose_1.default.Types.ObjectId() }, process.env.TOKEN_SECRET, { expiresIn: '1h' });
        const response = yield (0, supertest_1.default)(app)
            .post("/auth/logout")
            .set("authorization", `Bearer ${testUser.refreshTokens[0]}`)
            .send({ refreshToken });
        expect(response.statusCode).toBe(400);
        expect(response.text).toBe("invalid token");
    }));
    test("should fail to logout - refresh token not in user's tokens", () => __awaiter(void 0, void 0, void 0, function* () {
        const userWithNullRefreshTokens = new user_model_1.default({
            firstName: "Tom",
            lastName: "Guter",
            email: "tom@user4.com",
            password: yield bcrypt_1.default.hash("123456", 10),
            phoneNumber: "0541234567",
            refreshTokens: null,
        });
        yield userWithNullRefreshTokens.save();
        if (!process.env.TOKEN_SECRET) {
            throw new Error("TOKEN_SECRET is not defined");
        }
        const refreshToken = jsonwebtoken_1.default.sign({ _id: userWithNullRefreshTokens._id }, process.env.TOKEN_SECRET, { expiresIn: '1h' });
        const response = yield (0, supertest_1.default)(app)
            .post("/auth/logout")
            .set("authorization", `Bearer ${testUser.refreshTokens[0]}`)
            .send({ refreshToken });
        expect(response.statusCode).toBe(400);
        expect(response.text).toBe("invalid token");
        yield user_model_1.default.findOneAndDelete({ email: userWithNullRefreshTokens.email });
    }), 5000);
    test("should fail to logout - internal server error", () => __awaiter(void 0, void 0, void 0, function* () {
        const originalFindOne = user_model_1.default.findOne;
        user_model_1.default.findOne = jest.fn().mockRejectedValue(new Error("Internal server error"));
        const response = yield (0, supertest_1.default)(app)
            .post("/auth/logout")
            .set("authorization", `Bearer ${testUser.refreshTokens[0]}`)
            .send({ refreshToken: testUser.refreshTokens[1] });
        expect(response.statusCode).toBe(400);
        expect(response.text).toBe("invalid token");
        user_model_1.default.findOne = originalFindOne;
    }));
    test("should logout user", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app)
            .post("/auth/logout")
            .set("authorization", `Bearer ${testUser.refreshTokens[0]}`)
            .send({ refreshToken: testUser.refreshTokens[1] });
        expect(response.statusCode).toBe(200);
    }));
    test("Auth Login", () => __awaiter(void 0, void 0, void 0, function* () {
        const loginResponse = yield (0, supertest_1.default)(app)
            .post("/auth/login")
            .send({ email: testUser.email, password: testUser.password });
        expect(loginResponse.statusCode).toBe(200);
        testUser.refreshTokens.push(loginResponse.body.accessToken);
        testUser.refreshTokens.push(loginResponse.body.refreshToken);
        ;
        testUser._id = loginResponse.body._id;
    }));
    test("should delete user by id successfully", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app)
            .delete(`/auth/deleteUser/${testUser._id}`)
            .set("authorization", `Bearer ${testUser.refreshTokens[0]}`)
            .send();
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty("message", "User deleted successfully");
    }));
    test("should fail to delete user by id - user not found", () => __awaiter(void 0, void 0, void 0, function* () {
        const nonExistentUserId = new mongoose_1.default.Types.ObjectId();
        const response = yield (0, supertest_1.default)(app)
            .delete(`/auth/deleteUser/${nonExistentUserId}`)
            .set("authorization", `Bearer ${testUser.refreshTokens[0]}`)
            .send();
        expect(response.statusCode).toBe(404);
        expect(response.body).toHaveProperty("message", "User not found");
    }));
    test("should fail to delete user by id - internal server error", () => __awaiter(void 0, void 0, void 0, function* () {
        const originalFindByIdAndDelete = user_model_1.default.findByIdAndDelete;
        user_model_1.default.findByIdAndDelete = jest.fn().mockRejectedValue(new Error("Internal server error"));
        const response = yield (0, supertest_1.default)(app)
            .delete(`/auth/deleteUser/${testUser._id}`)
            .set("authorization", `Bearer ${testUser.refreshTokens[0]}`)
            .send();
        expect(response.statusCode).toBe(500);
        expect(response.body).toHaveProperty("message", "Internal server error");
        user_model_1.default.findByIdAndDelete = originalFindByIdAndDelete;
    }));
    test("should fail to refresh token - token timeout", () => __awaiter(void 0, void 0, void 0, function* () {
        if (!process.env.TOKEN_SECRET) {
            throw new Error("TOKEN_SECRET is not defined");
        }
        const shortLivedToken = jsonwebtoken_1.default.sign({ _id: testUser._id }, process.env.TOKEN_SECRET, { expiresIn: '1s' });
        yield new Promise(resolve => setTimeout(resolve, 2000));
        const response = yield (0, supertest_1.default)(app)
            .post("/auth/refresh")
            .send({ refreshToken: shortLivedToken });
        expect(response.statusCode).toBe(403);
        expect(response.text).toBe("Invalid token");
    }));
    test("should fail to refresh token - user not found", () => __awaiter(void 0, void 0, void 0, function* () {
        if (!process.env.TOKEN_SECRET) {
            throw new Error("TOKEN_SECRET is not defined");
        }
        const refreshToken = jsonwebtoken_1.default.sign({ _id: new mongoose_1.default.Types.ObjectId() }, process.env.TOKEN_SECRET, { expiresIn: '1h' });
        const response = yield (0, supertest_1.default)(app)
            .post("/auth/refresh")
            .send({ refreshToken });
        expect(response.statusCode).toBe(400);
        expect(response.text).toBe("Invalid token access");
    }));
    test("should fail to refresh token - refresh token not in user's tokens", () => __awaiter(void 0, void 0, void 0, function* () {
        const userWithNullRefreshTokens = new user_model_1.default({
            firstName: "Tom",
            lastName: "Guter",
            email: "tom@user4.com",
            password: yield bcrypt_1.default.hash("123456", 10),
            phoneNumber: "0541234567",
            refreshTokens: null,
        });
        yield userWithNullRefreshTokens.save();
        if (!process.env.TOKEN_SECRET) {
            throw new Error("TOKEN_SECRET is not defined");
        }
        const refreshToken = jsonwebtoken_1.default.sign({ _id: userWithNullRefreshTokens._id }, process.env.TOKEN_SECRET, { expiresIn: '1h' });
        const response = yield (0, supertest_1.default)(app)
            .post("/auth/refresh")
            .send({ refreshToken });
        expect(response.statusCode).toBe(500);
        expect(response.text).toBe("Server error");
        yield user_model_1.default.findByIdAndDelete(userWithNullRefreshTokens._id);
    }), 5000);
    test("should fail auth middleware - problem with configuration", () => __awaiter(void 0, void 0, void 0, function* () {
        const originalTokenSecret = process.env.TOKEN_SECRET;
        delete process.env.TOKEN_SECRET;
        const response = yield (0, supertest_1.default)(app)
            .get("/auth/getAllUsers")
            .set("authorization", `Bearer ${testUser.refreshTokens[0]}`)
            .send();
        expect(response.statusCode).toBe(400);
        expect(response.text).toBe("problem with configuration");
        process.env.TOKEN_SECRET = originalTokenSecret;
    }));
});
//# sourceMappingURL=user_auth.test.js.map