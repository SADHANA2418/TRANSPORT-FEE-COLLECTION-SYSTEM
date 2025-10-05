// pages/UserDashboard.jsx
import React, { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { Menu, LayoutDashboard, CreditCard, FileText, LogOut } from "lucide-react";
import StudentImg from "../assets/team.png";
import ProfileModal from "../components/profileModal";

const UserDashboard = () => {
    const [isOpen, setIsOpen] = useState(true);
    const [showProfile, setShowProfile] = useState(false);
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/");
    };

    const token = localStorage.getItem("token");

    return (
        <div className="flex h-screen bg-[#090040] text-white">
            {/* Sidebar */}
            <div className={`${isOpen ? "w-64" : "w-20"} bg-[#090040] border-r border-purple-500 flex flex-col justify-between transition-all duration-300`}>
                <div>
                    <div className="flex items-center justify-between p-4 border-b border-purple-500">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="p-2 hover:bg-purple-700 rounded-lg flex items-center"
                        >
                            <Menu size={28} />
                            {isOpen && <span className="ml-2 font-bold text-[#B13BFF]">Student</span>}
                        </button>
                    </div>

                    {isOpen && (
                        <div className="flex flex-col items-center text-center mt-4 cursor-pointer" onClick={() => setShowProfile(true)}>
                            <img src={StudentImg} alt="Student" className="w-16 h-16 rounded-full mb-2 border-2 border-purple-500" />
                            <span className="font-bold text-[#B13BFF]">Student</span>
                        </div>
                    )}

                    <nav className="mt-6 space-y-2">
                        <NavLink to="/user" end className={({ isActive }) => `flex items-center px-4 py-2 rounded-lg hover:bg-purple-700 transition ${isActive ? "bg-purple-800" : ""}`}>
                            <LayoutDashboard className="mr-3" />
                            {isOpen && <span>Dashboard</span>}
                        </NavLink>

                        <NavLink to="/user/fee-payment" className={({ isActive }) => `flex items-center px-4 py-2 rounded-lg hover:bg-purple-700 transition ${isActive ? "bg-purple-800" : ""}`}>
                            <CreditCard className="mr-3" />
                            {isOpen && <span>Fee Payment</span>}
                        </NavLink>

                        <NavLink to="/user/history" className={({ isActive }) => `flex items-center px-4 py-2 rounded-lg hover:bg-purple-700 transition ${isActive ? "bg-purple-800" : ""}`}>
                            <FileText className="mr-3" />
                            {isOpen && <span>History & Receipts</span>}
                        </NavLink>
                    </nav>
                </div>

                <div className="p-4 border-t border-purple-500">
                    <button onClick={handleLogout} className="flex items-center px-4 py-2 rounded-lg hover:bg-purple-700 w-full">
                        <LogOut className="mr-3" />
                        {isOpen && <span>Logout</span>}
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-6 overflow-y-auto">
                <Outlet />
            </div>

            {/* Profile Modal */}
            {showProfile && <ProfileModal token={token} onClose={() => setShowProfile(false)} />}
        </div>
    );
};

export default UserDashboard;
