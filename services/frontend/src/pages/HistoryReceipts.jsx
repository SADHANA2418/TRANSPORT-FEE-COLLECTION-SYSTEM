import React, { useEffect, useState } from "react";
import axios from "axios";

const HistoryReceipts = () => {
    const BASE_URL = import.meta.env.VITE_API_BASE_URL;
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const token = localStorage.getItem("token");

    const fetchHistory = async () => {
        if (!token) {
            setError("You must be logged in to view payment history.");
            setLoading(false);
            return;
        }

        try {
            const res = await axios.get(`${BASE_URL}/student/fee/history`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            setHistory(Array.isArray(res.data.history) ? res.data.history : []);
            setLoading(false);
        } catch (err) {
            console.error("Error fetching payment history:", err);
            setError("Failed to fetch payment history. Please try again later.");
            setLoading(false);
        }
    };

    const downloadReceipt = async (paymentId) => {
        if (!token) {
            alert("You must be logged in to download receipts.");
            return;
        }

        try {
            const res = await axios.get(
                `${BASE_URL}/student/download-receipt/${paymentId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const sasUrl = res.data?.receiptSasUrl || res.data?.sasUrl;

            if (sasUrl) {
                const link = document.createElement("a");
                link.href = sasUrl;
                link.target = "_blank";
                link.rel = "noopener noreferrer";
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            } else {
                alert("Receipt not available for this payment.");
            }
        } catch (err) {
            console.error("Error downloading receipt:", err);
            alert(err.response?.data?.error || "Failed to download receipt.");
        }
    };

    useEffect(() => {
        fetchHistory();
    }, []);

    return (
        <div className="min-h-screen bg-[#090040] text-white p-8">
            <h1 className="text-3xl font-extrabold text-[#B13BFF] mb-8">Payment History</h1>

            {loading && <p className="text-white">Loading payment history...</p>}
            {!loading && error && <p className="text-red-400">{error}</p>}
            {!loading && !error && history.length === 0 && <p>No payment history found.</p>}

            {!loading && !error && history.length > 0 && (
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-purple-500">
                                <th className="p-3">Payment ID</th>
                                <th className="p-3">Amount Paid</th>
                                <th className="p-3">Payment Date</th>
                                <th className="p-3">Payment Method</th>
                                <th className="p-3">Reference</th>
                                <th className="p-3">Receipt</th>
                            </tr>
                        </thead>
                        <tbody>
                            {history.map((h) => (
                                <tr key={h.payment_id} className="border-b border-gray-700 hover:bg-gray-800">
                                    <td className="p-3">{h.payment_id}</td>
                                    <td className="p-3">₹ {h.paid_amount || h.amount || "-"}</td>
                                    <td className="p-3">
                                        {h.transaction_date
                                            ? new Date(h.transaction_date).toLocaleString()
                                            : "-"}
                                    </td>
                                    <td className="p-3">{h.method || "-"}</td>
                                    <td className="p-3">{h.reference_number || "-"}</td>
                                    <td className="p-3">
                                        <button
                                            onClick={() => downloadReceipt(h.payment_id)}
                                            className="bg-purple-600 px-4 py-2 rounded hover:bg-blue-600"
                                        >
                                            Download
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default HistoryReceipts;
