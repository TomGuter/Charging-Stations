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
let app;
const testUser = {
    firstName: "Tom2",
    lastName: "Guter",
    email: "tom@user.com",
    password: "123456",
    phoneNumber: "0541234567",
    token: "",
    _id: "",
};
const newChargingStation = {
    latitude: 40.7128,
    longitude: -74.0060,
    price: 10,
    rating: 4.5,
    picture: "http://example.com/picture.jpg",
    description: "A new charging station",
    userId: "",
    comments: [
        {
            text: "Great station!!!!",
        },
    ],
};
const comment1 = {
    text: "Bad station!!!!",
};
newChargingStation.comments.push(comment1);
beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
    app = yield (0, server_1.default)();
    yield user_model_1.default.deleteMany();
    yield add_charging_model_1.default.deleteMany();
    const registerResponse = yield (0, supertest_1.default)(app)
        .post("/auth/signUp")
        .send(testUser);
    expect(registerResponse.statusCode).toBe(200);
    const loginResponse = yield (0, supertest_1.default)(app)
        .post("/auth/login")
        .send({ email: testUser.email, password: testUser.password });
    expect(loginResponse.statusCode).toBe(200);
    testUser.token = loginResponse.body.accessToken;
    testUser._id = loginResponse.body._id;
    newChargingStation.userId = testUser._id;
}));
afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
    yield mongoose_1.default.connection.close();
}));
describe("add charging station Test Suite", () => {
    let chargingStationId;
    test("should add a new charging station", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app)
            .post("/addChargingStation/addCharger")
            .set("authorization", `JWT ${testUser.token}`)
            .send(newChargingStation);
        expect(response.status).toBe(201);
        chargingStationId = response.body.chargingStation._id;
    }));
    test("should add a comment to the charging station", () => __awaiter(void 0, void 0, void 0, function* () {
        const newComment = {
            text: "Could be a better station!!!!",
        };
        const commentResponse = yield (0, supertest_1.default)(app)
            .post(`/addChargingStation/addComment/${chargingStationId}`)
            .set("authorization", `JWT ${testUser.token}`)
            .send(newComment);
        expect(commentResponse.status).toBe(201);
        expect(commentResponse.body.message).toBe("Comment added successfully");
        expect(commentResponse.body.chargingStation.comments).toContainEqual(expect.objectContaining(newComment));
    }));
});
//# sourceMappingURL=add_chargnig.test.js.map