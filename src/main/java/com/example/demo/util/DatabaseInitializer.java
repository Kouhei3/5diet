package com.example.demo.util;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import java.sql.Connection;
import java.sql.Statement;

@Component
public class DatabaseInitializer implements CommandLineRunner {

    @Override
    public void run(String... args) throws Exception {
        try (Connection conn = DBConnection.getConnection();
             Statement stmt = conn.createStatement()) {

            // 1. roles テーブル
            stmt.execute("CREATE TABLE IF NOT EXISTS roles (" +
                         "id INT AUTO_INCREMENT PRIMARY KEY, " +
                         "role_name VARCHAR(50) NOT NULL)");
            stmt.execute("INSERT IGNORE INTO roles (id, role_name) VALUES (1, 'USER')");

            // 2. users テーブル
            stmt.execute("CREATE TABLE IF NOT EXISTS users (" +
                         "id INT AUTO_INCREMENT PRIMARY KEY, " +
                         "username VARCHAR(100) NOT NULL, " +
                         "email VARCHAR(255) NOT NULL, " +
                         "password_hash VARCHAR(255) NOT NULL, " +
                         "salt VARCHAR(50) NOT NULL, " +
                         "is_active TINYINT(1) DEFAULT 1, " +
                         "role_id INT DEFAULT 1, " +
                         "reset_token VARCHAR(100), " +
                         "token_expires_at DATETIME, " +
                         "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)");

            // 3. survey_data テーブル
            stmt.execute("CREATE TABLE IF NOT EXISTS survey_data (" +
                         "id INT AUTO_INCREMENT PRIMARY KEY, " +
                         "user_id INT NOT NULL, " +
                         "gender VARCHAR(10), age INT, height_cm DOUBLE, weight_kg DOUBLE, " +
                         "bmi DOUBLE, goal_weight_kg DOUBLE, goal_date VARCHAR(20), " +
                         "remain_days INT, purpose VARCHAR(100), purpose_other VARCHAR(255), " +
                         "activity_level VARCHAR(50), job_type VARCHAR(50), " +
                         "diet_exp VARCHAR(50), meal_style VARCHAR(50), allergy VARCHAR(255), " +
                         "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, " +
                         "FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE)");
            
            System.out.println("✅ AWS RDS: すべてのテーブルの同期・自動作成が完了しました！");
        } catch (Exception e) {
            System.err.println("❌ AWS RDS テーブル作成失敗: " + e.getMessage());
            e.printStackTrace();
        }
    }
}