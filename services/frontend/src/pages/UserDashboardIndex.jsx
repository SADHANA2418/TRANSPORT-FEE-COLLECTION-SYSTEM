// pages/UserDashboardIndex.jsx
import React, { useEffect, useState } from "react";
import { DollarSign, Clock, AlertTriangle, Calendar, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const BASE_URL = process.env.REACT_APP_API_BASE_URL;
const UserDashboardIndex = () => {
    const navigate = useNavigate();
    const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading] = useState(true);

    const token = localStorage.getItem("token");

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const response = await axios.get(`${BASE_URL}/student/dashboard`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setDashboard(response.data);
            } catch (err) {
                console.error("Error fetching dashboard:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboard();
    }, [token]);

    const handlePayNow = () => navigate("/user/fee-payment");

    if (loading) return <div className="min-h-screen flex items-center justify-center text-white">Loading dashboard...</div>;
    if (!dashboard) return <div className="min-h-screen flex items-center justify-center text-red-500">Failed to load dashboard.</div>;

    const { feeSummary, announcements } = dashboard;
    const upcomingPayments = feeSummary?.pending > 0 ? [{ dueDate: "TBD", amount: feeSummary.pending, description: "Pending Fee" }] : [];
    const pastPayments = feeSummary?.total_paid > 0 ? [{ txnId: "#txn1", amount: feeSummary.total_paid }] : [];

    return (
        <div className="min-h-screen bg-[#090040] text-white flex justify-center py-12 px-6">
            <div className="w-full max-w-6xl space-y-10">
                {/* Top Section (3 Stat Cards) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="bg-blue-600 text-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition transform hover:scale-105">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-bold">Total Fee Paid</h2>
                            <DollarSign size={28} />
                        </div>
                        <p className="text-3xl font-extrabold mt-3">₹ {feeSummary.total_paid}</p>
                    </div>
                    <div className="bg-orange-500 text-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition transform hover:scale-105">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-bold">Pending Amount</h2>
                            <Clock size={28} />
                        </div>
                        <p className="text-3xl font-extrabold mt-3">₹ {feeSummary.pending}</p>
                        <p className="text-sm mt-1">This academic semester</p>
                    </div>
                    <div className="bg-red-600 text-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition transform hover:scale-105">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-bold">Overdue</h2>
                            <AlertTriangle size={28} />
                        </div>
                        <p className="text-3xl font-extrabold mt-3">₹ {feeSummary.overdue_fee}</p>
                        <p className="text-sm mt-1">Attention Required</p>
                    </div>
                </div>

                {/* Announcements */}
                {announcements && announcements.length > 0 && (
                    <div className="bg-[#471396] border border-purple-500 p-6 rounded-xl shadow-xl">
                        <h2 className="text-xl font-bold text-[#B13BFF] mb-3">Announcements</h2>
                        <ul className="space-y-2">
                            {announcements.map((ann, idx) => (
                                <li key={idx} className="border-b border-purple-500 pb-2">
                                    <span className="font-semibold">{ann.title}: </span>
                                    <span>{ann.message}</span>
                                    <div className="text-xs text-gray-300">{new Date(ann.created_at).toLocaleDateString()}</div>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Bottom Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="bg-[#471396] border border-purple-500 text-white p-8 rounded-xl shadow-xl hover:shadow-2xl transition">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-xl font-bold text-[#B13BFF]">Upcoming Payments</h2>
                            <Calendar size={26} />
                        </div>
                        {upcomingPayments.length > 0 ? (
                            upcomingPayments.map((payment, idx) => (
                                <div key={idx}>
                                    <p className="text-sm">Due Date: <span className="font-semibold">{payment.dueDate}</span></p>
                                    <p className="text-sm">Amount: <span className="font-semibold">₹ {payment.amount}</span></p>
                                    <p className="text-sm">Description: <span className="font-semibold">{payment.description}</span></p>
                                    <button
                                        onClick={handlePayNow}
                                        className="mt-5 px-5 py-2 bg-blue-600 hover:bg-purple-600 rounded-lg text-white font-semibold transition-colors"
                                    >
                                        Pay Now
                                    </button>
                                </div>
                            ))
                        ) : (
                            <p>No pending payments.</p>
                        )}
                    </div>
                    <div className="bg-[#471396] border border-purple-500 text-white p-8 rounded-xl shadow-xl hover:shadow-2xl transition">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-xl font-bold text-[#B13BFF]">Past Payments</h2>
                            <FileText size={26} />
                        </div>
                        {pastPayments.length > 0 ? (
                            <ul className="space-y-4">
                                {pastPayments.map((payment, idx) => (
                                    <li key={idx} className="flex justify-between border-b border-purple-500 pb-2">
                                        <span>Txn ID: {payment.txnId}</span>
                                        <span className="font-semibold">₹ {payment.amount}</span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p>No past payments.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserDashboardIndex;
