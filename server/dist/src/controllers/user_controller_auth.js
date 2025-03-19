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
exports.authMiddleware = void 0;
const user_model_1 = __importDefault(require("../models/user_model"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const google_auth_library_1 = require("google-auth-library");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const signUp = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;
    const phoneNumber = req.body.phoneNumber;
    const email = req.body.email;
    const password = req.body.password;
    if (!email || !password) {
        res.status(400).send("missing email or password");
        return;
    }
    try {
        const existingUser = yield user_model_1.default.findOne({ email: email });
        if (existingUser) {
            res.status(400).send("User already exists");
            return;
        }
        const salt = yield bcrypt_1.default.genSalt(10);
        const hashedPassword = yield bcrypt_1.default.hash(password, salt);
        const user = yield user_model_1.default.create({
            firstName: firstName,
            lastName: lastName,
            email: email,
            password: hashedPassword,
            phoneNumber: phoneNumber,
        });
        res.status(200).send(user);
    }
    catch (err) {
        res.status(400).send(err);
    }
});
const generateTokens = (_id) => {
    const random = Math.floor(Math.random() * 1000000);
    if (!process.env.TOKEN_SECRET) {
        return null;
    }
    const accessToken = jsonwebtoken_1.default.sign({
        _id: _id,
        random: random,
    }, process.env.TOKEN_SECRET, { expiresIn: process.env.TOKEN_EXPIRATION });
    const refreshToken = jsonwebtoken_1.default.sign({
        _id: _id,
        random: random,
    }, process.env.TOKEN_SECRET, { expiresIn: process.env.REFRESH_TOKEN_EXPIRATION });
    return { accessToken, refreshToken };
};
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const email = req.body.email;
    const password = req.body.password;
    if (!email || !password) {
        res.status(400).send("wrong email or password");
        return;
    }
    try {
        const user = yield user_model_1.default.findOne({ email: email });
        if (!user) {
            res.status(400).send("wrong email or password");
            return;
        }
        const validPassword = yield bcrypt_1.default.compare(password, user.password);
        if (!validPassword) {
            res.status(400).send("wrong email or password");
            return;
        }
        const userId = user._id.toString();
        const tokens = generateTokens(userId);
        if (!tokens) {
            res.status(400).send("missing auth configuration");
            return;
        }
        if (user.refreshTokens == null) {
            user.refreshTokens = [];
        }
        user.refreshTokens.push(tokens.refreshToken);
        yield user.save();
        res.status(200).send({
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            _id: user._id,
            picture: user.picture,
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
        });
    }
    catch (err) {
        res.status(400).send(err);
    }
});
const logout = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const refreshToken = req.body.refreshToken;
    if (!refreshToken) {
        return res.status(400).send("missing refresh token");
    }
    if (!process.env.TOKEN_SECRET) {
        return res.status(400).send("missing auth configuration");
    }
    jsonwebtoken_1.default.verify(refreshToken, process.env.TOKEN_SECRET, (err, data) => __awaiter(void 0, void 0, void 0, function* () {
        if (err) {
            return res.status(403).send("invalid token");
        }
        const payload = data;
        try {
            const user = yield user_model_1.default.findOne({ _id: payload._id });
            if (!user) {
                return res.status(400).send("invalid token");
            }
            if (!user.refreshTokens || !user.refreshTokens.includes(refreshToken)) {
                user.refreshTokens = [];
                yield user.save();
                return res.status(400).send("invalid token");
            }
            user.refreshTokens = [];
            // user.refreshTokens = user.refreshTokens.filter((token) => token !== refreshToken);
            yield user.save();
            return res.status(200).send("logged out");
        }
        catch (err) {
            return res.status(400).send("invalid token");
        }
    }));
});
const refreshToken = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const refreshToken = req.body.refreshToken;
    if (!refreshToken) {
        res.status(400).send("Invalid token");
        return;
    }
    if (!process.env.TOKEN_SECRET) {
        res.status(400).send("Missing auth configuration");
        return;
    }
    jsonwebtoken_1.default.verify(refreshToken, process.env.TOKEN_SECRET, (err, data) => __awaiter(void 0, void 0, void 0, function* () {
        if (err) {
            res.status(403).send("Invalid token");
            return;
        }
        const payload = data;
        try {
            const user = yield user_model_1.default.findOne({ _id: payload._id }).exec();
            if (!user || !user.refreshTokens.includes(refreshToken)) {
                res.status(400).send("Invalid token access");
                return;
            }
            const newTokens = generateTokens(user._id.toString());
            if (!newTokens) {
                res.status(500).send("Problem with token generation");
                return;
            }
            yield user_model_1.default.updateOne({ _id: user._id }, { $pull: { refreshTokens: refreshToken } });
            yield user_model_1.default.updateOne({ _id: user._id }, { $push: { refreshTokens: newTokens.refreshToken } });
            console.log("Token refreshed successfully");
            res.status(200).send({
                accessToken: newTokens.accessToken,
                refreshToken: newTokens.refreshToken,
            });
        }
        catch (err) {
            res.status(500).send("Server error");
        }
    }));
});
const authMiddleware = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) {
        res.status(401).send("missing token");
        return;
    }
    if (!process.env.TOKEN_SECRET) {
        res.status(400).send("problem with configuration");
        return;
    }
    jsonwebtoken_1.default.verify(token, process.env.TOKEN_SECRET, (err, data) => {
        if (err) {
            res.status(403).send("invalid token access");
            return;
        }
        const payload = data;
        req.query.userId = payload._id;
        next();
    });
};
exports.authMiddleware = authMiddleware;
const client = new google_auth_library_1.OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const googleSignIn = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { idToken, password } = req.body;
        const ticket = yield client.verifyIdToken({
            idToken,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        if (!payload) {
            return res.status(400).json({ message: "Invalid token payload" });
        }
        const { sub: googleId, email, given_name: firstName, family_name: lastName, picture } = payload;
        if (!googleId || !email) {
            return res.status(400).json({ message: "Incomplete Google user data" });
        }
        let user = yield user_model_1.default.findOne({ email });
        if (!user) {
            const hashedPassword = yield bcrypt_1.default.hash(password, 10);
            user = new user_model_1.default({
                email,
                firstName,
                lastName,
                password: hashedPassword,
                picture,
                refreshTokens: [],
            });
            yield user.save();
        }
        else if (!googleId) {
            const isPasswordValid = yield bcrypt_1.default.compare(password, user.password);
            if (!isPasswordValid) {
                return res.status(401).json({ message: "Invalid password" });
            }
        }
        else if (googleId !== googleId) {
            return res.status(403).json({ message: "Account mismatch. Please use the correct Google account." });
        }
        const tokens = generateTokens(user._id.toString());
        if (!tokens) {
            return res.status(500).json({ message: "Failed to generate tokens" });
        }
        if (!user.refreshTokens) {
            user.refreshTokens = [];
        }
        if (!user.refreshTokens.includes(tokens.refreshToken)) {
            user.refreshTokens.push(tokens.refreshToken);
        }
        yield user.save();
        res.status(200).json({
            message: "User logged in successfully",
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                picture: user.picture,
            },
        });
    }
    catch (error) {
        console.error("Error in Google Sign-In:", error);
        res.status(400).json({ message: "Google Sign-In failed", error });
    }
});
const getAllUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield user_model_1.default.find({});
        res.status(200).json(users);
    }
    catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ message: "Internal server error", error });
    }
});
const getUserById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.params.id;
        const user = yield user_model_1.default.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json(user);
    }
    catch (error) {
        console.error("Error fetching user by ID:", error);
        res.status(500).json({ message: "Internal server error", error });
    }
});
const deleteUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.params.id;
        const user = yield user_model_1.default.findByIdAndDelete(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        if (user.picture) {
            const picturePath = path_1.default.resolve(__dirname, `../${user.picture}`);
            if (fs_1.default.existsSync(picturePath)) {
                fs_1.default.unlinkSync(picturePath);
            }
        }
        const userFolderPath = path_1.default.resolve(__dirname, `../uploads/${userId}`);
        if (fs_1.default.existsSync(userFolderPath)) {
            fs_1.default.rmdirSync(userFolderPath, { recursive: true });
        }
        res.status(200).json({ message: "User deleted successfully" });
    }
    catch (error) {
        console.error("Error deleting user:", error);
        res.status(500).json({ message: "Internal server error", error });
    }
});
const updateUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.params.id;
        const updateData = req.body;
        const imageFile = req.file;
        const user = yield user_model_1.default.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        if (imageFile) {
            const existingPicturePath = path_1.default.resolve(__dirname, `../${user.picture}`);
            if (fs_1.default.existsSync(existingPicturePath)) {
                fs_1.default.unlinkSync(existingPicturePath);
            }
            updateData.picture = `/uploads/${userId}/${imageFile.filename}`;
        }
        const updatedUser = yield user_model_1.default.findByIdAndUpdate(userId, updateData, { new: true });
        res.status(200).json({ message: "User updated successfully", user: updatedUser });
    }
    catch (error) {
        console.error("Error updating user:", error);
        res.status(500).json({ message: "Internal server error", error });
    }
});
const verifyAccessToken = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const token = (_a = req.headers['authorization']) === null || _a === void 0 ? void 0 : _a.split(' ')[1];
    if (!token) {
        return res.status(401).send({ message: 'Access token is missing' });
    }
    const SECRET = process.env.TOKEN_SECRET || '';
    try {
        const decoded = jsonwebtoken_1.default.verify(token, SECRET);
        res.status(200).send({ message: 'Token is valid', decodedToken: decoded });
    }
    catch (err) {
        console.error('Error verifying access token:', err);
        return res.status(401).send({ message: 'Invalid or expired access token' });
    }
});
exports.default = { signUp, login, logout, refreshToken, googleSignIn, getAllUsers,
    getUserById, deleteUser, updateUser, verifyAccessToken };
//# sourceMappingURL=user_controller_auth.js.map