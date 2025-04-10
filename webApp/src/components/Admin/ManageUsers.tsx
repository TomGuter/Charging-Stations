import  { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  TextField,
  Box,
  Input,
} from "@mui/material";
import "./ManageUsers.css";

interface User {
  _id: number;
  firstName: string;
  lastName: string;
  email: string;
  address: string;
  phone: string;
}

export default function ManageUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [editUser, setEditUser] = useState<number | null>(null);
  const [editedData, setEditedData] = useState<User | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      const accessToken = localStorage.getItem("accessToken");
      try {
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/admin/getAllUsers`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch users");
        }
        const data: User[] = await response.json();
        setUsers(data);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);

  const filterUsers = () => {
    return users.filter(
      (user) =>
        user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phone?.includes(searchTerm)
    );
  };

  const deleteUser = async (id: number) => {
    const accessToken = localStorage.getItem("accessToken");

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/admin/deleteUser${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete user");
      }

      setUsers(users.filter((user) => user._id !== id));
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  const handleEditUser = (user: User) => {
    setEditUser(user._id);
    setEditedData(user);
  };

  const handleSaveEdit = async () => {
    if (editedData) {
      const accessToken = localStorage.getItem("accessToken");
      try {
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/admin/updateUser/${editedData._id}`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(editedData),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to update user");
        }

        setUsers(
          users.map((user) =>
            user._id === editedData._id ? { ...editedData } : user
          )
        );

        setEditUser(null); // Close the editing mode
        setEditedData(null); // Clear the edited data
      } catch (error) {
        console.error("Error updating user:", error);
      }
    }
  };

  const handleCancelEdit = () => {
    setEditUser(null);
    setEditedData(null);
  };

  const handleChange = (field: keyof User, value: string) => {
    if (editedData) {
      setEditedData({
        ...editedData,
        [field]: value,
      });
    }
  };

  return (
    <Box sx={{ padding: 3, backgroundColor: "#f5f5f5", borderRadius: 2 }}>
      <Typography
        variant="h4"
        gutterBottom
        sx={{ fontWeight: "bold", color: "#333" }}
      >
        Control All Users
      </Typography>

      <TextField
        label="Search by name or phone"
        variant="outlined"
        fullWidth
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        sx={{ marginBottom: 2, backgroundColor: "#fff", borderRadius: 1 }}
      />

      <TableContainer
        component={Paper}
        sx={{
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
          height: "200px",
          maxHeight: "400px",
          overflowY: "auto",
        }}
      >
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead
            sx={{
              backgroundColor: "black",
              color: "#fff",
              position: "sticky",
              top: "0",
              zIndex: 1,
            }}
          >
            <TableRow>
              <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                Name
              </TableCell>
              <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                Email
              </TableCell>
              <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                Address
              </TableCell>
              <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                Phone
              </TableCell>
              <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filterUsers().map((user) => (
              <TableRow
                key={user._id}
                sx={{ "&:hover": { backgroundColor: "#f1f1f1" } }}
              >
                <TableCell key={`name-${user._id}`}>
                  {editUser === user._id ? (
                    <Box>
                      <Input
                        value={editedData?.firstName}
                        onChange={(e) =>
                          handleChange("firstName", e.target.value)
                        }
                        sx={{ marginBottom: 1 }}
                      />
                      <Input
                        value={editedData?.lastName}
                        onChange={(e) =>
                          handleChange("lastName", e.target.value)
                        }
                        sx={{ marginBottom: 1 }}
                      />
                    </Box>
                  ) : (
                    `${user.firstName} ${user.lastName}`
                  )}
                </TableCell>
                <TableCell key={`email-${user._id}`}>
                  {editUser === user._id ? (
                    <Input
                      value={editedData?.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      sx={{ marginBottom: 1 }}
                    />
                  ) : (
                    user.email
                  )}
                </TableCell>
                <TableCell key={`address-${user._id}`}>
                  {editUser === user._id ? (
                    <Input
                      value={editedData?.address}
                      onChange={(e) => handleChange("address", e.target.value)}
                      sx={{ marginBottom: 1 }}
                    />
                  ) : (
                    user.address
                  )}
                </TableCell>
                <TableCell key={`phone-${user._id}`}>
                  {editUser === user._id ? (
                    <Input
                      value={editedData?.phone}
                      onChange={(e) => handleChange("phone", e.target.value)}
                      sx={{ marginBottom: 1 }}
                    />
                  ) : (
                    user.phone
                  )}
                </TableCell>
                <TableCell className="tableCell" key={`actions-${user._id}`}>
                  {editUser === user._id ? (
                    <div className="buttun">
                      <button onClick={handleSaveEdit} className="schedule-btn">
                        Save
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="schedule-btn"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="buttun">
                      <button
                        onClick={() => handleEditUser(user)}
                        className="schedule-btn"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteUser(user._id)}
                        className="schedule-btn"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
