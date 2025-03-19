import { Request, Response } from "express";
import ChargingModel from "../models/add_charging_model";
import chargingModel from "../models/add_charging_model";

const addComment = async (req: Request, res: Response) => {
    const { chargerId, userId, text, likes = 0, rating = 0 } = req.body;

  if (!chargerId || !userId || !text) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const charger = await chargingModel.findById(chargerId);

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

    await charger.save();
    res.status(201).json(newComment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getCommentById = async (req: Request, res: Response) => {
    try {
        const { chargerId, commentId } = req.params;

        const chargingStation = await ChargingModel.findById(chargerId);
        if (!chargingStation) {
            return res.status(404).json({ message: "Charging station not found" });
        }

        const comment = chargingStation.comments.id(commentId);
        if (!comment) {
            return res.status(404).json({ message: "Comment not found" });
        }

        res.status(200).json({ message: "Comment retrieved successfully", comment });
    } catch (error) {
        res.status(500).json({ message: "Failed to retrieve comment", error });
    }
};


const updateComment = async (req: Request, res: Response) => {

    try {
        const { chargerId, commentId } = req.params;
        const { text } = req.body;

        const chargingStation = await ChargingModel.findById(chargerId);
        if (!chargingStation) {
            return res.status(404).json({ message: "Charging station not found" });
        }

        const comment = chargingStation.comments.id(commentId);
        if (!comment) {
            return res.status(404).json({ message: "Comment not found" });
        }

        comment.text = text;
        await chargingStation.save();

        res.status(200).json({ message: "Comment updated successfully", chargingStation });
    } catch (error) {
        res.status(500).json({ message: "Failed to update comment", error });
    }
};

const deleteCommentById = async (req: Request, res: Response) => {
    try {
        const { chargerId, commentId } = req.params;

        const chargingStation = await ChargingModel.findById(chargerId);
        if (!chargingStation) {
            return res.status(404).json({ message: "Charging station not found" });
        }

        const comment = chargingStation.comments.id(commentId);
        if (!comment) {
            return res.status(404).json({ message: "Comment not found" });
        }

        comment.deleteOne();
        await chargingStation.save();

        res.status(200).json({ message: "Comment deleted successfully", chargingStation });
    } catch (error) {
        res.status(500).json({ message: "Failed to delete comment", error });
    }
};

const getCommentsByChargerId = async (req: Request, res: Response) => {
    try {
        const { chargerId } = req.params;

        const chargingStation = await ChargingModel.findById(chargerId);
        if (!chargingStation) {
            return res.status(404).json({ message: "Charging station not found" });
        }

        res.status(200).json({ message: "Comments retrieved successfully", comments: chargingStation.comments });
    } catch (error) {
        res.status(500).json({ message: "Failed to retrieve comments", error });
    }
};



const toggleLikeDislikeComment = async (req: Request, res: Response) => {
    const { like, dislike } = req.body;
    const userId = req.body.userId;
    
    try {
        const charger = await chargingModel.findById(req.body.chargerId);
        const comment = charger?.comments.find((comment) => comment._id.equals(req.body.commentId));

        if (!comment) {
            return res.status(404).json({ message: "Comment not found" });
        }

        comment.likes = comment.likes ?? 0;
        comment.dislikes = comment.dislikes ?? 0;

        if (like) {
            if (comment.likedUsers.includes(userId)) {
                comment.likes--;
                comment.likedUsers = comment.likedUsers.filter((id) => !id.equals(userId));
            } else {
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
            } else {
                comment.dislikes++;
                comment.dislikedUsers.push(userId);

                if (comment.likedUsers.includes(userId)) {
                    comment.likes--;
                    comment.likedUsers = comment.likedUsers.filter((id) => !id.equals(userId));
                }
            }
        }

        if (charger) {
            await charger.save();
            res.json(comment);
        }

    } catch (error) {
        console.error(error);
        res.status(500).send("Server error");
    }
};





export default { addComment, updateComment, deleteCommentById, 
    getCommentById, getCommentsByChargerId, toggleLikeDislikeComment };