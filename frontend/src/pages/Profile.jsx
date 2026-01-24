import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AppNavbar from "../components/AppNavbar";
import api from "../services/api";

export default function Profile() {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [loading, setLoading] = useState(false);

  /* ---------------- LOGOUT ---------------- */
  const handleLogout = async () => {
    try {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/login");
    } catch (err) {
      console.error(err);
    }
  };

  /* ---------------- DELETE ACCOUNT ---------------- */
  const handleDeleteAccount = async () => {
    if (confirmText !== "DELETE") return;

    try {
      setLoading(true);

      await api.delete("/auth/delete-account", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      localStorage.clear();
      navigate("/signup");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* NAVBAR */}
      <AppNavbar />

      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="w-full max-w-md border rounded-xl shadow-sm p-6 text-center">

          {/* ================= NOT LOGGED IN ================= */}
          {!token || !user ? (
            <>
              <h2 className="text-2xl font-bold text-orange-600 mb-4">
                No Profile Found
              </h2>

              <p className="text-gray-600 mb-6">
                Please login to create and view your profile.
              </p>

              <button
                onClick={() => navigate("/login")}
                className="w-full bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600 transition"
              >
                Login
              </button>
            </>
          ) : (
            <>
              {/* ================= LOGGED IN ================= */}
              <h2 className="text-2xl font-bold text-orange-600 mb-6">
                My Profile
              </h2>

              {/* USER INFO */}
              <div className="mb-6 space-y-2 text-left">
                <p>
                  <span className="font-semibold">Name:</span>{" "}
                  {user.name}
                </p>
                <p>
                  <span className="font-semibold">Email:</span>{" "}
                  {user.email}
                </p>
              </div>

              {/* LOGOUT */}
              <button
                onClick={handleLogout}
                className="w-full bg-orange-500 text-white py-2 rounded-lg mb-4 hover:bg-orange-600 transition"
              >
                Logout
              </button>

              {/* DELETE ACCOUNT */}
              {!showDeleteConfirm ? (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="w-full border border-red-500 text-red-600 py-2 rounded-lg hover:bg-red-50 transition"
                >
                  Delete Account
                </button>
              ) : (
                <div className="mt-6 border border-red-300 rounded-lg p-4 text-left">
                  <p className="text-red-600 font-semibold mb-2">
                    This action is permanent
                  </p>

                  <p className="text-sm text-gray-600 mb-3">
                    Type <strong>DELETE</strong> to confirm
                  </p>

                  <input
                    type="text"
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value)}
                    className="w-full border rounded px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-red-400"
                    placeholder="Type DELETE"
                  />

                  <div className="flex gap-3">
                    {/* CANCEL */}
                    <button
                      onClick={() => {
                        setShowDeleteConfirm(false);
                        setConfirmText("");
                      }}
                      className="w-1/2 border border-gray-400 text-gray-700 py-2 rounded-lg hover:bg-gray-100 transition"
                    >
                      Cancel
                    </button>

                    {/* CONFIRM */}
                    <button
                      disabled={confirmText !== "DELETE" || loading}
                      onClick={handleDeleteAccount}
                      className={`w-1/2 py-2 rounded-lg text-white transition ${
                        confirmText === "DELETE"
                          ? "bg-red-600 hover:bg-red-700"
                          : "bg-red-300 cursor-not-allowed"
                      }`}
                    >
                      {loading ? "Deleting..." : "Confirm"}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
