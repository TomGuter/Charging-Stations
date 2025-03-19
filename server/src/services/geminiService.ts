import dotenv from "dotenv";
import axios from "axios";
import https from "https";
import carDataModel from '../models/car_data_model';
import userModel from '../models/user_model';

dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = process.env.GEMINI_API_URL;

interface GeminiResponse {
  candidates: {
    avgLogprobs: number;
    content: {
      parts: {
        text: string;
      }[];
      role: string;
    };
    finishReason: string;
  }[];
  modelVersion: string;
  usageMetadata: {
    candidatesTokenCount: number;
    promptTokenCount: number;
    totalTokenCount: number;
  };
}

if (!GEMINI_API_KEY) {
  throw new Error("Gemini API key is not set in the .env file");
}

const agent = new https.Agent({
  keepAlive: false, // Disable keep-alive
  maxSockets: 1, // Limit concurrent connections
});

const saveCarData = async (userId: string, brandName: string, carModel: string, year: number, range: number, fastChargingSpeed: number, homeChargingSpeed: number, batteryCapacity: number) => {
  try {
    const user = await userModel.findById(userId);

    if (!user) {
      console.error("User not found");
      return;
    }

    const existingCar = await carDataModel.findOne({ userId });

    if (existingCar && existingCar._id.toString() === user.carDetails?.toString()) {
      existingCar.brandName = brandName;
      existingCar.carModel = carModel;
      existingCar.year = year;
      existingCar.range = range;
      existingCar.fastChargingSpeed = fastChargingSpeed;
      existingCar.homeChargingSpeed = homeChargingSpeed;
      existingCar.batteryCapacity = batteryCapacity;

      await existingCar.save();
      console.log("Car information updated successfully!");
    } else {
      const newCarData = new carDataModel({
        userId,
        brandName,
        carModel,
        year,
        range,
        fastChargingSpeed,
        homeChargingSpeed,
        batteryCapacity,
      });

      await newCarData.save();
      console.log("New car information saved successfully");

      user.carDetails = newCarData._id; 
      await user.save();
    }
  } catch (error) {
    console.error("Error saving car data:", error);
  }
};



const generateCarInfo = async (text: string, userId: string, brandName: string, carModel: string, year: number): Promise<string> => {
  const url = `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`;
  const systemPrompt = `Provide only the range (in km), fast charging speed (in kW), home charging speed (in kw) and battery capacity (in kWh) for ${text}. 
                       Format response exactly like this: range: number, fast charging speed: number, home charging speed: number, battery capacity: number.
                       Only provide these two metrics, no additional text.`;

  const payload = {
    contents: [
      {
        parts: [{ text: systemPrompt }],
      },
    ],
  };

  try {
    const agent = new https.Agent({ keepAlive: false, maxSockets: 1 });
    
    const config = {
      headers: { "Content-Type": "application/json" },
      httpsAgent: agent,
      timeout: 10000,
    };

    const response = await axios.post(url, payload, config);

    const data = response.data as GeminiResponse;
    const responseText = data.candidates[0].content.parts[0].text.trim();

    const [rangePart, fastChargingPart, homeChargingPart, batteryPart] = responseText.split(',').map(part => part.trim());
    const range: number = parseInt(rangePart.split(':')[1]);
    const fastChargingSpeed: number = parseInt(fastChargingPart.split(':')[1]);
    const homeChargingSpeed: number = parseInt(homeChargingPart.split(':')[1]);
    const batteryCapacity: number = parseInt(batteryPart.split(':')[1]);

  
    await saveCarData(userId, brandName, carModel, year, range, fastChargingSpeed, homeChargingSpeed, batteryCapacity);

    return `Range: ${range}km, Fast charging Speed: ${fastChargingSpeed}kw, Home charging speed: ${homeChargingSpeed}kw, Battery Capacity: ${batteryCapacity}kwh`;
  } catch (error) {
    console.error("Error generating content:", error);
    throw error;
  } finally {
    agent.destroy();
  }
};

export default generateCarInfo;



