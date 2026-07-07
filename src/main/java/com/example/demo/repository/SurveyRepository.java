package com.example.demo.repository;

import com.example.demo.entity.SurveyData;
import com.example.demo.util.DBConnection;

import java.sql.*;

/**
 * アンケートデータの永続化（JDBC）
 * 5DIET – SurveyRepository.java
 */
public class SurveyRepository {

    /* =============================================
       INSERT: アンケートデータを保存
       ============================================= */
    public boolean insert(SurveyData d) {
        String sql = """
            INSERT INTO survey_data (
                gender, age, height_cm, weight_kg, bmi, goal_weight_kg,
                goal_date, remain_days, purpose, purpose_other,
                activity_level, job_type, diet_exp, meal_style, allergy,
                created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
            """;

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setString(1,  d.getGender());
            ps.setInt   (2,  d.getAge());
            ps.setDouble(3,  d.getHeight());
            ps.setDouble(4,  d.getWeight());
            ps.setDouble(5,  d.getBmi());
            ps.setDouble(6,  d.getGoalWeight());
            ps.setString(7,  d.getGoalDate());
            ps.setInt   (8,  d.getRemainDays());
            ps.setString(9,  d.getPurpose());
            ps.setString(10, d.getPurposeOther());   // null OK
            ps.setString(11, d.getActivityLevel());
            ps.setString(12, d.getJobType());
            ps.setString(13, d.getDietExp());
            ps.setString(14, d.getMealStyle());
            ps.setString(15, d.getAllergy());         // null OK

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
