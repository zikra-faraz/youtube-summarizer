import React from "react";
import { useSignOut, useUserData } from "@nhost/react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const Logout = () => {
  const { signOut, isLoading } = useSignOut(); // Nhost sign-out hook
  const user = useUserData(); // Get user data to check if the user is logged in
  const navigate = useNavigate();

  const handleLogout = async () => {
    const response = await signOut(); // Sign out the user
    toast.success("Logged out successfully. See you soon!");
    if (!response.error) {
      // console.log("Successfully logged out");
      navigate("/auth", { replace: true }); // Redirect to login page after logout
    } else {
      console.error("Logout failed:", response.error.message);
      alert("Failed to log out: " + response.error.message);
    }
  };

  return (
    <div className="logout-container">
      {user ? (
        <>
          <button
            onClick={handleLogout}
            disabled={isLoading}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {isLoading ? "Logging out..." : "Logout"}
          </button>
        </>
      ) : (
        <p className="text-gray-500">You are not logged in.</p>
      )}
    </div>
  );
};

export default Logout;
