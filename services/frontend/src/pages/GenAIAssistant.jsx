// src/pages/GenAIAssistant.jsx
import { useState } from "react";
import { Bot, Send } from "lucide-react";

export default function GenAIAssistant({ role = "user" }) {
    const [query, setQuery] = useState("");
    const [response, setResponse] = useState("");
    const [loading, setLoading] = useState(false);

    const handleAskAI = async () => {
        if (!query.trim()) return;
        setLoading(true);
        setResponse("");

        try {
            const res = await fetch("http://localhost:3000/genai/ask", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ role, query }),
            });
            const data = await res.json();
            setResponse(data.response);
        } catch (err) {
            console.error(err);
            setResponse("Error connecting to AI service.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-[#090040] text-white border border-purple-500 p-6 rounded-2xl shadow-xl max-w-3xl mx-auto mt-8">
            <h2 className="flex items-center gap-2 text-xl font-bold text-purple-300 mb-4">
                <Bot /> {role === "admin" ? "Admin AI Assistant" : "Student AI Assistant"}
            </h2>

            <div className="flex flex-col gap-4">
                <textarea
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Ask the AI assistant..."
                    className="w-full p-3 bg-[#12006b] text-white rounded-lg border border-purple-500 focus:ring-2 focus:ring-purple-400 outline-none resize-none"
                    rows="4"
                />

                <button
                    onClick={handleAskAI}
                    disabled={loading}
                    className="flex items-center justify-center gap-2 bg-purple-700 hover:bg-purple-800 text-white font-semibold py-2 px-4 rounded-lg transition"
                >
                    <Send size={18} /> {loading ? "Thinking..." : "Ask AI"}
                </button>

                {response && (
                    <div className="mt-4 bg-[#1a007a] p-4 rounded-lg border border-purple-600">
                        <h3 className="font-semibold text-purple-400 mb-2">AI Response:</h3>
                        <p className="whitespace-pre-wrap text-gray-200">{response}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
