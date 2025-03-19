import { Request, Response } from "express";
import carDataModel from "../models/car_data_model";
import userModel from "../models/user_model";   

const getCarData = async (req: Request, res: Response) => {
    const { userId } = req.body;
  
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }
  
    try {
      const user = await userModel.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const carData = await carDataModel.find({ userId: user._id });

      if (!carData || carData.length === 0) {
        const defaultCarData = new carDataModel({
          userId: user._id,
          brandName: "Unknown",
          carModel: "Unknown",
          year: 0,
          range: 0,
          fastChargingSpeed: 0,
          homeChargingSpeed: 0,
          batteryCapacity: 0,
        });
        
        return res.status(200).json([defaultCarData]);
      }
  
      res.status(200).json(carData);
    } catch (error) {
      console.error("Error fetching car data:", error);
      res.status(500).json({ message: "Internal server error", error });
    }
};

const deleteCarData = async (req: Request, res: Response) => {
    const { userId } = req.body;
  
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }
  
    try {
      const user = await userModel.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      const carData = await carDataModel.deleteMany({ userId: user._id });
  
      res.status(200).json(carData);
    } catch (error) {
      console.error("Error deleting car data:", error);
      res.status(500).json({ message: "Internal server error", error });
    }
};

  

export default { getCarData, deleteCarData };