package com.example.demo.repository;

import com.example.demo.entity.User;
import com.example.demo.util.DBConnection;
import javax.crypto.SecretKeyFactory;
import javax.crypto.spec.PBEKeySpec;
import java.security.NoSuchAlgorithmException;
import java.security.spec.InvalidKeySpecException;
import java.sql.*;
import java.util.UUID;

public class UserDao {
    public static class AuthResult {
        public User user; public boolean is2faEnabled; public String errorMessage;
        public AuthResult(User user, boolean is2faEnabled, String errorMessage) {
            this.user = user; this.is2faEnabled = is2faEnabled; this.errorMessage = errorMessage;
        }
    }
    public static class ResetInfo {
        public String email; public String code;
        public ResetInfo(String email, String code) { this.email = email; this.code = code; }
    }
    public static class RegisterInfo {
        public boolean success; public String code;
        public RegisterInfo(boolean success, String code) { this.success = success; this.code = code; }
    }

    public Integer getIdByUsername(String username) {
        String sql = "SELECT id FROM users WHERE username = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, username);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) return rs.getInt("id");
            }
        } catch (SQLException e) { e.printStackTrace(); }
        return null;
    }

    public RegisterInfo registerUser(String username, String email, String password) {
        String checkSql = "SELECT is_active FROM users WHERE username = ? OR email = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement checkStmt = conn.prepareStatement(checkSql)) {
            checkStmt.setString(1, username); checkStmt.setString(2, email);
            try (ResultSet rs = checkStmt.executeQuery()) {
                if (rs.next()) return new RegisterInfo(false, null);
            }
            String insertSql = "INSERT INTO users (username, email, password_hash, salt, is_active, role_id) VALUES (?, ?, ?, ?, 1, 1)";
            String salt = UUID.randomUUID().toString().replace("-", "").substring(0, 16);
            String hashedPassword = hashPassword(password, salt);

            try (PreparedStatement insertStmt = conn.prepareStatement(insertSql)) {
                insertStmt.setString(1, username); insertStmt.setString(2, email);
                insertStmt.setString(3, hashedPassword); insertStmt.setString(4, salt);
                return new RegisterInfo(insertStmt.executeUpdate() > 0, null);
            }
        } catch (SQLException e) { throw new RuntimeException(e); }
    }

    // ★ 修正: ログイン用の認証を「メールアドレス」で行うように変更しました
    public AuthResult authenticateByEmail(String email, String password) {
        String sql = "SELECT u.id, u.username, u.password_hash, u.salt, u.is_active, r.role_name " +
                     "FROM users u JOIN roles r ON u.role_id = r.id WHERE u.email = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, email);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    String dbSalt = rs.getString("salt");
                    if (rs.getString("password_hash").equals(hashPassword(password, dbSalt))) {
                        return new AuthResult(new User(rs.getInt("id"), rs.getString("username"), rs.getString("role_name")), false, null);
                    }
                }
            }
        } catch (SQLException e) { e.printStackTrace(); }
        return new AuthResult(null, false, "メールアドレスまたはパスワードが正しくありません。");
    }

    // ★ 追加: ログインしたユーザーが「初回診断（アンケート）」を回答済みか確認するメソッド
    public boolean hasCompletedSurvey(int userId) {
        // ※ データベースのテーブル名が 'survey_data' であることを想定しています
        String sql = "SELECT 1 FROM survey_data WHERE user_id = ? LIMIT 1";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, userId);
            try (ResultSet rs = stmt.executeQuery()) {
                return rs.next(); // レコードが存在すれば true (回答済み)
            }
        } catch (SQLException e) { 
            e.printStackTrace(); 
        }
        return false; // レコードが存在しなければ false (未回答)
    }

    public ResetInfo createPasswordResetTokenByEmail(String email) {
        String code = String.format("%06d", new java.security.SecureRandom().nextInt(1000000));
        String updateSql = "UPDATE users SET reset_token = ?, token_expires_at = DATE_ADD(NOW(), INTERVAL 1 HOUR) WHERE email = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement updateStmt = conn.prepareStatement(updateSql)) {
            updateStmt.setString(1, code); 
            updateStmt.setString(2, email);
            
            if (updateStmt.executeUpdate() > 0) {
                return new ResetInfo(email, code);
            }
        } catch (SQLException e) { 
            e.printStackTrace(); 
        }
        return null;
    }

    public boolean resetPasswordWithToken(String email, String code, String newPassword) {
        String checkSql = "SELECT id FROM users WHERE email = ? AND reset_token = ? AND token_expires_at > NOW()";
        String updateSql = "UPDATE users SET password_hash = ?, salt = ?, reset_token = NULL, token_expires_at = NULL WHERE id = ?";
        
        try (Connection conn = DBConnection.getConnection(); 
             PreparedStatement checkStmt = conn.prepareStatement(checkSql)) {
            checkStmt.setString(1, email); 
            checkStmt.setString(2, code);
            
            try (ResultSet rs = checkStmt.executeQuery()) {
                if (rs.next()) {
                    int userId = rs.getInt("id");
                    String newSalt = UUID.randomUUID().toString().replace("-", "").substring(0, 16);
                    
                    try (PreparedStatement updateStmt = conn.prepareStatement(updateSql)) {
                        updateStmt.setString(1, hashPassword(newPassword, newSalt));
                        updateStmt.setString(2, newSalt); 
                        updateStmt.setInt(3, userId);
                        return updateStmt.executeUpdate() > 0;
                    }
                }
            }
        } catch (SQLException e) { 
            e.printStackTrace(); 
        }
        return false;
    }

    private String hashPassword(String password, String salt) {
        try {
            PBEKeySpec spec = new PBEKeySpec(password.toCharArray(), salt.getBytes(), 10000, 256);
            SecretKeyFactory skf = SecretKeyFactory.getInstance("PBKDF2WithHmacSHA256");
            byte[] hash = skf.generateSecret(spec).getEncoded();
            StringBuilder sb = new StringBuilder();
            for (byte b : hash) sb.append(String.format("%02x", b));
            return sb.toString();
        } catch (NoSuchAlgorithmException | InvalidKeySpecException e) { 
            throw new RuntimeException("ハッシュ化エラー", e); 
        }
    }
}