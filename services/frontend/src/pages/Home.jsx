import { useState, useEffect } from "react";
import { Mail, Lock, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

function Home() {
    const [email, setEmail] = useState("");
    const [step, setStep] = useState("email"); // "email" | "password"
    const [error, setError] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleContinue = async () => {
        if (!email) {
            setError("Please enter your email.");
            return;
        }

        try {
            const res = await fetch("http://localhost:3000/auth/check-user", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });
            const data = await res.json();

            if (!data.exists) {
                setError("Email ID does not exist.");
                return;
            }

            setError("");

            if (!data.passwordSet) {
                // New user → go to reset password page
                navigate("/reset-password", { state: { email } });
            } else {
                // Existing user → ask for password
                setStep("password");
            }
        } catch (err) {
            console.error(err);
            setError("Server error. Please try again later.");
        }
    };

    const handleLogin = async () => {
        if (!password) {
            setError("Please enter your password.");
            return;
        }

        try {
            const res = await fetch("http://localhost:3000/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (res.ok) {
                // Save token in localStorage for future requests
                localStorage.setItem("token", data.token);

                // Navigate based on role
                if (data.user.role === "admin") navigate("/admin");
                else navigate("/user");
            } else {
                setError(data.error || "Login failed");
            }
        } catch (err) {
            console.error(err);
            setError("Server error. Please try again later.");
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-[var(--bg-color)]">
            <h1 className="text-3xl md:text-4xl font-bold text-center text-white mb-8">
                Welcome to TransPay!!! Please enter your Email ID to continue.
            </h1>

            <div className="w-full max-w-md bg-[var(--card-bg)] border-purple-600 border-4 rounded-2xl shadow-lg p-8 space-y-6">
                <div>
                    <h2 className="text-2xl text-center font-bold text-[var(--bold-text)] flex items-center gap-2">
                        <Mail size={22} /> SIGN IN
                    </h2>
                    <p className="text-sm text-[var(--small-text)]">
                        Enter your mail ID to sign in
                    </p>
                </div>

                {step === "email" && (
                    <div>
                        <label htmlFor="email" className="block text-sm font-bold text-[var(--small-text)] mb-1">
                            Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full rounded-lg px-4 py-2 bg-amber-50 text-black focus:ring-2 focus:ring-[var(--btn-hover)] outline-none"
                        />
                    </div>
                )}

                {step === "password" && (
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-[var(--small-text)] mb-1">
                            Password
                        </label>
                        <div className="flex items-center">
                            <Lock className="text-[var(--small-text)] mr-2" size={20} />
                            <input
                                type="password"
                                id="password"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-amber-50 rounded-lg px-4 py-2 text-black focus:ring-2 focus:ring-[var(--btn-hover)] outline-none"
                            />
                        </div>
                        {/* Forgot Password Link */}
                        <p
                            className="text-sm text-purple-300 mt-2 cursor-pointer hover:underline text-center"
                            onClick={() => {
                                if (!email) {
                                    setError("Please enter your email first.");
                                    return;
                                }
                                navigate("/reset-password", { state: { email } });
                            }}
                        >
                            Forgot Password?
                        </p>
                    </div>
                )}

                {error && (
                    <div className="flex items-center gap-2 text-red-400 text-sm">
                        <AlertCircle size={18} />
                        <span>{error}</span>
                    </div>
                )}

                {step === "email" && (
                    <button
                        onClick={handleContinue}
                        className="w-full bg-[var(--btn-bg)] hover:bg-[var(--btn-hover)] text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                    >
                        Continue
                    </button>
                )}

                {step === "password" && (
                    <button
                        onClick={handleLogin}
                        className="w-full bg-[var(--btn-bg)] hover:bg-[var(--btn-hover)] text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                    >
                        Login
                    </button>
                )}
            </div>
        </div>
    );
}

export default Home;
