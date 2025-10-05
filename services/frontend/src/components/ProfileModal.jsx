// components/ProfileModal.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";

const ProfileModal = ({ token, onClose }) => {
    const [profile, setProfile] = useState(null);
    const [name, setName] = useState("");

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await axios.get("http://localhost:3000/student/profile", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setProfile(response.data);
                setName(response.data.name);
            } catch (err) {
                console.error("Error fetching profile:", err);
            }
        };
        fetchProfile();
    }, [token]);

    const handleSave = async () => {
        try {
            await axios.put(
                "http://localhost:3000/student/profile",
                { name },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            alert("Profile updated successfully!");
            onClose();
        } catch (err) {
            console.error("Error updating profile:", err);
            alert("Failed to update profile.");
        }
    };

    if (!profile) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
            <div className="bg-[#090040] p-8 rounded-xl w-96 relative">
                <h2 className="text-xl font-bold text-[#B13BFF] mb-4">My Profile</h2>
                <p><strong>Email:</strong> {profile.email}</p>
                <p><strong>Role:</strong> {profile.role}</p>
                <div className="mt-4">
                    <label className="block mb-1">Name:</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full p-2 rounded-md text-black"
                    />
                </div>
                <div className="flex justify-end mt-6 space-x-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg bg-gray-600 hover:bg-gray-700"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700"
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProfileModal;
