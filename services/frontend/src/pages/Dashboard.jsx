import React, { useEffect, useState } from "react";
import axios from "axios";
import {
    Users,
    DollarSign,
    AlertTriangle,
    Ban,
} from "lucide-react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend,
} from "recharts";
import { useNavigate } from "react-router-dom";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const Dashboard = () => {
    const navigate = useNavigate();

    const [stats, setStats] = useState({
        totalStudents: null,
        totalPayment: null,
        pendingPayments: null,
        overduePayments: null,
    });

    const [feeOverviewData, setFeeOverviewData] = useState([]);
    const [pieData, setPieData] = useState([]);
    const pieColors = ["#22C55E", "#F97316"];

    const formatINR = (value) => {
        if (value === null || value === undefined) return "₹0";
        if (typeof value === "number") {
            return new Intl.NumberFormat("en-IN", {
                style: "currency",
                currency: "INR",
                maximumFractionDigits: 0
            }).format(value);
        }
        return value;
    };

    useEffect(() => {
        const fetchDashboardData = async () => {
            const token = localStorage.getItem("token");
            if (!token) {
                navigate("/"); // redirect to login if no token
                return;
            }

            try {
                const res = await axios.get(`${BASE_URL}/admin/dashboard`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (res && res.data) {
                    const newStats = {
                        totalStudents: res.data.totalStudents ?? 0,
                        totalPayment: res.data.totalPayment ?? 0,
                        pendingPayments: res.data.pendingPayments ?? 0,
                        overduePayments: res.data.overduePayments ?? 0,
                    };
                    setStats(newStats);

                    const barData = [
                        { name: "Total Students", value: newStats.totalStudents },
                        { name: "Pending Payments", value: newStats.pendingPayments },
                        { name: "Overdue Payments", value: newStats.overduePayments },
                    ];
                    setFeeOverviewData(barData);

                    const paidCount = Math.max(0, newStats.totalStudents - newStats.pendingPayments);
                    const pie = [
                        { name: "Paid (approx)", value: paidCount },
                        { name: "Pending", value: newStats.pendingPayments },
                    ];
                    setPieData(pie);
                }
            } catch (err) {
                console.error("Error fetching dashboard data:", err);
                if (err.response && (err.response.status === 401 || err.response.status === 403)) {
                    // Token invalid or unauthorized
                    localStorage.removeItem("token");
                    navigate("/"); // redirect to login
                }
            }
        };

        fetchDashboardData();
    }, [navigate]);

    return (
        <div className="p-6 space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-blue-500 text-white p-6 rounded-2xl shadow-lg hover:scale-105 transition">
                    <div className="flex items-center gap-3">
                        <Users size={32} />
                        <h2 className="text-lg font-semibold">Total Students</h2>
                    </div>
                    <p className="text-3xl font-bold mt-2">{stats.totalStudents}</p>
                    <p className="text-sm mt-1">Active Enrollment</p>
                </div>

                <div className="bg-green-500 text-white p-6 rounded-2xl shadow-lg hover:scale-105 transition">
                    <div className="flex items-center gap-3">
                        <DollarSign size={32} />
                        <h2 className="text-lg font-semibold">Total Collected</h2>
                    </div>
                    <p className="text-3xl font-bold mt-2">{formatINR(stats.totalPayment)}</p>
                    <p className="text-sm mt-1">This Academic Year</p>
                </div>

                <div className="bg-orange-400 text-white p-6 rounded-2xl shadow-lg hover:scale-105 transition">
                    <div className="flex items-center gap-3">
                        <AlertTriangle size={32} />
                        <h2 className="text-lg font-semibold">Pending Fee</h2>
                    </div>
                    <p className="text-3xl font-bold mt-2">{stats.pendingPayments}</p>
                    <p className="text-sm mt-1">Attention Required</p>
                </div>

                <div className="bg-red-500 text-white p-6 rounded-2xl shadow-lg hover:scale-105 transition">
                    <div className="flex items-center gap-3">
                        <Ban size={32} />
                        <h2 className="text-lg font-semibold">Defaulters</h2>
                    </div>
                    <p className="text-3xl font-bold mt-2">{stats.overduePayments}</p>
                    <p className="text-sm mt-1">Overdue Payments</p>
                </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-[#090040] border-purple-600 border-4 p-6 rounded-2xl shadow-lg">
                    <h2 className="text-lg font-bold mb-4">Fee Overview</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={feeOverviewData}>
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="value" fill="#4F46E5" radius={[6, 6, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="bg-[#090040] border-purple-600 border-4 p-6 rounded-2xl shadow-lg">
                    <h2 className="text-lg font-bold mb-4">Fee Distribution</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={pieData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) =>
                                    `${name}: ${(percent * 100).toFixed(0)}%`
                                }
                                outerRadius={130}
                                dataKey="value"
                            >
                                {pieData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                                ))}
                            </Pie>
                            <Legend />
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-lg text-center">
                    <h3 className="font-bold">Quick Action 1</h3>
                    <p className="text-sm text-gray-600">Placeholder</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-lg text-center">
                    <h3 className="font-bold">Quick Action 2</h3>
                    <p className="text-sm text-gray-600">Placeholder</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-lg text-center">
                    <h3 className="font-bold">Quick Action 3</h3>
                    <p className="text-sm text-gray-600">Placeholder</p>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
