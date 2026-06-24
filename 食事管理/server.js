const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

const db = mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "diet_app",
  port: process.env.DB_PORT || 3306
});

db.connect((err) => {
  if (err) {
    console.log("DB接続失敗", err);
    return;
  }
  console.log("DB接続成功");
});

app.get("/foods", (req, res) => {
  db.query("SELECT * FROM foods", (err, results) => {
    if (err) return res.status(500).json({ message: "食品取得失敗" });
    res.json(results);
  });
});

app.post("/meals", (req, res) => {
  const { user_id, food_id, amount_g, meal_type } = req.body;

  const sql = `
    INSERT INTO meal_records
    (user_id, food_id, amount_g, meal_type, record_date)
    VALUES (?, ?, ?, ?, CURDATE())
  `;

  db.query(sql, [user_id, food_id, amount_g, meal_type], (err) => {
    if (err) return res.status(500).json({ message: "登録失敗" });
    res.json({ message: "登録成功" });
  });
});

app.get("/meals/today/:userId", (req, res) => {
  const userId = req.params.userId;

  const sql = `
    SELECT
      IFNULL(ROUND(SUM(f.calorie_per_100g * m.amount_g / 100),1),0) AS total_calorie,
      IFNULL(ROUND(SUM(f.protein_per_100g * m.amount_g / 100),1),0) AS total_protein,
      IFNULL(ROUND(SUM(f.fat_per_100g * m.amount_g / 100),1),0) AS total_fat,
      IFNULL(ROUND(SUM(f.carbohydrate_per_100g * m.amount_g / 100),1),0) AS total_carbohydrate
    FROM meal_records m
    JOIN foods f ON m.food_id = f.id
    WHERE m.user_id = ?
      AND m.record_date = CURDATE()
  `;

  db.query(sql, [userId], (err, results) => {
    if (err) return res.status(500).json({ message: "集計失敗" });
    res.json(results[0]);
  });
});

app.get("/meals/history/:userId", (req, res) => {
  const userId = req.params.userId;

  const sql = `
    SELECT
      m.id,
      f.food_name,
      m.amount_g,
      m.meal_type,
      ROUND(f.calorie_per_100g * m.amount_g / 100, 1) AS calorie,
      ROUND(f.protein_per_100g * m.amount_g / 100, 1) AS protein,
      ROUND(f.fat_per_100g * m.amount_g / 100, 1) AS fat,
      ROUND(f.carbohydrate_per_100g * m.amount_g / 100, 1) AS carbohydrate
    FROM meal_records m
    JOIN foods f ON m.food_id = f.id
    WHERE m.user_id = ?
      AND m.record_date = CURDATE()
    ORDER BY m.id DESC
  `;

  db.query(sql, [userId], (err, results) => {
    if (err) return res.status(500).json({ message: "履歴取得失敗" });
    res.json(results);
  });
});

app.delete("/meals/:id", (req, res) => {
  const id = req.params.id;

  db.query("DELETE FROM meal_records WHERE id = ?", [id], (err) => {
    if (err) return res.status(500).json({ message: "削除失敗" });
    res.json({ message: "削除成功" });
  });
});

app.listen(3000, () => {
  console.log("http://localhost:3000 で起動中");
});