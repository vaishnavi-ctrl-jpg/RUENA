const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// GROQ CONFIG
const GROQ_API_KEY = "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";
const GROQ_MODEL   = "llama-3.3-70b-versatile";
const GROQ_URL     = "https://api.groq.com/openai/v1/chat/completions";

// DATA STORAGE
const DATA_FILE = path.join(__dirname, "ruena-data.json");

const loadData = () => {
  if (fs.existsSync(DATA_FILE)) {
    return JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
  }
  return { users: {} };
};

const saveData = (data) => {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
};

// ROUTES — Serve frontend
app.get("/", (req, res) => res.sendFile(path.join(__dirname, "public", "ruena.html")));
app.get("/auth", (req, res) => res.sendFile(path.join(__dirname, "public", "ruena-auth.html")));

// 1. CHAT API — Groq AI
app.post("/api/chat", async (req, res) => {
  const { userId, messages, temperature = 0.7 } = req.body;

  try {
    const response = await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages,
        temperature,
        max_tokens: 1500
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data.error?.message || "Groq API error" });
    }

    const reply = data.choices[0].message.content.trim();

    // Save chat to storage
    if (userId) {
      const stored = loadData();
      if (!stored.users[userId]) stored.users[userId] = { chats: [] };
      if (!stored.users[userId].chats) stored.users[userId].chats = [];
      stored.users[userId].chats.push({ message: messages[messages.length-1]?.content, reply, time: Date.now() });
      saveData(stored);
    }

    res.json({ reply });

  } catch (err) {
    console.error("Groq error:", err);
    res.status(500).json({ error: "Failed to get AI response" });
  }
});

// 2. NOTES API
app.post("/api/notes", (req, res) => {
  const { userId, content } = req.body;
  const data = loadData();
  if (!data.users[userId]) data.users[userId] = { notes: [] };
  if (!data.users[userId].notes) data.users[userId].notes = [];
  data.users[userId].notes.push({
    id: Date.now(),
    content,
    createdAt: new Date().toISOString()
  });
  saveData(data);
  res.json({ success: true, message: "✅ Notes saved!" });
});

// 3. QUIZ SCORES
app.post("/api/quiz-scores", (req, res) => {
  const { userId, score, total } = req.body;
  const data = loadData();
  if (!data.users[userId]) data.users[userId] = { scores: [] };
  if (!data.users[userId].scores) data.users[userId].scores = [];
  const percentage = Math.round((score / total) * 100);
  data.users[userId].scores.push({ score, total, percentage, date: Date.now() });
  saveData(data);
  res.json({ success: true, percentage });
});

// 4. USER STATS
app.get("/api/stats/:userId", (req, res) => {
  const userId = req.params.userId;
  const data = loadData();
  const user = data.users[userId] || {};
  res.json({
    totalNotes: user.notes?.length || 0,
    totalQuizzes: user.scores?.length || 0,
    avgScore: user.scores?.length ?
      Math.round(user.scores.reduce((a, b) => a + b.percentage, 0) / user.scores.length) : 0,
    streak: 7
  });
});

// 5. PYQ UPLOAD
app.post("/api/upload-pyq", (req, res) => {
  const { userId, filename } = req.body;
  res.json({
    success: true,
    fileUrl: `https://ruena-storage/${filename}`,
    analysis: { topics: ["Normalization 25%", "SQL 20%", "Joins 15%"] }
  });
});

// START
app.listen(PORT, () => {
  console.log(`🚀 Ruena Backend LIVE: http://localhost:${PORT}`);
  console.log(`📱 UI: http://localhost:${PORT}`);
  console.log(`💾 Data: ruena-data.json`);
});
