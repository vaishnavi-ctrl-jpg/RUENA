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

// Data storage file
const DATA_FILE = path.join(__dirname, "ruena-data.json");

// Load/Save data
const loadData = () => {
  if (fs.existsSync(DATA_FILE)) {
    return JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
  }
  return { users: {} };
};

const saveData = (data) => {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
};

// Routes
app.get("/", (req, res) => res.sendFile(path.join(__dirname, "public", "ruena.html")));
app.get("/auth", (req, res) => res.sendFile(path.join(__dirname, "public", "ruena-auth.html")));

// 🔥 1. NOTES API
app.post("/api/notes", (req, res) => {
  const { userId, content } = req.body;
  const data = loadData();
  if (!data.users[userId]) data.users[userId] = { notes: [] };
  data.users[userId].notes.push({
    id: Date.now(),
    content,
    createdAt: new Date().toISOString()
  });
  saveData(data);
  res.json({ success: true, message: "✅ Notes saved!", noteId: Date.now() });
});

// 🔥 2. CHAT API (Ruena AI)
app.post("/api/chat", (req, res) => {
  const { userId, message } = req.body;
  const responses = {
    "normalization": "Database Normalization removes redundancy using 1NF, 2NF, 3NF.",
    "sql": "SQL = Structured Query Language for database operations (SELECT, INSERT, UPDATE).",
    "express": "Express.js is Node.js web framework for APIs and static files."
  };
  const response = responses[message.toLowerCase()] || `🤖 Ruena: "${message}" samjh rahi hun...`;
  
  // Save chat
  const data = loadData();
  if (!data.users[userId]) data.users[userId] = { chats: [] };
  data.users[userId].chats.push({ message, response, time: Date.now() });
  saveData(data);
  
  res.json({ response });
});

// 🔥 3. QUIZ SCORES
app.post("/api/quiz-scores", (req, res) => {
  const { userId, score, total } = req.body;
  const data = loadData();
  if (!data.users[userId]) data.users[userId] = { scores: [] };
  const percentage = Math.round((score / total) * 100);
  data.users[userId].scores.push({ score, total, percentage, date: Date.now() });
  saveData(data);
  res.json({ success: true, percentage });
});

// 🔥 4. USER STATS
app.get("/api/stats/:userId", (req, res) => {
  const userId = req.params.userId;
  const data = loadData();
  const user = data.users[userId] || {};
  res.json({
    totalNotes: user.notes?.length || 0,
    totalQuizzes: user.scores?.length || 0,
    avgScore: user.scores?.length ? 
      Math.round(user.scores.reduce((a, b) => a + b.percentage, 0) / user.scores.length) : 0,
    streak: 7 // Calculate later
  });
});

// 🔥 5. PYQ UPLOAD (mock file)
app.post("/api/upload-pyq", (req, res) => {
  const { userId, filename } = req.body;
  res.json({
    success: true,
    fileUrl: `https://ruena-storage/${filename}`,
    analysis: { topics: ["Normalization 25%", "SQL 20%", "Joins 15%"] }
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Ruena Backend LIVE: http://localhost:${PORT}`);
  console.log(`📱 UI: http://localhost:${PORT}`);
  console.log(`💾 Data: ruena-data.json`);
});
