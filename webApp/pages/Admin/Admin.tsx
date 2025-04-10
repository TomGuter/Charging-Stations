import "./Admin.css";
import ManageUsers from "../../src/components/Admin/ManageUsers";
import ManageChargeStations from "../../src/components/Admin/ManageChargingStations";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";


export default function Admin() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const navigate = useNavigate();

  
  const firstName = localStorage.getItem("firstName");
  const lastName = localStorage.getItem("lastName");
  const email = localStorage.getItem("email");
  // const userId = localStorage.getItem("userId");
  // admin user id = "6797824660626fa69da65ce2"

  // also to add the check if the user id is admin id or not
  useEffect(() => {
    if (!localStorage.getItem("accessToken")) {
      navigate("/");
      return;
    }

    if (firstName === "admin" && lastName === "master" && email === "adminmaster@gmail.com") {
      setIsAdmin(true);
    } else {
      setIsAdmin(false);
      setShowMessage(true);

      setTimeout(() => {
        navigate("/Home"); 
      }, 1000);
    }
  }, [firstName, lastName, email, navigate]);

  if (!isAdmin && showMessage) {
    return (
      <div>
        <div>You do not have access to this page.</div>
      </div>
    );
  }


  return (
    <div className="admin-container">
      <div className="manageUsers">
        <ManageUsers />
      </div>
      <div className="manageStations">
        <ManageChargeStations />
      </div>
    </div>
  );
}
