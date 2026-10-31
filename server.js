require("dotenv").config();

const express = require("express");
const path = require("path");

const app = express();

app.use(express.json({ limit: "2mb" }));
app.use(express.static(path.join(__dirname, "public")));

app.post("/api/chat", async (req, res) => {
    try {
        const { message, code, mode } = req.body;

        if (!message) {
            return res.status(400).json({
                error: "Type a message first."
            });
        }

        if (!process.env.OPENAI_API_KEY) {
            return res.status(503).json({
                error: "AI is not connected. Add your API key to .env."
            });
        }

        const prompt = mode === "fix"
            ? `You are Junior AI, a coding assistant. Fix the user's code, explain the changes, and provide the complete corrected code.

Request: ${message}

Code:
${code || "No code provided"}`
            : `You are Junior AI, a helpful AI assistant. Answer clearly and accurately.

User: ${message}`;

        const response = await fetch(
            "https://api.openai.com/v1/responses",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
                },
                body: JSON.stringify({
                    model: "gpt-4.1-mini",
                    input: prompt
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            return res.status(500).json({
                error: data.error?.message || "AI request failed."
            });
        }

        const answer = data.output
            ?.flatMap(item => item.content || [])
            .filter(item => item.type === "output_text")
            .map(item => item.text)
            .join("\n");

        res.json({
            answer: answer || "No answer was returned."
        });

    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
});

app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("Junior AI is running on port " + PORT);
});