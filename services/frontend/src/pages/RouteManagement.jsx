// src/pages/RouteManagement.jsx
import React, { useState, useEffect } from "react";
import { Trash2, Download, Edit, Search } from "lucide-react";
const BASE_URL = process.env.REACT_APP_API_BASE_URL;

const API_URL = `${BASE_URL}/admin`; // keep as your backend mounting

const RouteManagement = () => {
    const [routes, setRoutes] = useState([]);
    const [selected, setSelected] = useState([]);
    const [formData, setFormData] = useState({
        route_name: "",
        start_location: "",
        end_location: "",
        price: "",
    });
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [searchId, setSearchId] = useState("");

    // 🔹 Helper: fetch with token attached
    const fetchWithAuth = async (url, options = {}) => {
        const token = localStorage.getItem("token");
        return fetch(url, {
            ...options,
            headers: {
                "Content-Type": "application/json",
                Authorization: token ? `Bearer ${token}` : "",
                ...(options.headers || {}),
            },
        });
    };

    // 🔹 Fetch routes from backend
    const fetchRoutes = async () => {
        try {
            setLoading(true);
            setError("");
            const res = await fetchWithAuth(`${API_URL}/routes`);
            const data = await res.json();
            if (res.ok) {
                setRoutes(data.routes || []);
            } else {
                setError(data.error || "Failed to fetch routes");
                setRoutes([]);
            }
        } catch (err) {
            console.error(err);
            setError("Server error");
            setRoutes([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRoutes();
    }, []);

    // 🔹 Search route by ID (extra functionality above table)
    const handleSearch = async () => {
        if (!searchId) {
            // empty search: reset to all routes
            fetchRoutes();
            return;
        }

        try {
            setLoading(true);
            setError("");
            const res = await fetchWithAuth(`${API_URL}/routes/${encodeURIComponent(searchId)}`);
            const data = await res.json();

            if (res.ok && data.route) {
                setRoutes([data.route]); // show only the matched route
                setSelected([]); // reset selections when search result shown
            } else {
                setRoutes([]);
                setError(data.error || "Route not found");
            }
        } catch (err) {
            console.error(err);
            setError("Error fetching route");
            setRoutes([]);
        } finally {
            setLoading(false);
        }
    };

    // 🔹 Handle input change for add/edit form
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // 🔹 Add / Update route
    const saveRoute = async (e) => {
        e.preventDefault();
        if (!formData.route_name || !formData.start_location || !formData.end_location || !formData.price) {
            setError("All fields are required");
            return;
        }

        try {
            setError("");
            let res;
            if (editingId) {
                // Update route
                res = await fetchWithAuth(`${API_URL}/routes/${editingId}`, {
                    method: "PUT",
                    body: JSON.stringify(formData),
                });
            } else {
                // Add route
                res = await fetchWithAuth(`${API_URL}/routes`, {
                    method: "POST",
                    body: JSON.stringify(formData),
                });
            }

            const data = await res.json();
            if (res.ok) {
                fetchRoutes();
                setFormData({ route_name: "", start_location: "", end_location: "", price: "" });
                setEditingId(null);
            } else {
                setError(data.error || "Operation failed");
            }
        } catch (err) {
            console.error(err);
            setError("Server error");
        }
    };

    // 🔹 Select route for edit
    const startEdit = (route) => {
        setFormData({
            route_name: route.route_name,
            start_location: route.start_location,
            end_location: route.end_location,
            price: route.price,
        });
        setEditingId(route.route_id);
    };

    // 🔹 Delete selected routes
    const deleteSelected = async () => {
        try {
            for (let id of selected) {
                await fetchWithAuth(`${API_URL}/routes/${id}`, { method: "DELETE" });
            }
            setSelected([]);
            fetchRoutes();
        } catch (err) {
            console.error(err);
            setError("Failed to delete selected routes");
        }
    };

    // 🔹 Export selected routes (placeholder)
    const exportSelected = () => {
        const selectedRoutes = routes.filter((r) => selected.includes(r.route_id));
        console.log("Exporting:", selectedRoutes); // later hook with CSV/PDF
        alert("Export functionality can be integrated here!");
    };

    // 🔹 Selection helpers
    const toggleSelectAll = (e) => {
        if (e.target.checked) {
            setSelected(routes.map((r) => r.route_id));
        } else {
            setSelected([]);
        }
    };

    const toggleSelect = (id) => {
        setSelected((prev) =>
            prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
        );
    };

    return (
        <div className="min-h-screen p-6" style={{ backgroundColor: "#090040" }}>
            {/* Add / Edit Route Form */}
            <div
                className="p-6 rounded-2xl shadow-lg mb-8"
                style={{ backgroundColor: "#471396", border: "1px solid #B13BFF" }}
            >
                <h2 className="text-2xl font-bold mb-4" style={{ color: "#B13BFF" }}>
                    {editingId ? "Edit Route" : "Add New Route"}
                </h2>
                <form onSubmit={saveRoute} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                        type="text"
                        name="route_name"
                        placeholder="Route Name"
                        value={formData.route_name}
                        onChange={handleChange}
                        className="p-3 rounded-lg bg-[#090040] border border-purple-500 placeholder-white text-white"
                    />
                    <input
                        type="text"
                        name="start_location"
                        placeholder="Start Location"
                        value={formData.start_location}
                        onChange={handleChange}
                        className="p-3 rounded-lg bg-[#090040] border border-purple-500 placeholder-white text-white"
                    />
                    <input
                        type="text"
                        name="end_location"
                        placeholder="End Location"
                        value={formData.end_location}
                        onChange={handleChange}
                        className="p-3 rounded-lg bg-[#090040] border border-purple-500 placeholder-white text-white"
                    />
                    <input
                        type="number"
                        step="0.01"
                        name="price"
                        placeholder="Price"
                        value={formData.price}
                        onChange={handleChange}
                        className="p-3 rounded-lg bg-[#090040] border border-purple-500 placeholder-white text-white"
                    />
                    <div className="col-span-1 md:col-span-2 flex justify-end gap-2">
                        {editingId && (
                            <button
                                type="button"
                                onClick={() => {
                                    setEditingId(null);
                                    setFormData({ route_name: "", start_location: "", end_location: "", price: "" });
                                    setError("");
                                }}
                                className="px-6 py-2 bg-gray-500 hover:bg-gray-600 rounded-lg text-white font-semibold"
                            >
                                Cancel
                            </button>
                        )}
                        <button
                            type="submit"
                            className="px-6 py-2 bg-blue-500 hover:bg-purple-600 rounded-lg text-white font-semibold"
                        >
                            {editingId ? "Update Route" : "Add Route"}
                        </button>
                    </div>
                </form>
            </div>

            {/* Search bar (added) + Routes Table (kept exactly as before) */}
            <div
                className="p-6 rounded-2xl shadow-lg"
                style={{ backgroundColor: "#471396", border: "1px solid #B13BFF" }}
            >
                <h2 className="text-2xl font-bold mb-4" style={{ color: "#B13BFF" }}>
                    Routes Table
                </h2>

                {/* ===== Search area (extra functionality) ===== */}
                <div className="flex items-center gap-2 mb-4">
                    <input
                        type="text"
                        placeholder="Enter Route ID"
                        value={searchId}
                        onChange={(e) => setSearchId(e.target.value)}
                        className="p-2 rounded-lg bg-[#090040] border border-purple-500 text-white placeholder-white"
                    />
                    <button
                        onClick={handleSearch}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white flex items-center gap-1"
                    >
                        <Search size={16} /> Search
                    </button>
                    <button
                        onClick={() => { setSearchId(""); fetchRoutes(); setError(""); }}
                        className="px-3 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg text-white"
                        title="Clear search and show all"
                    >
                        Clear
                    </button>
                </div>

                {error && <p className="text-red-400 mb-4">{error}</p>}

                {loading ? (
                    <p className="text-white">Loading routes...</p>
                ) : (
                    <table className="w-full border-collapse text-sm">
                        <thead>
                            <tr style={{ color: "#fff" }} className="bg-purple-700">
                                <th className="p-3 border border-purple-500 text-left">
                                    <input
                                        type="checkbox"
                                        onChange={toggleSelectAll}
                                        checked={selected.length === routes.length && routes.length > 0}
                                    />
                                </th>
                                <th className="p-3 border border-purple-500">Route ID</th>
                                <th className="p-3 border border-purple-500">Route Name</th>
                                <th className="p-3 border border-purple-500">Start Location</th>
                                <th className="p-3 border border-purple-500">End Location</th>
                                <th className="p-3 border border-purple-500">Price</th>
                                <th className="p-3 border border-purple-500">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {routes.length > 0 ? (
                                routes.map((r, idx) => (
                                    <tr
                                        key={r.route_id}
                                        className={`${idx % 2 === 0 ? "bg-purple-900" : "bg-purple-800"} hover:bg-purple-600`}
                                        style={{ color: "#fff" }}
                                    >
                                        <td className="p-3 border border-purple-500 text-center">
                                            <input
                                                type="checkbox"
                                                checked={selected.includes(r.route_id)}
                                                onChange={() => toggleSelect(r.route_id)}
                                            />
                                        </td>
                                        <td className="p-3 border border-purple-500">{r.route_id}</td>
                                        <td className="p-3 border border-purple-500">{r.route_name}</td>
                                        <td className="p-3 border border-purple-500">{r.start_location}</td>
                                        <td className="p-3 border border-purple-500">{r.end_location}</td>
                                        <td className="p-3 border border-purple-500">₹{r.price}</td>
                                        <td className="p-3 border border-purple-500 flex gap-2">
                                            <button
                                                onClick={() => startEdit(r)}
                                                className="px-3 py-1 bg-yellow-500 hover:bg-yellow-600 rounded text-white flex items-center gap-1"
                                            >
                                                <Edit size={16} /> Edit
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="text-center p-4 text-white">
                                        No data available
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}

                {/* Action Buttons */}
                {selected.length > 0 && (
                    <div className="flex justify-end gap-4 mt-4">
                        <button
                            onClick={exportSelected}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg"
                            style={{ backgroundColor: "#1D4ED8", color: "#fff" }}
                        >
                            <Download size={18} /> Export
                        </button>
                        <button
                            onClick={deleteSelected}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg"
                            style={{ backgroundColor: "#B91C1C", color: "#fff" }}
                        >
                            <Trash2 size={18} /> Delete
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RouteManagement;
