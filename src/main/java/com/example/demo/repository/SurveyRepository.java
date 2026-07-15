package com.example.demo.repository;

import com.example.demo.entity.SurveyData;
import com.example.demo.util.DBConnection;

import java.sql.*;

public class SurveyRepository {

    /* =============================================
       INSERT: アンケートデータを保存
       ============================================= */
    public boolean insert(SurveyData d) {

    String sql = """
        INSERT INTO survey_data (
            user_id,
            gender, age, height_cm, weight_kg, bmi, goal_weight_kg,
            goal_date, remain_days, purpose, purpose_other,
            activity_level, job_type, diet_exp, meal_style, allergy,
            created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
        """;

    try (Connection conn = DBConnection.getConnection();
         PreparedStatement ps = conn.prepareStatement(sql)) {

        ps.setInt(1, d.getUserId());
        ps.setString(2, d.getGender());
        ps.setInt(3, d.getAge());
        ps.setDouble(4, d.getHeight());
        ps.setDouble(5, d.getWeight());
        ps.setDouble(6, d.getBmi());
        ps.setDouble(7, d.getGoalWeight());
        ps.setString(8, d.getGoalDate());
        ps.setInt(9, d.getRemainDays());
        ps.setString(10, d.getPurpose());
        ps.setString(11, d.getPurposeOther());
        ps.setString(12, d.getActivityLevel());
        ps.setString(13, d.getJobType());
        ps.setString(14, d.getDietExp());
        ps.setString(15, d.getMealStyle());
        ps.setString(16, d.getAllergy());

        return ps.executeUpdate() > 0;

    } catch (SQLException e) {
        e.printStackTrace();
        return false;
    }
}
    /* =============================================
       UPDATE: 体重と BMI を更新
       ============================================= */
    public boolean update(SurveyData d, int userId) {
        String sql = """
            UPDATE survey_data SET
                weight_kg = ?,
                bmi = ?
            WHERE user_id = ?
            """;

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setDouble(1, d.getWeight());
            ps.setDouble(2, d.getBmi());
            ps.setInt(3, userId);

            return ps.executeUpdate() > 0;

        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }

    /* =============================================
       SELECT: ユーザーIDでアンケート取得
       ============================================= */
    public SurveyData findByUserId(int userId) {
        String sql = "SELECT * FROM survey_data WHERE user_id = ? ORDER BY created_at DESC LIMIT 1";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, userId);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return mapRow(rs);
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return null;
    }

    /* =============================================
       ResultSet → SurveyData マッピング
       ============================================= */
    private SurveyData mapRow(ResultSet rs) throws SQLException {
        SurveyData d = new SurveyData();
        d.setGender       (rs.getString("gender"));
        d.setAge          (rs.getInt("age"));
        d.setHeight       (rs.getDouble("height_cm"));
        d.setWeight       (rs.getDouble("weight_kg"));
        d.setBmi          (rs.getDouble("bmi"));
        d.setGoalWeight   (rs.getDouble("goal_weight_kg"));
        d.setGoalDate     (rs.getString("goal_date"));
        d.setRemainDays   (rs.getInt("remain_days"));
        d.setPurpose      (rs.getString("purpose"));
        d.setPurposeOther (rs.getString("purpose_other"));
        d.setActivityLevel(rs.getString("activity_level"));
        d.setJobType      (rs.getString("job_type"));
        d.setDietExp      (rs.getString("diet_exp"));
        d.setMealStyle    (rs.getString("meal_style"));
        d.setAllergy      (rs.getString("allergy"));
        return d;
    }
}
