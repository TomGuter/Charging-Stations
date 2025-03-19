import { Request, Response, NextFunction } from "express";
import userModel from "../models/user_model";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import fs from "fs";
import path from "path";



const signUp = async (req: Request, res: Response) => {
  const firstName = req.body.firstName;
  const lastName = req.body.lastName
  const phoneNumber = req.body.phoneNumber;
  const email = req.body.email;

  const password = req.body.password;
  if (!email || !password) {
    res.status(400).send("missing email or password");
    return;
  }
  try {
    const existingUser = await userModel.findOne({ email: email });
    if (existingUser) {
      res.status(400).send("User already exists");
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = await userModel.create({
      firstName: firstName,
      lastName: lastName,
      email: email,
      password: hashedPassword,
      phoneNumber: phoneNumber,
    });
    res.status(200).send(user);
  } catch (err) {
    res.status(400).send(err);
  }
};

const generateTokens = (
  _id: string
): { accessToken: string; refreshToken: string } | null => {
  const random = Math.floor(Math.random() * 1000000);
  if (!process.env.TOKEN_SECRET) {
    return null;
  }
  const accessToken = jwt.sign(
    {
      _id: _id,
      random: random,
    },
    process.env.TOKEN_SECRET,
    { expiresIn: process.env.TOKEN_EXPIRATION }
  );

  const refreshToken = jwt.sign(
    {
      _id: _id,
      random: random,
    },
    process.env.TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRATION }
  );

  return { accessToken, refreshToken };
};

const login = async (req: Request, res: Response) => {
  const email = req.body.email;
  const password = req.body.password;
  if (!email || !password) {
    res.status(400).send("wrong email or password");
    return;
  }
  try {
    const user = await userModel.findOne({ email: email });
    if (!user) {
      res.status(400).send("wrong email or password");
      return;
    }
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      res.status(400).send("wrong email or password");
      return;
    }


    const userId: string = user._id.toString();
    const tokens = generateTokens(userId);
    if (!tokens) {
      res.status(400).send("missing auth configuration");
      return;
    }

    if (user.refreshTokens == null) {
      user.refreshTokens = [];
    }
    user.refreshTokens.push(tokens.refreshToken);
    await user.save();
    res.status(200).send({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      _id: user._id,
      picture: user.picture,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    });
  } catch (err) {
    res.status(400).send(err);
  }
};

const logout = async (req: Request, res: Response) => {
  const refreshToken = req.body.refreshToken;
  if (!refreshToken) {
    return res.status(400).send("missing refresh token");
  }

  if (!process.env.TOKEN_SECRET) {
    return res.status(400).send("missing auth configuration");
  }

  jwt.verify(refreshToken, process.env.TOKEN_SECRET, async (err: any, data: any) => {
    if (err) {
      return res.status(403).send("invalid token");
    }

    const payload = data as TokenPayload;
    try {
      const user = await userModel.findOne({ _id: payload._id });
      if (!user) {
        return res.status(400).send("invalid token");
      }

      if (!user.refreshTokens || !user.refreshTokens.includes(refreshToken)) {
        user.refreshTokens = [];
        await user.save();
        return res.status(400).send("invalid token");
      }

      user.refreshTokens = [];
      // user.refreshTokens = user.refreshTokens.filter((token) => token !== refreshToken);
      await user.save();
      return res.status(200).send("logged out");
    } catch (err) {
      return res.status(400).send("invalid token");
    }
  });
};





const refreshToken = async (req: Request, res: Response) => {

  const refreshToken = req.body.refreshToken;
  if (!refreshToken) {
    res.status(400).send("Invalid token");
    return;
  }
  if (!process.env.TOKEN_SECRET) {
    res.status(400).send("Missing auth configuration");
    return;
  }

  jwt.verify(
    refreshToken,
    process.env.TOKEN_SECRET,
    async (err: any, data: any) => {
      if (err) {
        res.status(403).send("Invalid token");
        return;
      }

      const payload = data as TokenPayload;
      try {
        const user = await userModel.findOne({ _id: payload._id }).exec();
        if (!user || !user.refreshTokens.includes(refreshToken)) {
          res.status(400).send("Invalid token access");
          return;
        }

        const newTokens = generateTokens(user._id.toString());
        if (!newTokens) {
          res.status(500).send("Problem with token generation");
          return;
        }

        await userModel.updateOne(
          { _id: user._id },
          { $pull: { refreshTokens: refreshToken } }
        );

        await userModel.updateOne(
          { _id: user._id },
          { $push: { refreshTokens: newTokens.refreshToken } }
        );

        console.log("Token refreshed successfully");
        res.status(200).send({
          accessToken: newTokens.accessToken,
          refreshToken: newTokens.refreshToken,
        });
      } catch (err) {
        res.status(500).send("Server error");
      }
    }
  );
};



type TokenPayload = {
  _id: string;
};
export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
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
  jwt.verify(token, process.env.TOKEN_SECRET, (err, data) => {
    if (err) {
      res.status(403).send("invalid token access");
      return;
    }
    const payload = data as TokenPayload;
    req.query.userId = payload._id;
    next();
  });
};




const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const googleSignIn = async (req: Request, res: Response) => {
  try {
    const { idToken, password } = req.body;

    const ticket = await client.verifyIdToken({
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

    let user = await userModel.findOne({ email });

    if (!user) {
      const hashedPassword = await bcrypt.hash(password, 10);

      user = new userModel({
        email,
        firstName,
        lastName,
        password: hashedPassword,
        picture,
        refreshTokens: [],
      });

      await user.save();
    } else if (!googleId) {
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid password" });
      }
    } else if (googleId !== googleId) {
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

    await user.save();

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
  } catch (error) {
    console.error("Error in Google Sign-In:", error);
    res.status(400).json({ message: "Google Sign-In failed", error });
  }
};

const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await userModel.find({});
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Internal server error", error });
  }
};

const getUserById = async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user by ID:", error);
    res.status(500).json({ message: "Internal server error", error });
  }
};

const deleteUser = async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;
    const user = await userModel.findByIdAndDelete(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.picture) {
      const picturePath = path.resolve(__dirname, `../${user.picture}`);
      if (fs.existsSync(picturePath)) {
        fs.unlinkSync(picturePath);
      }
    }

    const userFolderPath = path.resolve(__dirname, `../uploads/${userId}`);
    if (fs.existsSync(userFolderPath)) {
      fs.rmdirSync(userFolderPath, { recursive: true });
    }

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Internal server error", error });
  }
};



const updateUser = async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;
    const updateData = req.body;
    const imageFile = req.file;

    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    if (imageFile) {
      const existingPicturePath = path.resolve(__dirname, `../${user.picture}`);
      if (fs.existsSync(existingPicturePath)) {
        fs.unlinkSync(existingPicturePath);
      }
      updateData.picture = `/uploads/${userId}/${imageFile.filename}`;
    }

    const updatedUser = await userModel.findByIdAndUpdate(userId, updateData, { new: true });
    res.status(200).json({ message: "User updated successfully", user: updatedUser });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Internal server error", error });
  }
};




const verifyAccessToken = async (req: Request, res: Response) => {
  const token = req.headers['authorization']?.split(' ')[1];  

  if (!token) {
    return res.status(401).send({ message: 'Access token is missing' });  
  }

  const SECRET = process.env.TOKEN_SECRET || ''; 

  try {
    const decoded = jwt.verify(token, SECRET);

    res.status(200).send({ message: 'Token is valid', decodedToken: decoded });

  } catch (err) {
    console.error('Error verifying access token:', err);
    return res.status(401).send({ message: 'Invalid or expired access token' });
  }
};



export default { signUp, login, logout, refreshToken, googleSignIn, getAllUsers,
   getUserById, deleteUser, updateUser, verifyAccessToken };
