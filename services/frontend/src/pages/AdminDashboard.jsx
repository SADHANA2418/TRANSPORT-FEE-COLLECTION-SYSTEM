import { useState } from "react";
import { Routes, Route, NavLink, Outlet, useNavigate } from "react-router-dom";
import { Menu, LayoutDashboard, Users, Map, CreditCard, LogOut } from "lucide-react";
import AdminImg from "../assets/admin-panel.png";

export default function AdminDashboard() {
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(true);
    const handleLogout = () => {
        // Clear auth/session (if you’re storing in localStorage or context, clear it here)
        // localStorage.removeItem("authToken");  <-- example if you use tokens
        navigate("/"); // Navigate back to Signin page (home route in your case)
    };

    return (
        <div className="flex h-screen bg-[#090040] text-white">
            {/* Sidebar */}
            <div
                className={`${isOpen ? "w-64" : "w-20"
                    } bg-[#090040] border-r border-purple-500 flex flex-col justify-between transition-all duration-300`}
            >
                {/* Top Section */}
                <div>
                    <div className="flex flex-col p-4 border-b border-purple-500">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="flex items-center p-2 hover:bg-purple-700 rounded-lg"
                        >
                            <Menu size={30} />
                            {isOpen && (
                                <span className="ml-2 font-bold text-amber-50">
                                    ADMIN DASHBOARD
                                </span>
                            )}
                        </button>
                    </div>
                    <div className="flex items-center justify-center p-4 border-b border-purple-500">
                        {isOpen && (
                            <div className="flex flex-col items-center text-center">
                                <img
                                    src={AdminImg}
                                    alt="Admin"
                                    className="w-16 h-16 rounded-full mb-2"
                                />
                                <span className="text-[#B13BFF] font-bold">Admin</span>
                            </div>
                        )}

                    </div>

                    {/* Nav Links */}
                    <nav className="mt-4 space-y-2">
                        <NavLink
                            to="/admin"
                            end
                            className={({ isActive }) =>
                                `flex items-center px-4 py-2 rounded-lg hover:bg-purple-700 transition ${isActive ? "bg-purple-800" : ""
                                }`
                            }
                        >
                            <LayoutDashboard className="mr-3" />
                            {isOpen && <span className="font-bold text-amber-50">Dashboard</span>}
                        </NavLink>

                        <NavLink
                            to="/admin/users"
                            className={({ isActive }) =>
                                `flex items-center px-4 py-2 rounded-lg hover:bg-purple-700 transition ${isActive ? "bg-purple-800" : ""
                                }`
                            }
                        >
                            <Users className="mr-3" />
                            {isOpen && <span className="font-bold  text-amber-50">User Management</span>}
                        </NavLink>

                        <NavLink
                            to="/admin/routes"
                            className={({ isActive }) =>
                                `flex items-center px-4 py-2 rounded-lg hover:bg-purple-700 transition ${isActive ? "bg-purple-800" : ""
                                }`
                            }
                        >
                            <Map className="mr-3" />
                            {isOpen && <span className="font-bold  text-amber-50">Route Management</span>}
                        </NavLink>

                        <NavLink
                            to="/admin/payments"
                            className={({ isActive }) =>
                                `flex items-center px-4 py-2 rounded-lg hover:bg-purple-700 transition ${isActive ? "bg-purple-800" : ""
                                }`
                            }
                        >
                            <CreditCard className="mr-3" />
                            {isOpen && <span className="font-bold  text-amber-50">Payments</span>}
                        </NavLink>
                    </nav>
                </div>

                {/* Logout */}
                <div className="p-4 border-t border-purple-500">
                    <button
                        onClick={handleLogout}
                        className="flex items-center px-4 py-2 w-full rounded-lg hover:bg-red-600 transition"
                    >
                        <LogOut className="mr-3" />
                        {isOpen && <span className="font-bold text-red-400">Logout</span>}
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-6 overflow-y-auto">
                <Outlet />
            </div>
        </div>
    );
}
