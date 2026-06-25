package com.example.dao;

import com.example.entity.User;
import com.example.util.DBConnection;

import javax.crypto.SecretKeyFactory;
import javax.crypto.spec.PBEKeySpec;
import java.security.NoSuchAlgorithmException;
import java.security.spec.InvalidKeySpecException;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.UUID;

public class UserDao {
    private static final System.Logger LOGGER = System.getLogger(UserDao.class.getName());

    public static class AuthResult {
        public User user;
        public boolean is2faEnabled;
        public String errorMessage;

        public AuthResult(User user, boolean is2faEnabled, String errorMessage) {
            this.user = user;
            this.is2faEnabled = is2faEnabled;
            this.errorMessage = errorMessage;
        }
    }

    public static class ResetInfo {
        public String email;
        public String code;
        public ResetInfo(String email, String code) {
            this.email = email;
            this.code = code;
        }
    }

    public static class RegisterInfo {
        public boolean success;
        public String code;

        public RegisterInfo(boolean success, String code) {
            this.success = success;
            this.code = code;
        }
    }

    public AuthResult authenticate(String username, String password) {
        String sql = "SELECT u.id, u.username, u.password_hash, u.salt, u.is_active, r.role_name " +
                "FROM users u " +
                "JOIN roles r ON u.role_id = r.id " +
                "WHERE u.username = ?";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setString(1, username);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    if (!rs.getBoolean("is_active")) {
                        return new AuthResult(null, false, "このアカウントはまだ認証されていません。メールを確認してください。");
                    }

                    String dbSalt = rs.getString("salt");
                    String dbHash = rs.getString("password_hash");
                    String calculatedHash = hashPassword(password, dbSalt);

                    if (dbHash.equals(calculatedHash)) {
                        User user = new User(rs.getInt("id"), rs.getString("username"), rs.getString("role_name"));
                        return new AuthResult(user, false, null);
                    } else {
                        return new AuthResult(null, false, "ユーザー名またはパスワードが正しくありません。");
                    }
                } else {
                    return new AuthResult(null, false, "ユーザー名またはパスワードが正しくありません。");
                }
            }
        } catch (SQLException e) {
            LOGGER.log(System.Logger.Level.ERROR, "データベースエラーが発生しました。", e);
            return new AuthResult(null, false, "データベースエラーが発生しました。");
        }
    }

    // 新規登録処理（未認証データの上書き許可）
    public RegisterInfo registerUser(String username, String email, String password) {
        String checkSql = "SELECT is_active FROM users WHERE username = ? OR email = ?";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement checkStmt = conn.prepareStatement(checkSql)) {

            checkStmt.setString(1, username);
            checkStmt.setString(2, email);

            try (ResultSet rs = checkStmt.executeQuery()) {
                boolean hasActive = false;
                boolean hasUnverified = false;

                // 既存データの中に本登録済み(is_active=1)があるかチェック
                while (rs.next()) {
                    if (rs.getBoolean("is_active")) {
                        hasActive = true;
                    } else {
                        hasUnverified = true;
                    }
                }

                // 本登録済みのユーザー名またはメールアドレスと衝突した場合は登録不可
                if (hasActive) {
                    return new RegisterInfo(false, null);
                }

                // 仮登録（未認証）のデータだけが存在する場合は、古いデータを削除してやり直せるようにする
                if (hasUnverified) {
                    String deleteSql = "DELETE FROM users WHERE username = ? OR email = ?";
                    try (PreparedStatement deleteStmt = conn.prepareStatement(deleteSql)) {
                        deleteStmt.setString(1, username);
                        deleteStmt.setString(2, email);
                        deleteStmt.executeUpdate();
                    }
                }
            }

            // ここから下は通常のINSERT（登録）処理
            String insertSql = "INSERT INTO users (username, email, password_hash, salt, is_active, role_id, reset_token, token_expires_at) VALUES (?, ?, ?, ?, 0, 1, ?, DATE_ADD(NOW(), INTERVAL 24 HOUR))";
            String salt = UUID.randomUUID().toString().replace("-", "").substring(0, 16);
            String hashedPassword = hashPassword(password, salt);

            String code = String.format("%06d", new java.util.Random().nextInt(1000000));

            try (PreparedStatement insertStmt = conn.prepareStatement(insertSql)) {
                insertStmt.setString(1, username);
                insertStmt.setString(2, email);
                insertStmt.setString(3, hashedPassword);
                insertStmt.setString(4, salt);
                insertStmt.setString(5, code);

                boolean success = insertStmt.executeUpdate() > 0;
                return new RegisterInfo(success, code);
            }
        } catch (SQLException e) {
            LOGGER.log(System.Logger.Level.ERROR, "ユーザー登録中のデータベースエラー", e);
            return new RegisterInfo(false, null);
        }
    }

    public boolean verifyAccount(String username, String code) {
        String checkSql = "SELECT id FROM users WHERE username = ? AND reset_token = ? AND is_active = 0 AND token_expires_at > NOW()";
        String updateSql = "UPDATE users SET is_active = 1, reset_token = NULL, token_expires_at = NULL WHERE id = ?";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement checkStmt = conn.prepareStatement(checkSql)) {

            checkStmt.setString(1, username);
            checkStmt.setString(2, code);

            try (ResultSet rs = checkStmt.executeQuery()) {
                if (rs.next()) {
                    int userId = rs.getInt("id");

                    try (PreparedStatement updateStmt = conn.prepareStatement(updateSql)) {
                        updateStmt.setInt(1, userId);
                        return updateStmt.executeUpdate() > 0;
                    }
                }
            }
        } catch (SQLException e) {
            LOGGER.log(System.Logger.Level.ERROR, "アカウント認証エラー", e);
        }
        return false;
    }

    public ResetInfo createPasswordResetTokenByUsername(String username) {
        String email = null;
        String getEmailSql = "SELECT email FROM users WHERE username = ?";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(getEmailSql)) {
            stmt.setString(1, username);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    email = rs.getString("email");
                }
            }

            if (email == null) return null;

            String code = String.format("%06d", new java.util.Random().nextInt(1000000));
            String updateSql = "UPDATE users SET reset_token = ?, token_expires_at = DATE_ADD(NOW(), INTERVAL 1 HOUR) WHERE username = ?";

            try (PreparedStatement updateStmt = conn.prepareStatement(updateSql)) {
                updateStmt.setString(1, code);
                updateStmt.setString(2, username);
                int rows = updateStmt.executeUpdate();
                return rows > 0 ? new ResetInfo(email, code) : null;
            }
        } catch (SQLException e) {
            LOGGER.log(System.Logger.Level.ERROR, "コード生成エラー", e);
            return null;
        }
    }

    public boolean resetPasswordWithToken(String username, String code, String newPassword) {
        String checkSql = "SELECT id FROM users WHERE username = ? AND reset_token = ? AND token_expires_at > NOW()";
        String updateSql = "UPDATE users SET password_hash = ?, salt = ?, reset_token = NULL, token_expires_at = NULL WHERE id = ?";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement checkStmt = conn.prepareStatement(checkSql)) {

            checkStmt.setString(1, username);
            checkStmt.setString(2, code);

            try (ResultSet rs = checkStmt.executeQuery()) {
                if (rs.next()) {
                    int userId = rs.getInt("id");
                    String newSalt = UUID.randomUUID().toString().replace("-", "").substring(0, 16);
                    String newHash = hashPassword(newPassword, newSalt);

                    try (PreparedStatement updateStmt = conn.prepareStatement(updateSql)) {
                        updateStmt.setString(1, newHash);
                        updateStmt.setString(2, newSalt);
                        updateStmt.setInt(3, userId);
                        return updateStmt.executeUpdate() > 0;
                    }
                }
            }
        } catch (SQLException e) {
            LOGGER.log(System.Logger.Level.ERROR, "パスワードリセットエラー", e);
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