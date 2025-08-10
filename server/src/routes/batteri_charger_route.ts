import { Router } from "express";
import add_charging_controller from "../controllers/batteri_charger_controller";
import { authMiddleware } from "../controllers/user_controller_auth";
import upload from "../uploads";

const router = Router();


router.post(
  "/addCharger",
  authMiddleware,
  upload.single("image"),
  (req, res) => {
    add_charging_controller.addChargingStation(req, res);
  }
);


router.get("/getChargerById/:chargerId", (req, res) => {
  add_charging_controller.getChargerById(req, res);
});

router.get(
  "/getChargersByUserId/chargers/:userId",
  authMiddleware,
  (req, res) => {
    add_charging_controller.getChargersByUserId(req, res);
  }
);

router.put(
  "/updateCharger/:chargerId",
  upload.single("image"),
  authMiddleware,
  (req, res) => {
    add_charging_controller.updateCharger(req, res);
  }
);

router.put("/toggleLikeDislikeCharger/", authMiddleware, (req, res) => {
  add_charging_controller.toggleLikeDislikeCharger(req, res);
});


router.delete("/deleteChargerById/:chargerId/", authMiddleware, (req, res) => {
  add_charging_controller.deleteChargerById(req, res);
});

router.get("/getAllChargers", (req, res) => {
  add_charging_controller.getAllChargers(req, res);
});


router.get("/getUserByChargerId/:chargerId", authMiddleware, (req, res) => {
  add_charging_controller.getUserByChargerId(req, res);
});

export default router;
