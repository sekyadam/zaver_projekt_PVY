const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

// Připojení k MySQL
const db = mysql.createPool({
    host: "https://mysqlstudenti.litv.sssvt.cz/",
    user: "sekyrkaadam",
    password: "123456",       // HESLO
    database: "4c2_sekyrkaadam_db1" 
});

// Upload obrázků
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/");
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + "-" + file.originalname);
    }
});
const upload = multer({ storage: storage });


function auth(req, res, next) {
    const header = req.headers.authorization;
    if (!header) {
        res.status(401).json({ error: "Missing token" });
        return;
    }

    const token = header.split(" ")[1];

    try {
        const decoded = jwt.verify(token, "tajnyklic");
        req.user = decoded;
        next();
    } catch (e) {
        res.status(401).json({ error: "Invalid token" });
    }
}

//registration

app.post("/api/register", upload.single("photo"), async function (req, res) {
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;
    const age = parseInt(req.body.age);
    const gender = req.body.gender;
    const username = req.body.username;
    const password = req.body.password;

    if (age < 13) {
        res.status(400).json({ error: "Musíš mít alespoň 13 let" });
        return;
    }

    const hash = await bcrypt.hash(password, 10);
    const photoPath = req.file ? "/uploads/" + req.file.filename : null;

    await db.query(
        "INSERT INTO Users (FirstName, LastName, Age, Gender, Username, PasswordHash, PhotoPath) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [firstName, lastName, age, gender, username, hash, photoPath]
    );

    res.json({ success: true });
});

//login

app.post("/api/login", async function (req, res) {
    const username = req.body.username;
    const password = req.body.password;

    const [rows] = await db.query("SELECT * FROM Users WHERE Username = ?", [username]);

    if (rows.length === 0) {
        res.status(400).json({ error: "Invalid credentials" });
        return;
    }

    const user = rows[0];
    const match = await bcrypt.compare(password, user.PasswordHash);

    if (!match) {
        res.status(400).json({ error: "Invalid credentials" });
        return;
    }

    const token = jwt.sign({ id: user.Id }, "tajnyklic", { expiresIn: "7d" });

    res.json({ token: token });
});


app.get("/api/posts", auth, async function (req, res) {
    const [rows] = await db.query(`
        SELECT p.*, 
               u.FirstName AS authorFirstName,
               u.LastName AS authorLastName,
               u.PhotoPath AS authorPhotoPath,
               (SELECT COUNT(*) FROM Likes WHERE PostId = p.Id) AS likesCount
        FROM Posts p
        JOIN Users u ON u.Id = p.UserId
        ORDER BY p.CreatedAt DESC
    `);

    res.json(rows);
});

app.post("/api/posts", auth, upload.single("image"), async function (req, res) {
    const title = req.body.title;
    const text = req.body.text;
    const imagePath = req.file ? "/uploads/" + req.file.filename : null;

    await db.query(
        "INSERT INTO Posts (UserId, Title, Text, ImagePath) VALUES (?, ?, ?, ?)",
        [req.user.id, title, text, imagePath]
    );

    res.json({ success: true });
});


app.post("/api/posts/:id/like", auth, async function (req, res) {
    const postId = req.params.id;

    try {
        await db.query("INSERT INTO Likes (UserId, PostId) VALUES (?, ?)", [
            req.user.id,
            postId
        ]);
        res.json({ success: true });
    } catch (e) {
        res.status(400).json({ error: "Already liked" });
    }
});

app.delete("/api/posts/:id/like", auth, async function (req, res) {
    const postId = req.params.id;

    await db.query("DELETE FROM Likes WHERE UserId = ? AND PostId = ?", [
        req.user.id,
        postId
    ]);

    res.json({ success: true });
});

app.get("/api/posts/:id/likes", auth, async function (req, res) {
    const postId = req.params.id;

    const [rows] = await db.query(
        `SELECT l.*, u.FirstName, u.LastName
         FROM Likes l
         JOIN Users u ON u.Id = l.UserId
         WHERE l.PostId = ?
         ORDER BY l.CreatedAt DESC`,
        [postId]
    );

    res.json(rows);
});


app.get("/api/posts/:id/comments", auth, async function (req, res) {
    const postId = req.params.id;

    const [rows] = await db.query(
        `SELECT c.*, u.FirstName AS authorFirstName, u.LastName AS authorLastName
         FROM Comments c
         JOIN Users u ON u.Id = c.UserId
         WHERE c.PostId = ?
         ORDER BY c.CreatedAt DESC`,
        [postId]
    );

    res.json(rows);
});

app.post("/api/posts/:id/comments", auth, async function (req, res) {
    const postId = req.params.id;
    const text = req.body.text;

    await db.query(
        "INSERT INTO Comments (UserId, PostId, Text) VALUES (?, ?, ?)",
        [req.user.id, postId, text]
    );

    res.json({ success: true });
});

//users

app.get("/api/users", auth, async function (req, res) {
    const [rows] = await db.query(`
        SELECT u.*,
               (SELECT COUNT(*) FROM Posts WHERE UserId = u.Id) AS postsCount
        FROM Users u
        ORDER BY u.LastName ASC
    `);

    res.json(rows);
});

app.get("/api/users/:id", auth, async function (req, res) {
    const userId = req.params.id;

    const [[user]] = await db.query("SELECT * FROM Users WHERE Id = ?", [userId]);

    const [posts] = await db.query(
        `SELECT p.*, (SELECT COUNT(*) FROM Likes WHERE PostId = p.Id) AS likesCount
         FROM Posts p
         WHERE p.UserId = ?
         ORDER BY p.CreatedAt DESC`,
        [userId]
    );

    const [activity] = await db.query(
        `SELECT DISTINCT p.*, (SELECT COUNT(*) FROM Likes WHERE PostId = p.Id) AS likesCount
         FROM Posts p
         LEFT JOIN Likes l ON l.PostId = p.Id
         LEFT JOIN Comments c ON c.PostId = p.Id
         WHERE l.UserId = ? OR c.UserId = ?
         ORDER BY p.CreatedAt DESC`,
        [userId, userId]
    );

    res.json({
        user: user,
        posts: posts,
        activityPosts: activity
    });
});



app.listen(3000, function () {
    console.log("Server běží na http://localhost:3000");
});
