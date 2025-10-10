import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

function PasswordReset() {
    const BASE_URL = process.env.REACT_APP_API_BASE_URL;
    const navigate = useNavigate();
    const location = useLocation();
    const { email } = location.state || { email: "" };

    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [error, setError] = useState("");

    const handleReset = async (e) => {
        e.preventDefault();
        setError("");

        if (password !== confirm) {
            setError("Passwords do not match");
            return;
        }

        try {
            const res = await fetch(`${BASE_URL}/auth/set-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password, confirmPassword: confirm }),
            });

            const data = await res.json();

            if (res.ok) {
                alert("Password set successfully!");
                navigate("/"); // Go back to login
            } else {
                setError(data.error || "Password reset failed");
            }
        } catch (err) {
            console.error(err);
            setError("Server error. Please try again later.");
        }
    };

    return (
        <div className="flex justify-center items-center h-screen bg-[#090040]">
            <form onSubmit={handleReset} className="bg-[#471396] p-8 rounded-2xl shadow-xl border border-[#B13BFF] w-[380px]">
                <h2 className="text-[#B13BFF] text-2xl font-bold mb-2 text-center">
                    PASSWORD RESET
                </h2>
                <p className="text-white text-sm text-center mb-6">
                    Set your unique password to continue
                </p>

                <label className="block text-white mb-1">Email</label>
                <input type="email" value={email} readOnly className="w-full p-2 mb-4 rounded-lg bg-gray-200 text-black focus:outline-none" />

                <label className="block text-white mb-1">Password</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-2 mb-4 bg-gray-200 rounded-lg focus:outline-none" />

                <label className="block text-white mb-1">Confirm Password</label>
                <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className="w-full p-2 mb-6 bg-gray-200 rounded-lg focus:outline-none" />

                {error && <p className="text-red-400 text-sm mb-2">{error}</p>}

                <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-purple-600 transition-all">
                    Create Account
                </button>
            </form>
        </div>
    );
}

export default PasswordReset;
