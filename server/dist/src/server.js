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
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const mongoose_1 = __importDefault(require("mongoose"));
const body_parser_1 = __importDefault(require("body-parser"));
const charger_route_1 = __importDefault(require("./routes/charger_route"));
const cors_1 = __importDefault(require("cors"));
const commentsOnCharger_route_1 = __importDefault(require("./routes/commentsOnCharger_route"));
const user_route_1 = __importDefault(require("./routes/user_route"));
const car_data_route_1 = __importDefault(require("./routes/car_data_route"));
const admin_route_1 = __importDefault(require("./routes/admin_route"));
const book_a_charger_route_1 = __importDefault(require("./routes/book_a_charger_route"));
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const gemini_route_1 = __importDefault(require("./routes/gemini_route"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const app = (0, express_1.default)();
dotenv_1.default.config();
app.use((0, cors_1.default)({
    origin: 'https://node127.cs.colman.ac.il',
    credentials: true,
}));
const ensureUploadDirectories = () => {
    const directories = ["uploads"];
    directories.forEach((dir) => {
        const fullPath = path_1.default.resolve(__dirname, dir);
        if (!fs_1.default.existsSync(fullPath)) {
            fs_1.default.mkdirSync(fullPath, { recursive: true });
        }
    });
};
ensureUploadDirectories();
app.use("/uploads", express_1.default.static(path_1.default.resolve(__dirname, "uploads")));
const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Assignment 2 2025 REST API",
            version: "1.0.0",
            description: "REST server including authentication using JWT, CRUD operations on charging stations, comments, and a user registration system.",
        },
        servers: [{ url: "http://localhost:3000" }, { url: "http://10.10.246.127", }, { url: "https://10.10.246.127", }],
    },
    apis: ["./src/routes/*.ts"],
};
const specs = (0, swagger_jsdoc_1.default)(options);
app.use("/api-docs", swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(specs));
const moduleApp = () => __awaiter(void 0, void 0, void 0, function* () {
    if (!process.env.DB_CONNECT) {
        throw new Error("MONGO_URI is not set");
    }
    try {
        yield mongoose_1.default.connect(process.env.DB_CONNECT);
        console.log("Connected to MongoDB");
    }
    catch (error) {
        console.error("Failed to connect to MongoDB", error);
        throw error;
    }
    app.use(body_parser_1.default.json());
    app.use(body_parser_1.default.urlencoded({ extended: true }));
    app.use("/auth", user_route_1.default);
    app.use("/addChargingStation", charger_route_1.default);
    app.use("/addComments", commentsOnCharger_route_1.default);
    app.use("/gemini", gemini_route_1.default);
    app.use("/bookings", book_a_charger_route_1.default);
    app.use("/carData", car_data_route_1.default);
    app.use("/admin", admin_route_1.default);
    app.use(express_1.default.static(path_1.default.resolve(__dirname, '..', '..', 'front')));
    console.log("dearname", __dirname);
    app.get('*', (req, res) => {
        res.sendFile(path_1.default.resolve(__dirname, '..', '..', 'front', 'index.html'));
    });
    return app;
});
exports.default = moduleApp;
//# sourceMappingURL=server.js.map