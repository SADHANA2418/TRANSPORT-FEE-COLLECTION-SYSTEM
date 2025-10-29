import React, { useEffect, useState } from "react";
import axios from "axios";
import { Download, Trash2, UserPlus, Edit2 } from "lucide-react";
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const API_URL = `${BASE_URL}/admin`;


const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [selected, setSelected] = useState([]);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        role: "",
    });
    const [editingUser, setEditingUser] = useState(null);

    // ✅ Attach token automatically
    const getAuthHeaders = () => ({
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });

    // Fetch users
    const fetchUsers = async () => {
        try {
            const res = await axios.get(`${API_URL}/users`, getAuthHeaders());
            setUsers(res.data);
        } catch (err) {
            console.error("Error fetching users:", err.response?.data || err);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    // Select all or deselect
    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelected(users.map((u) => u.user_id));
        } else {
            setSelected([]);
        }
    };

    const handleSelectRow = (id) => {
        setSelected((prev) =>
            prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
        );
    };

    // ✅ Delete users
    const handleDelete = async () => {
        try {
            await Promise.all(
                selected.map((id) =>
                    axios.delete(`${API_URL}/users/${id}`, getAuthHeaders())
                )
            );
            setSelected([]);
            fetchUsers();
        } catch (err) {
            console.error("Error deleting users:", err.response?.data || err);
        }
    };

    // ✅ Add/Edit user
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingUser) {
                await axios.put(
                    `${API_URL}/users/${editingUser.user_id}`,
                    formData,
                    getAuthHeaders()
                );
                setEditingUser(null);
            } else {
                await axios.post(`${API_URL}/users`, formData, getAuthHeaders());
            }
            setFormData({ name: "", email: "", password: "", role: "" });
            fetchUsers();
        } catch (err) {
            console.error("Error submitting form:", err.response?.data || err);
        }
    };

    // Start editing
    const handleEdit = (user) => {
        setEditingUser(user);
        setFormData({
            name: user.name,
            email: user.email,
            password: "",
            role: user.role,
        });
    };

    return (
        <div className="p-6 bg-[#090040] min-h-screen text-white space-y-6">
            {/* Add/Edit User Form */}
            <div className="bg-[#090040] shadow-lg rounded-xl p-6 border border-purple-500">
                <h2 className="text-white font-bold text-xl mb-4 flex items-center gap-2">
                    <UserPlus /> {editingUser ? "Edit User" : "Add New User"}
                </h2>
                <form
                    className="grid grid-cols-1 md:grid-cols-2 gap-4"
                    onSubmit={handleSubmit}
                >
                    <input
                        type="text"
                        placeholder="Name"
                        className="p-3 rounded-lg bg-[#090040] border border-purple-500 placeholder-white text-white"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                    />
                    <input
                        type="email"
                        placeholder="Email"
                        className="p-3 rounded-lg bg-[#090040] border border-purple-500 placeholder-white text-white"
                        value={formData.email}
                        onChange={(e) =>
                            setFormData({ ...formData, email: e.target.value })
                        }
                        required
                    />
                    <select
                        className="p-3 rounded-lg bg-[#090040] border border-purple-500 text-white"
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        required
                    >
                        <option value="">Select Role</option>
                        <option value="student">Student</option>
                        <option value="staff">Staff</option>
                    </select>
                    <input
                        type="password"
                        placeholder={editingUser ? "New Password (optional)" : "Password"}
                        className="p-3 rounded-lg bg-[#090040] border border-purple-500 placeholder-white text-white"
                        value={formData.password}
                        onChange={(e) =>
                            setFormData({ ...formData, password: e.target.value })
                        }
                        required={!editingUser}
                    />
                    <div className="col-span-1 md:col-span-2 flex justify-end">
                        <button
                            type="submit"
                            className="px-6 py-2 bg-blue-500 hover:bg-purple-600 rounded-lg text-white font-semibold"
                        >
                            {editingUser ? "Update User" : "Add User"}
                        </button>
                    </div>
                </form>
            </div>

            {/* Users Table */}
            <div className="bg-[#090040] shadow-lg rounded-xl p-6 border border-purple-500">
                <h2 className="text-[#B13BFF] font-bold text-xl mb-4">User Table</h2>
                <table className="w-full border-collapse text-left">
                    <thead>
                        <tr className="bg-purple-950">
                            <th className="p-3 border border-purple-500">
                                <input
                                    type="checkbox"
                                    onChange={handleSelectAll}
                                    checked={selected.length === users.length && users.length > 0}
                                />
                            </th>
                            <th className="p-3 border border-purple-500">User ID</th>
                            <th className="p-3 border border-purple-500">Name</th>
                            <th className="p-3 border border-purple-500">Email</th>
                            <th className="p-3 border border-purple-500">Role</th>
                            <th className="p-3 border border-purple-500">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((u, idx) => (
                            <tr
                                key={u.user_id}
                                className={`${idx % 2 === 0 ? "bg-[#753eb3]" : "bg-[#471396]"
                                    } hover:bg-[#090040]`}
                            >
                                <td className="p-3 border border-purple-500">
                                    <input
                                        type="checkbox"
                                        checked={selected.includes(u.user_id)}
                                        onChange={() => handleSelectRow(u.user_id)}
                                    />
                                </td>
                                <td className="p-3 border border-purple-500">{u.user_id}</td>
                                <td className="p-3 border border-purple-500">{u.name}</td>
                                <td className="p-3 border border-purple-500">{u.email}</td>
                                <td className="p-3 border border-purple-500">{u.role}</td>
                                <td className="p-3 border border-purple-500 flex gap-2">
                                    <button
                                        onClick={() => handleEdit(u)}
                                        className="flex items-center gap-1 px-3 py-1 bg-yellow-500 hover:bg-yellow-600 rounded-lg"
                                    >
                                        <Edit2 size={16} /> Edit
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Export/Delete Options */}
                {selected.length > 0 && (
                    <div className="mt-4 flex justify-end gap-4">
                        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-purple-600 rounded-lg">
                            <Download size={18} /> Export
                        </button>
                        <button
                            onClick={handleDelete}
                            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-800 rounded-lg"
                        >
                            <Trash2 size={18} /> Delete
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserManagement;
