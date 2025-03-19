import { Router } from "express";
import add_comments_controller from "../controllers/commentsOnCharger_controller";
import { authMiddleware } from "../controllers/user_controller_auth";


const router = Router();



/**
 * @swagger
 * tags:
 *   name: Charging Stations Comments
 *   description: The Charging Stations API
 */



/**
 * @swagger
 * components:
 *   schemas:
 *     Comment:
 *       type: object
 *       required:
 *         - text
 *       properties:
 *         userId:
 *           type: string
 *           description: The ID of the user who made the comment.
 *           example: "60d0fe4f5311236168a109ca"
 *         text:
 *           type: string
 *           description: The content of the comment.
 *           example: "Could be a better station!!!!"
 *         likes:
 *           type: number
 *           description: The number of likes the comment has received.
 *           example: 10
 *         dislikes:
 *           type: number
 *           description: The number of dislikes the comment has received.
 *           example: 2
 *         likedUsers:
 *           type: array
 *           items:
 *             type: string
 *           description: List of user IDs who liked the comment.
 *           example: ["60d0fe4f5311236168a109ca", "60d0fe4f5311236168a109cb"]
 *         dislikedUsers:
 *           type: array
 *           items:
 *             type: string
 *           description: List of user IDs who disliked the comment.
 *           example: ["60d0fe4f5311236168a109cc"]
 *         Rating:
 *           type: number
 *           description: The rating of the comment.
 *           example: 4
 *         Date:
 *           type: string
 *           format: date-time
 *           description: The date when the comment was created.
 *           example: "2025-03-05T12:00:00Z"
*/






/**
 * @swagger
 * /addComments/addComment/{chargerId}:
 *   post:
 *     summary: Add a comment to a specific charging station
 *     description: Allows a user to add a comment to a charging station based on its ID.
 *     tags:
 *       - Charging Stations Comments
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: chargerId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the charging station to which the comment will be added.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - chargerId
 *               - userId
 *               - text
 *             properties:
 *               chargerId:
 *                 type: string
 *                 description: The ID of the charging station.
 *                 example: ""
 *               userId:
 *                 type: string
 *                 description: The ID of the user who made the comment.
 *                 example: ""
 *               text:
 *                 type: string
 *                 description: The content of the comment.
 *                 example: "Could be a better station!!!!"
 *     responses:
 *       201:
 *         description: Comment added successfully to the charging station.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 userId:
 *                   type: string
 *                   example: "60d0fe4f5311236168a109ca"
 *                 text:
 *                   type: string
 *                   example: "Could be a better station!!!!"
 *                 likes:
 *                   type: number
 *                   example: 10
 *                 Rating:
 *                   type: number
 *                   example: 4
 *                 Date:
 *                   type: string
 *                   format: date-time
 *                   example: "2025-03-05T12:00:00Z"
 *       400:
 *         description: Invalid input, comment could not be added.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Missing required fields"
 *       404:
 *         description: Charging station not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Charger not found"
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Internal server error"
 */
router.post("/addComment/:chargerId", authMiddleware, (req, res) => {
    add_comments_controller.addComment(req, res); 
});









/**
 * @swagger
 * /addComments/getComment/{chargerId}/{commentId}:
 *   get:
 *     summary: Retrieve a specific comment by its ID for a given charging station
 *     description: Fetches the details of a specific comment associated with a charging station using the IDs provided.
 *     tags:
 *       - Charging Stations Comments
 *     parameters:
 *       - in: path
 *         name: chargerId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the charging station.
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the comment to retrieve.
 *     responses:
 *       200:
 *         description: Successfully retrieved the comment.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 text:
 *                   type: string
 *                   description: The content of the comment.
 *                   example: "Great !"
 *                 _id:
 *                   type: string
 *                   description: The unique ID of the comment.
 *                   example: "60d0fe4f531123fs168as09cb"
 *                 chargerId:
 *                   type: string
 *                   description: The ID of the associated charging station.
 *                   example: "67861a6f42063748092fa966"
 *       404:
 *         description: Comment or charging station not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Comment or charging station not found"
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Failed to retrieve comment"
 */

router.get("/getComment/:chargerId/:commentId", (req, res) => {
    add_comments_controller.getCommentById(req, res);
});











/**
 * @swagger
 * /addComments/updateComment/{chargerId}/{commentId}:
 *   put:
 *     summary: Update a specific comment for a given charging station
 *     description: Updates the text of a specific comment associated with a charging station using the provided IDs.
 *     tags:
 *       - Charging Stations Comments
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: chargerId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the charging station.
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the comment to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - text
 *             properties:
 *               text:
 *                 type: string
 *                 description: The new content of the comment.
 *                 example: "Updated comment text!"
 *     responses:
 *       200:
 *         description: Successfully updated the comment.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Comment updated successfully"
 *                 updatedComment:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       description: The ID of the updated comment.
 *                       example: "60d0fe4f531123fs168as09cb"
 *                     text:
 *                       type: string
 *                       description: The updated text of the comment.
 *                       example: "Updated comment text!"
 *                     chargerId:
 *                       type: string
 *                       description: The ID of the associated charging station.
 *                       example: "67861a6f42063748092fa966"
 *       400:
 *         description: Invalid input, comment could not be updated.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Comment text is required"
 *       404:
 *         description: Comment or charging station not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Comment or charging station not found"
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Failed to update comment"
 */

router.put("/updateComment/:chargerId/:commentId", authMiddleware, (req, res) => {
    add_comments_controller.updateComment(req, res);
});








/**
 * @swagger
 * /addComments/deleteComment/{chargerId}/{commentId}:
 *   delete:
 *     summary: Delete a specific comment from a charging station
 *     description: Deletes a specific comment associated with a charging station using the provided IDs.
 *     tags:
 *       - Charging Stations Comments
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: chargerId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the charging station.
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the comment to delete.
 *     responses:
 *       200:
 *         description: Successfully deleted the comment.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Comment deleted successfully"
 *                 deletedComment:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       description: The ID of the deleted comment.
 *                       example: "60d0fe4f531123fs168as09cb"
 *                     text:
 *                       type: string
 *                       description: The text of the deleted comment.
 *                       example: "This is a comment on the post."
 *                     chargerId:
 *                       type: string
 *                       description: The ID of the associated charging station.
 *                       example: "67861a6f42063748092fa966"
 *       404:
 *         description: Comment or charging station not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Comment or charging station not found"
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Failed to delete comment"
 */

router.delete("/deleteComment/:chargerId/:commentId", authMiddleware, (req, res) => {
    add_comments_controller.deleteCommentById(req, res);
});





/**
 * @swagger
 * /addComments/getCommentsByChargerId/{chargerId}:
 *   get:
 *     summary: Retrieve all comments for a specific charging station
 *     description: Fetches all comments associated with a specific charging station using its ID.
 *     tags:
 *       - Charging Stations Comments
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: chargerId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the charging station.
 *     responses:
 *       200:
 *         description: Successfully retrieved the comments.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Comments retrieved successfully"
 *                 comments:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Comment'
 *       404:
 *         description: Charging station not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Charging station not found"
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Failed to retrieve comments"
 */
router.get("/getCommentsByChargerId/:chargerId", authMiddleware, (req, res) => {
    add_comments_controller.getCommentsByChargerId(req, res);
});





/**
 * @swagger
 * /addComments/toggleLikeDislikeComment:
 *   post:
 *     summary: Toggle like or dislike on a comment
 *     description: Allows a user to like or dislike a comment on a charging station.
 *     tags:
 *       - Charging Stations Comments
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - chargerId
 *               - commentId
 *               - userId
 *             properties:
 *               chargerId:
 *                 type: string
 *                 description: The ID of the charging station.
 *                 example: ""
 *               commentId:
 *                 type: string
 *                 description: The ID of the comment.
 *                 example: ""
 *               userId:
 *                 type: string
 *                 description: The ID of the user who is liking or disliking the comment.
 *                 example: ""
 *               like:
 *                 type: boolean
 *                 description: Whether the user likes the comment.
 *                 example: true
 *               dislike:
 *                 type: boolean
 *                 description: Whether the user dislikes the comment.
 *                 example: false
 *     responses:
 *       200:
 *         description: Successfully toggled like or dislike on the comment.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 userId:
 *                   type: string
 *                   example: "60d0fe4f5311236168a109ca"
 *                 text:
 *                   type: string
 *                   example: "Could be a better station!!!!"
 *                 likes:
 *                   type: number
 *                   example: 10
 *                 dislikes:
 *                   type: number
 *                   example: 2
 *                 likedUsers:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["60d0fe4f5311236168a109ca", "60d0fe4f5311236168a109cb"]
 *                 dislikedUsers:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["60d0fe4f5311236168a109cc"]
 *       404:
 *         description: Comment not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Comment not found"
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Server error"
 */
router.post("/toggleLikeDislikeComment/", authMiddleware, (req, res) => {
    add_comments_controller.toggleLikeDislikeComment(req, res);
});



export default router;