import React, { useState, useEffect } from "react";
import { CreditCard, Bus } from "lucide-react";
import axios from "axios";

const FeePayment = () => {
    const [amount, setAmount] = useState("");
    const [feeOptions, setFeeOptions] = useState([]);
    const [pending, setPending] = useState(0);
    const BASE_URL = process.env.REACT_APP_API_BASE_URL;

    // Fetch fee options on component mount
    useEffect(() => {
        const fetchFeeOptions = async () => {
            try {
                const token = localStorage.getItem("token");
                const res = await axios.get(`${BASE_URL}/student/fee/options`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setFeeOptions(res.data.options);
                setPending(res.data.pending);
            } catch (err) {
                console.error(err);
                alert("Failed to fetch fee options. Are you logged in?");
            }
        };
        fetchFeeOptions();
    }, []);

    const handlePayment = async (optionKey) => {
        try {
            const token = localStorage.getItem("token");

            // 1. Create payment order on backend
            const res = await axios.post(
                `${BASE_URL}/student/fee/create-order`,
                { option: optionKey },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const { order, amountToPay, razorpayKey } = res.data;

            // 2. Open Razorpay popup
            var options = {
                key: razorpayKey,
                amount: order.amount,
                currency: order.currency,
                name: "GlobalTech University",
                description: "Semester Fee Payment",
                order_id: order.id,
                handler: async function (response) {
                    // 3. Verify payment on backend
                    await axios.post(
                        `${BASE_URL}/student/fee/verify`,
                        {
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_signature: response.razorpay_signature,
                            amountPaid: amountToPay,
                        },
                        { headers: { Authorization: `Bearer ${token}` } }
                    );
                    alert("Payment successful!");
                },
                prefill: {
                    name: "GlobalTech",
                    email: "student@example.com",
                },
                theme: { color: "#3399cc" },
            };

            var rzp = new window.Razorpay(options);
            rzp.open();
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.error || "Payment failed");
        }
    };

    return (
        <div className="min-h-screen bg-[#090040] text-white flex justify-center py-12 px-6">
            <div className="w-full max-w-3xl space-y-10">
                <h1 className="text-3xl font-extrabold text-[#B13BFF]">Fee Payment</h1>

                <div className="bg-[#471396] border border-purple-500 rounded-xl shadow-xl p-8">
                    <h2 className="text-xl font-bold text-[#B13BFF] mb-6">Upcoming Payment</h2>

                    <p className="mb-4">
                        Pending Amount: <span className="text-green-300">₹ {pending}</span>
                    </p>

                    {feeOptions.map((opt) => (
                        <button
                            key={opt.key}
                            onClick={() => handlePayment(opt.key)}
                            className="w-full my-2 px-4 py-2 bg-blue-600 hover:bg-purple-600 rounded-lg text-white font-semibold"
                        >
                            Pay {opt.label} (₹ {opt.amount})
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default FeePayment;
