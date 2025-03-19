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
const add_charging_model_1 = __importDefault(require("../models/add_charging_model"));
const add_charging_model_2 = __importDefault(require("../models/add_charging_model"));
const addComment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { chargerId, userId, text, likes = 0, rating = 0 } = req.body;
    if (!chargerId || !userId || !text) {
        return res.status(400).json({ message: "Missing required fields" });
    }
    try {
        const charger = yield add_charging_model_2.default.findById(chargerId);
        if (!charger) {
            return res.status(404).json({ message: "Charger not found" });
        }
        const newComment = {
            userId: userId,
            text,
            likes,
            Rating: rating,
            Date: new Date(),
        };
        charger.comments.push(newComment);
        yield charger.save();
        res.status(201).json(newComment);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
});
const getCommentById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { chargerId, commentId } = req.params;
        const chargingStation = yield add_charging_model_1.default.findById(chargerId);
        if (!chargingStation) {
            return res.status(404).json({ message: "Charging station not found" });
        }
        const comment = chargingStation.comments.id(commentId);
        if (!comment) {
            return res.status(404).json({ message: "Comment not found" });
        }
        res.status(200).json({ message: "Comment retrieved successfully", comment });
    }
    catch (error) {
        res.status(500).json({ message: "Failed to retrieve comment", error });
    }
});
const updateComment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { chargerId, commentId } = req.params;
        const { text } = req.body;
        const chargingStation = yield add_charging_model_1.default.findById(chargerId);
        if (!chargingStation) {
            return res.status(404).json({ message: "Charging station not found" });
        }
        const comment = chargingStation.comments.id(commentId);
        if (!comment) {
            return res.status(404).json({ message: "Comment not found" });
        }
        comment.text = text;
        yield chargingStation.save();
        res.status(200).json({ message: "Comment updated successfully", chargingStation });
    }
    catch (error) {
        res.status(500).json({ message: "Failed to update comment", error });
    }
});
const deleteCommentById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { chargerId, commentId } = req.params;
        const chargingStation = yield add_charging_model_1.default.findById(chargerId);
        if (!chargingStation) {
            return res.status(404).json({ message: "Charging station not found" });
        }
        const comment = chargingStation.comments.id(commentId);
        if (!comment) {
            return res.status(404).json({ message: "Comment not found" });
        }
        comment.deleteOne();
        yield chargingStation.save();
        res.status(200).json({ message: "Comment deleted successfully", chargingStation });
    }
    catch (error) {
        res.status(500).json({ message: "Failed to delete comment", error });
    }
});
const getCommentsByChargerId = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { chargerId } = req.params;
        const chargingStation = yield add_charging_model_1.default.findById(chargerId);
        if (!chargingStation) {
            return res.status(404).json({ message: "Charging station not found" });
        }
        res.status(200).json({ message: "Comments retrieved successfully", comments: chargingStation.comments });
    }
    catch (error) {
        res.status(500).json({ message: "Failed to retrieve comments", error });
    }
});
const toggleLikeDislikeComment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { like, dislike } = req.body;
    const userId = req.body.userId;
    try {
        const charger = yield add_charging_model_2.default.findById(req.body.chargerId);
        const comment = charger === null || charger === void 0 ? void 0 : charger.comments.find((comment) => comment._id.equals(req.body.commentId));
        if (!comment) {
            return res.status(404).json({ message: "Comment not found" });
        }
        comment.likes = (_a = comment.likes) !== null && _a !== void 0 ? _a : 0;
        comment.dislikes = (_b = comment.dislikes) !== null && _b !== void 0 ? _b : 0;
        if (like) {
            if (comment.likedUsers.includes(userId)) {
                comment.likes--;
                comment.likedUsers = comment.likedUsers.filter((id) => !id.equals(userId));
            }
            else {
                comment.likes++;
                comment.likedUsers.push(userId);
                if (comment.dislikedUsers.includes(userId)) {
                    comment.dislikes--;
                    comment.dislikedUsers = comment.dislikedUsers.filter((id) => !id.equals(userId));
                }
            }
        }
        if (dislike) {
            if (comment.dislikedUsers.includes(userId)) {
                comment.dislikes--;
                comment.dislikedUsers = comment.dislikedUsers.filter((id) => !id.equals(userId));
            }
            else {
                comment.dislikes++;
                comment.dislikedUsers.push(userId);
                if (comment.likedUsers.includes(userId)) {
                    comment.likes--;
                    comment.likedUsers = comment.likedUsers.filter((id) => !id.equals(userId));
                }
            }
        }
        if (charger) {
            yield charger.save();
            res.json(comment);
        }
    }
    catch (error) {
        console.error(error);
        res.status(500).send("Server error");
    }
});
exports.default = { addComment, updateComment, deleteCommentById,
    getCommentById, getCommentsByChargerId, toggleLikeDislikeComment };
//# sourceMappingURL=commentsOnCharger_controller.js.map