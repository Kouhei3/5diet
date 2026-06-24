CREATE DATABASE IF NOT EXISTS diet_app
CHARACTER SET utf8mb4
COLLATE utf8mb4_general_ci;

USE diet_app;

DROP TABLE IF EXISTS meal_records;
DROP TABLE IF EXISTS foods;

CREATE TABLE foods (
  id INT AUTO_INCREMENT PRIMARY KEY,
  food_name VARCHAR(100) NOT NULL,
  calorie_per_100g DECIMAL(6,2) NOT NULL,
  protein_per_100g DECIMAL(6,2) NOT NULL,
  fat_per_100g DECIMAL(6,2) NOT NULL,
  carbohydrate_per_100g DECIMAL(6,2) NOT NULL
);

CREATE TABLE meal_records (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  food_id INT NOT NULL,
  amount_g DECIMAL(6,2) NOT NULL,
  meal_type VARCHAR(20) NOT NULL,
  record_date DATE NOT NULL,
  FOREIGN KEY (food_id) REFERENCES foods(id)
);

INSERT INTO foods
(food_name, calorie_per_100g, protein_per_100g, fat_per_100g, carbohydrate_per_100g)
VALUES
('白米',156,2.5,0.3,37.1),
('卵',151,12.3,10.3,0.3),
('サラダチキン',115,24.0,1.5,0),
('食パン',248,8.4,4.1,46.7),
('鶏むね肉',108,23.3,1.9,0),
('うどん',95,2.6,0.4,21.6),
('パスタ',150,5.8,0.9,31.0),
('そば',114,4.8,0.7,24.0),
('じゃがいも',76,1.6,0.1,17.6),
('鶏もも肉',190,16.6,14.2,0),
('豚ロース',263,19.3,19.2,0.2),
('牛もも肉',176,21.2,9.6,0.5),
('鮭',124,22.3,4.1,0.1),
('まぐろ赤身',115,26.4,1.4,0.1),
('豆腐',56,5.3,3.5,2.0),
('納豆',190,16.5,10.0,12.1),
('ブロッコリー',37,4.3,0.5,6.6),
('レタス',12,0.6,0.1,2.8),
('トマト',20,0.7,0.1,4.7),
('キャベツ',23,1.3,0.2,5.2),
('牛乳',61,3.3,3.8,4.8),
('ヨーグルト',56,3.6,3.0,4.9),
('プロテイン飲料',100,15.0,1.0,8.0),
('鮭おにぎり',180,4.0,2.0,37.0),
('ツナマヨおにぎり',245,5.0,8.0,38.0),
('ゆで卵',151,12.3,10.3,0.3),
('からあげ',290,18.0,20.0,14.0),
('カップ麺',450,10.0,18.0,60.0),
('メロンパン',366,8.0,10.0,60.0),
('ポテトチップス',554,4.7,35.2,54.7);