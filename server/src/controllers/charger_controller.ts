import { Request, Response } from "express";
import ChargingModel from "../models/add_charging_model";
import BookCharger from "../models/book_a_chrager.model";
import userModel from "../models/user_model";
import axios from "axios";
import fs from "fs";
import path from "path";

const getCoordinates = async (address: string) => {
  const apiKey = process.env.OPENCAGE_API_KEY;
  const url = `${process.env.OPENCAGE_API_URL}=${encodeURIComponent(
    address
  )}&key=${apiKey}`;
  try {
    const response = await axios.get(url);
    const data = response.data as {
      results: { geometry: { lat: number; lng: number } }[];
    };

    if (data.results.length > 0) {
      const latitude = data.results[0].geometry.lat;
      const longitude = data.results[0].geometry.lng;

      console.log("Coordinates:", latitude, longitude);
      return { latitude, longitude };
    } else {
      console.error("No results found for the given address.");
      return null;
    }
  } catch (error) {
    console.error("Error fetching coordinates:", error);
    return null;
  }
};

const addChargingStation = async (req: Request, res: Response) => {
  try {
    const { userId, location, chargingRate, price, description, chargerType } =
      req.body;
    console.log("Received data:", {
      userId,
      location,
      chargingRate,
      price,
      description,
      chargerType,
    });
    const imageFile = req.file;
    if (
      !userId ||
      !location ||
      !chargingRate ||
      !price ||
      !description ||
      !imageFile
    ) {
      return res.status(400).json({
        error: "All fields, including userId and an image, are required.",
      });
    }

    let coordinates;
    if (req.body.test) {
      coordinates = {
        latitude: req.body.latitude,
        longitude: req.body.longitude,
      };
    } else {
      coordinates = await getCoordinates(location);
    }

    if (!coordinates) {
      return res.status(400).json({ error: "Invalid location" });
    }

    const { latitude, longitude } = coordinates;

    const newChargingStation = new ChargingModel({
      userId,
      location,
      latitude,
      longitude,
      price: parseFloat(price),
      chargingRate: parseFloat(chargingRate),
      description,
      picture: `/uploads/${userId}/${imageFile.filename}`,
      chargerType,
    });

    await newChargingStation.save();

    res.status(201).json({
      message: "Charging station added successfully",
      chargingStation: newChargingStation,
    });
  } catch (error) {
    console.error("Error in addChargingStation:", error);
    res.status(500).json({ message: "Failed to add charging station", error });
  }
};

const getChargerById = async (req: Request, res: Response) => {
  try {
    const { chargerId } = req.params;

    const chargingStation = await ChargingModel.findById(chargerId);
    if (!chargingStation) {
      return res.status(404).json({ message: "Charging station not found" });
    }

    res
      .status(200)
      .json({ message: "Charger retrieved successfully", chargingStation });
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve charger", error });
  }
};

const getChargersByUserId = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const chargers = await ChargingModel.find({ userId });
    if (!chargers || chargers.length == 0) {
      return res
        .status(404)
        .json({ message: "No charging stations found for this user" });
    }

    res.status(200).json({ chargers });
  } catch (error) {
    res.status(500).json({ message: "Failed to get charging stations", error });
  }
};

const getAllChargers = async (req: Request, res: Response) => {
  try {
    const chargers = await ChargingModel.find();
    if (!chargers || chargers.length == 0) {
      return res.status(404).json({ message: "No charging stations found" });
    }

    res.status(200).json({ chargers });
  } catch (error) {
    res.status(500).json({ message: "Failed to get charging stations", error });
  }
};

const updateCharger = async (req: Request, res: Response) => {
  try {
    const { chargerId } = req.params;

    const chargingStation = await ChargingModel.findById(chargerId);
    if (!chargingStation) {
      return res.status(404).json({ message: "Charging station not found" });
    }

    if (req.body.Location && chargingStation.location !== req.body.Location) {
      const coordinates = await getCoordinates(req.body.Location);
      if (coordinates) {
        chargingStation.latitude = coordinates.latitude;
        chargingStation.longitude = coordinates.longitude;
        chargingStation.location = req.body.Location;
      } else {
        return res.status(400).json({ message: "Invalid location" });
      }
    }

    if (req.body.ChargingRate)
      chargingStation.chargingRate = req.body.ChargingRate;
    if (req.body.Price) chargingStation.price = req.body.Price;

    if (req.body.Description)
      chargingStation.description = req.body.Description;

    if (req.file) {
      if (chargingStation.picture) {
        const existingPicturePath = path.resolve(
          __dirname,
          `../${chargingStation.picture}`
        );
        if (fs.existsSync(existingPicturePath)) {
          fs.unlinkSync(existingPicturePath);
        }
      }

      chargingStation.picture = `/uploads/${req.body.userId}/${req.file.filename}`;
    }

    await chargingStation.save();

    res.status(200).json({
      message: "Charging station updated successfully",
      chargingStation,
    });
  } catch (error) {
    console.error("Error updating charging station:", error);
    res
      .status(500)
      .json({ message: "Failed to update charging station", error });
  }
};

const deleteChargerById = async (req: Request, res: Response) => {
  try {
    const { chargerId } = req.params;

    const charger = await ChargingModel.findById(chargerId);
    if (!charger) {
      return res.status(404).json({ message: "Charging station not found" });
    }

    if (charger.picture) {
      const existingPicturePath = path.resolve(
        __dirname,
        `../${charger.picture}`
      );
      if (fs.existsSync(existingPicturePath)) {
        fs.unlinkSync(existingPicturePath);
      }
    }
    await ChargingModel.findByIdAndDelete(chargerId);

    await BookCharger.deleteMany({ chargerId });

    res.status(200).json({ message: "Comment deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete comment", error });
  }
};

const getUserByChargerId = async (req: Request, res: Response) => {
  try {
    const { chargerId } = req.params;

    const chargingStation = await ChargingModel.findById(chargerId);
    if (!chargingStation) {
      return res.status(404).json({ message: "Charging station not found" });
    }

    const userId = chargingStation.userId;
    if (!userId) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = await userModel
      .findById(userId)
      .lean();

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ message: "Failed to get user", error });
  }
};

const toggleLikeDislikeCharger = async (req: Request, res: Response) => {
  const { like, dislike } = req.body;
  const userId = req.body.userId;
  const chargerId = req.body.chargerId;

  try {
    const charger = await ChargingModel.findById(chargerId);
    if (!charger) {
      return res.status(404).json({ message: "Charger not found" });
    }

    charger.likes = charger.likes ?? 0;
    charger.dislikes = charger.dislikes ?? 0;

    if (like) {
      if (charger.likedUsers.includes(userId)) {
        charger.likes--;
        charger.likedUsers = charger.likedUsers.filter(
          (id) => !id.equals(userId)
        );
      } else {
        charger.likes++;
        charger.likedUsers.push(userId);

        if (charger.dislikedUsers.includes(userId)) {
          charger.dislikes--;
          charger.dislikedUsers = charger.dislikedUsers.filter(
            (id) => !id.equals(userId)
          );
        }
      }
    }

    if (dislike) {
      if (charger.dislikedUsers.includes(userId)) {
        charger.dislikes--;
        charger.dislikedUsers = charger.dislikedUsers.filter(
          (id) => !id.equals(userId)
        );
      } else {
        charger.dislikes++;
        charger.dislikedUsers.push(userId);

        if (charger.likedUsers.includes(userId)) {
          charger.likes--;
          charger.likedUsers = charger.likedUsers.filter(
            (id) => !id.equals(userId)
          );
        }
      }
    }

    await charger.save();

    res.json(charger);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export default {
  addChargingStation,
  getChargerById,
  getAllChargers,
  updateCharger,
  deleteChargerById,
  getChargersByUserId,
  getUserByChargerId,
  toggleLikeDislikeCharger,
};
