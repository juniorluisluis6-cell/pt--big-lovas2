import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import Database from "better-sqlite3";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cors from "cors";
import multer from "multer";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("database.sqlite");
const JWT_SECRET = "big-lova-secret-key-2026";

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'user',
    is_premium INTEGER DEFAULT 0,
    bi_number TEXT,
    birth_date TEXT,
    age INTEGER,
    gender TEXT,
    address TEXT,
    phone TEXT,
    height TEXT,
    mpesa_number TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    type TEXT, -- 'photo' or 'video'
    url TEXT,
    caption TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sender_id INTEGER,
    receiver_id INTEGER,
    content TEXT,
    type TEXT DEFAULT 'text',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(sender_id) REFERENCES users(id),
    FOREIGN KEY(receiver_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    status TEXT DEFAULT 'pending', -- 'pending', 'approved'
    amount REAL,
    method TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );
`);

const app = express();
app.use(cors());
app.use(express.json());

// Auth Middleware
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.status(403).json({ error: "Forbidden" });
    req.user = user;
    next();
  });
};

// --- API ROUTES ---

// Auth
app.get("/api/auth/check-admin", (req, res) => {
  const admin: any = db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'admin'").get();
  res.json({ exists: admin.count > 0 });
});

app.post("/api/auth/register", (req, res) => {
  const { name, email, password, role, bi_number, age, mpesa_number } = req.body;
  try {
    const adminCount: any = db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'admin'").get();
    const finalRole = (adminCount.count === 0 && role === 'admin') ? 'admin' : 'user';
    const isPremium = finalRole === 'admin' ? 1 : 0;

    const hashedPw = bcrypt.hashSync(password, 10);
    const result = db.prepare("INSERT INTO users (name, email, password, role, is_premium, bi_number, age, mpesa_number) VALUES (?, ?, ?, ?, ?, ?, ?, ?)").run(
      name, email, hashedPw, finalRole, isPremium, bi_number || null, age || null, mpesa_number || null
    );
    res.json({ id: result.lastInsertRowid });
  } catch (e: any) {
    console.error(e);
    res.status(400).json({ error: "Email already exists or invalid data" });
  }
});

app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  const user: any = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
  if (user && bcrypt.compareSync(password, user.password)) {
    const token = jwt.sign({ id: user.id, role: user.role, is_premium: user.is_premium }, JWT_SECRET);
    const { password: _, ...userWithoutPassword } = user;
    res.json({ token, user: userWithoutPassword });
  } else {
    res.status(401).json({ error: "Invalid credentials" });
  }
});

// User Profile
app.get("/api/user/me", authenticateToken, (req: any, res) => {
  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(req.user.id);
  res.json(user);
});

// Get Premium Users (for Chat/Ranking)
app.get("/api/users/premium", authenticateToken, (req: any, res) => {
  const users = db.prepare("SELECT id, name, is_premium, created_at FROM users WHERE is_premium = 1").all();
  res.json(users);
});

// Premium Upgrade
app.post("/api/user/premium-request", authenticateToken, (req: any, res) => {
  const { bi_number, birth_date, age, gender, address, phone, height } = req.body;
  db.prepare(`
    UPDATE users SET 
      bi_number = ?, birth_date = ?, age = ?, gender = ?, address = ?, phone = ?, height = ?
    WHERE id = ?
  `).run(bi_number, birth_date, age, gender, address, phone, height, req.user.id);
  
  // Create a pending payment
  db.prepare("INSERT INTO payments (user_id, amount, method) VALUES (?, ?, ?)").run(req.user.id, 500, 'M-Pesa');
  
  res.json({ success: true });
});

// Posts
app.get("/api/posts", (req, res) => {
  const posts = db.prepare(`
    SELECT posts.*, users.name as user_name 
    FROM posts 
    JOIN users ON posts.user_id = users.id 
    ORDER BY created_at DESC
  `).all();
  res.json(posts);
});

app.post("/api/posts", authenticateToken, (req: any, res) => {
  const { type, url, caption } = req.body;
  const user: any = db.prepare("SELECT is_premium FROM users WHERE id = ?").get(req.user.id);
  
  if (!user.is_premium) {
    return res.status(403).json({ error: "Premium membership required to post" });
  }

  const result = db.prepare("INSERT INTO posts (user_id, type, url, caption) VALUES (?, ?, ?, ?)").run(
    req.user.id, type, url, caption
  );
  res.json({ id: result.lastInsertRowid });
});

// Messages
app.get("/api/messages/:otherId", authenticateToken, (req: any, res) => {
  const messages = db.prepare(`
    SELECT * FROM messages 
    WHERE (sender_id = ? AND receiver_id = ?) 
    OR (sender_id = ? AND receiver_id = ?)
    ORDER BY created_at ASC
  `).all(req.user.id, req.params.otherId, req.params.otherId, req.user.id);
  res.json(messages);
});

app.post("/api/messages", authenticateToken, (req: any, res) => {
  const { receiver_id, content, type } = req.body;
  const user: any = db.prepare("SELECT is_premium FROM users WHERE id = ?").get(req.user.id);
  
  if (!user.is_premium) {
    return res.status(403).json({ error: "Premium membership required to chat" });
  }

  const result = db.prepare("INSERT INTO messages (sender_id, receiver_id, content, type) VALUES (?, ?, ?, ?)").run(
    req.user.id, receiver_id, content, type || 'text'
  );
  res.json({ id: result.lastInsertRowid });
});

// Admin M-Pesa Info for Payments
app.get("/api/admin/mpesa-info", (req, res) => {
  const admin: any = db.prepare("SELECT mpesa_number FROM users WHERE role = 'admin' LIMIT 1").get();
  res.json({ mpesa_number: admin?.mpesa_number || null });
});

// Admin Routes
app.get("/api/admin/users", authenticateToken, (req: any, res) => {
  if (req.user.role !== 'admin') return res.sendStatus(403);
  const users = db.prepare("SELECT * FROM users").all();
  res.json(users);
});

app.get("/api/admin/payments", authenticateToken, (req: any, res) => {
  if (req.user.role !== 'admin') return res.sendStatus(403);
  const payments = db.prepare(`
    SELECT payments.*, users.name as user_name 
    FROM payments 
    JOIN users ON payments.user_id = users.id
  `).all();
  res.json(payments);
});

app.post("/api/admin/approve-payment", authenticateToken, (req: any, res) => {
  if (req.user.role !== 'admin') return res.sendStatus(403);
  const { payment_id, user_id } = req.body;
  
  db.transaction(() => {
    db.prepare("UPDATE payments SET status = 'approved' WHERE id = ?").run(payment_id);
    db.prepare("UPDATE users SET is_premium = 1 WHERE id = ?").run(user_id);
  })();
  
  res.json({ success: true });
});

app.post("/api/admin/ban-user", authenticateToken, (req: any, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: "Admin only" });
  const { user_id } = req.body;
  db.prepare("DELETE FROM users WHERE id = ?").run(user_id);
  res.json({ success: true });
});

// API 404 Handler
app.all("/api/*", (req, res) => {
  res.status(404).json({ error: `API route ${req.method} ${req.url} not found` });
});

// --- VITE MIDDLEWARE ---
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  const PORT = 3000;
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
