import React, { useState } from "react";
import {
  AiOutlineLike,
  AiFillLike,
  AiOutlineDislike,
  AiFillDislike,
} from "react-icons/ai";

interface Comment {
  userId: string;
  _id: string;
  userName: string;
  text: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
    picture: string;
  };
  Date: string;
  liked: boolean;
  disliked: boolean;
  likes: number;
  dislikes: number;
  likedUsers: string[];
  dislikedUsers: string[];
}

interface CommentsProps {
  comments: Comment[];
  chargerId: string;
  onCommentAdded: (comment: Comment) => void;
  onCommentDeleted: (commentId: string) => void;
  onCommentUpdated: (commentId: string, newText: string) => void;
  onToggleReaction: (commentId: string, reaction: "like" | "dislike") => void;
}

export default function Comments({
  comments,
  chargerId,
  onCommentAdded,
  onCommentDeleted,
  onCommentUpdated,
  onToggleReaction,
}: CommentsProps) {
  const [newComment, setNewComment] = useState<string>("");
  const [editCommentId, setEditCommentId] = useState<string | null>(null);
  const [editText, setEditText] = useState<string>("");

  const handleCommentChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNewComment(event.target.value);
  };

  const handleAddComment = async () => {
    if (newComment.trim()) {
      try {
        const accessToken = localStorage.getItem("accessToken");
        const userId = localStorage.getItem("userId");
        const userNameFromContext = localStorage.getItem("firstName");

        if (!accessToken || !userId) {
          throw new Error("User is not authenticated.");
        }

        const newCommentPayload = {
          chargerId,
          userId,
          userName: userNameFromContext,
          text: newComment,
          likes: 0,
          rating: 5,
        };

        const response = await fetch(
          `http://localhost:3000/addComments/addComment/${chargerId}`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(newCommentPayload),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to add comment.");
        }

        const addedComment = await response.json();

        const commentToAdd = {
          userId: addedComment.userId,
          _id: addedComment._id,
          userName: addedComment.userName,
          text: addedComment.text,
          user: {
            firstName: "",
            lastName: "",
            email: "",
            picture: "",
          },
          Date: new Date().toLocaleDateString(),
          liked: false,
          disliked: false,
          likes: 0,
          dislikes: 0,
          likedUsers: [],
          dislikedUsers: [],
        };

        onCommentAdded(commentToAdd);
        setNewComment("");
      } catch (error) {
        console.error("Error adding comment:", error);
      }
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      const accessToken = localStorage.getItem("accessToken");

      if (!accessToken) {
        throw new Error("User is not authenticated.");
      }

      const response = await fetch(
        `http://localhost:3000/addComments/deleteComment/${chargerId}/${commentId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete comment.");
      }

      onCommentDeleted(commentId);
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  const handleEditComment = (commentId: string, currentText: string) => {
    setEditCommentId(commentId);
    setEditText(currentText);
  };

  const handleSaveComment = async () => {
    if (editText.trim()) {
      try {
        const accessToken = localStorage.getItem("accessToken");

        if (!accessToken) {
          throw new Error("User is not authenticated.");
        }

        const response = await fetch(
          `http://localhost:3000/addComments/updateComment/${chargerId}/${editCommentId}`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ text: editText }),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to update comment.");
        }

        onCommentUpdated(editCommentId!, editText);
        setEditCommentId(null);
        setEditText("");
      } catch (error) {
        console.error("Error updating comment:", error);
      }
    }
  };

  return (
    <div className="comments-section">
      <div className="add-comment">
        <input
          type="text"
          value={newComment}
          onChange={handleCommentChange}
          placeholder="Add a comment"
          className="comment-input"
        />
        <button onClick={handleAddComment} className="add-comment-button">
          Add Comment
        </button>
      </div>

      <div className="comments-list">
        {comments.length > 0 ? (
          comments.map((comment) => (
            <div key={comment._id} className="comment">
              <div className="comment-header">
                <img
                  src={
                    comment.user.picture
                      ? `http://localhost:3000${comment.user.picture}`
                      : "http://localhost:3000/default-profile-picture.png"
                  }
                  alt={`${comment.user.firstName}'s profile`}
                  className="comment-user-picture"
                />
                <p>
                  <strong>{comment.user.firstName}</strong> -{" "}
                  {new Date(comment.Date).toLocaleDateString()}
                </p>
              </div>
              {editCommentId === comment._id ? (
                <div>
                  <input
                    type="text"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="edit-comment-input"
                  />
                  <button
                    onClick={handleSaveComment}
                    className="save-comment-button"
                  >
                    Save
                  </button>
                </div>
              ) : (
                <p>{comment.text}</p>
              )}
              <div className="like-unlike-section">
                <button
                  onClick={() => onToggleReaction(comment._id, "like")}
                  className="like-button"
                >
                  {comment.liked ? (
                    <AiFillLike size={25} color="#007bff" />
                  ) : (
                    <AiOutlineLike size={25} />
                  )}
                  {comment.likes}
                </button>
                <button
                  onClick={() => onToggleReaction(comment._id, "dislike")}
                  className="dislike-button"
                >
                  {comment.disliked ? (
                    <AiFillDislike size={25} color="#dc3545" />
                  ) : (
                    <AiOutlineDislike size={25} />
                  )}
                  {comment.dislikes}
                </button>
              </div>
              <div className="comment-actions">
                <button
                  onClick={() => handleDeleteComment(comment._id)}
                  className="delete-comment-button"
                >
                  Delete
                </button>
                <button
                  onClick={() => handleEditComment(comment._id, comment.text)}
                  className="edit-comment-button"
                >
                  Edit
                </button>
              </div>
            </div>
          ))
        ) : (
          <p>No comments yet.</p>
        )}
      </div>
    </div>
  );
}