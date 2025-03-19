"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const charger_controller_1 = __importDefault(require("../controllers/charger_controller"));
const user_controller_auth_1 = __importDefault(require("../controllers/user_controller_auth"));
const user_controller_auth_2 = require("../controllers/user_controller_auth");
const router = (0, express_1.Router)();
router.get("/getAllUsers", user_controller_auth_2.authMiddleware, user_controller_auth_1.default.getAllUsers);
router.get("/getUserById/:id", user_controller_auth_2.authMiddleware, user_controller_auth_1.default.getUserById);
router.delete("/deleteUser:id", user_controller_auth_2.authMiddleware, user_controller_auth_1.default.deleteUser);
router.put("/updateUser/:id", user_controller_auth_2.authMiddleware, user_controller_auth_1.default.updateUser);
router.get("/getAllChargers", (req, res) => {
    charger_controller_1.default.getAllChargers(req, res);
});
router.get("/getChargersByUserId/chargers/:userId", user_controller_auth_2.authMiddleware, (req, res) => {
    charger_controller_1.default.getChargersByUserId(req, res);
});
router.delete("/deleteChargerById/:chargerId/", user_controller_auth_2.authMiddleware, (req, res) => {
    charger_controller_1.default.deleteChargerById(req, res);
});
exports.default = router;
//# sourceMappingURL=admin_route.js.map