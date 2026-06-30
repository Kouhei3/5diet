package com.example.demo.controller;

import com.example.demo.entity.MealRecord;
import com.example.demo.repository.MealRecordRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/meals")
@CrossOrigin(origins = "*")
public class MealController {

    private final MealRecordRepository mealRecordRepository;
    private final JdbcTemplate jdbcTemplate; // 追加: JOINクエリ用

    public MealController(MealRecordRepository mealRecordRepository, JdbcTemplate jdbcTemplate) {
        this.mealRecordRepository = mealRecordRepository;
        this.jdbcTemplate = jdbcTemplate;
    }

    // ────────────────────────────────────────────────
    // POST /meals  ← mealScript.js の addMeal() から呼ばれる
    // ────────────────────────────────────────────────
    @PostMapping
    public ResponseEntity<Map<String, Object>> saveMeal(@RequestBody Map<String, Object> payload) {
        try {
            Long userId  = ((Number) payload.getOrDefault("user_id",  1)).longValue();
            Long foodId  = ((Number) payload.getOrDefault("food_id",  0)).longValue();
            Double amountG = ((Number) payload.getOrDefault("amount_g", 0)).doubleValue();
            String mealType = String.valueOf(payload.getOrDefault("meal_type", "朝食"));

            MealRecord record = new MealRecord(userId, foodId, amountG, mealType, LocalDate.now());
            mealRecordRepository.save(record);

            Map<String, Object> response = new LinkedHashMap<>();
            response.put("message", "登録成功");
            response.put("id", record.getId());
            return ResponseEntity.ok(response);
        } catch (Exception ex) {
            Map<String, Object> response = new LinkedHashMap<>();
            response.put("message", "登録失敗");
            response.put("error", ex.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    // ────────────────────────────────────────────────
    // GET /meals/today/{userId}  ← mealScript.js の loadTodayMeals() から呼ばれる
    // 修正前: 固定値0を返すだけ
    // 修正後: meal_records × foods を JOIN して当日分を集計
    // ────────────────────────────────────────────────
    @GetMapping("/today/{userId}")
    public ResponseEntity<Map<String, Object>> getTodaySummary(@PathVariable Long userId) {
        String sql = """
            SELECT
                IFNULL(ROUND(SUM(f.calorie_per_100g      * mr.amount_g / 100), 1), 0) AS total_calorie,
                IFNULL(ROUND(SUM(f.protein_per_100g      * mr.amount_g / 100), 1), 0) AS total_protein,
                IFNULL(ROUND(SUM(f.fat_per_100g          * mr.amount_g / 100), 1), 0) AS total_fat,
                IFNULL(ROUND(SUM(f.carbohydrate_per_100g * mr.amount_g / 100), 1), 0) AS total_carbohydrate
            FROM meal_records mr
            JOIN foods f ON mr.food_id = f.id
            WHERE mr.user_id = ?
              AND mr.record_date = CURDATE()
            """;

        Map<String, Object> row = jdbcTemplate.queryForMap(sql, userId);

        // キー名はmealScript.jsが期待する名前に合わせる
        Map<String, Object> summary = new LinkedHashMap<>();
        summary.put("total_calorie",      row.get("total_calorie"));
        summary.put("total_protein",      row.get("total_protein"));
        summary.put("total_fat",          row.get("total_fat"));
        summary.put("total_carbohydrate", row.get("total_carbohydrate"));

        return ResponseEntity.ok(summary);
    }

    // ────────────────────────────────────────────────
    // GET /meals/history/{userId}  ← mealScript.js の loadMealHistory() から呼ばれる
    // 修正前: 空リストを返すだけ
    // 修正後: 当日の食事履歴を1件ずつ返す（カロリー・PFC付き）
    // ────────────────────────────────────────────────
    @GetMapping("/history/{userId}")
    public ResponseEntity<List<Map<String, Object>>> getHistory(@PathVariable Long userId) {
        String sql = """
            SELECT
                mr.id,
                f.food_name,
                mr.amount_g,
                mr.meal_type,
                ROUND(f.calorie_per_100g      * mr.amount_g / 100, 1) AS calorie,
                ROUND(f.protein_per_100g      * mr.amount_g / 100, 1) AS protein,
                ROUND(f.fat_per_100g          * mr.amount_g / 100, 1) AS fat,
                ROUND(f.carbohydrate_per_100g * mr.amount_g / 100, 1) AS carbohydrate
            FROM meal_records mr
            JOIN foods f ON mr.food_id = f.id
            WHERE mr.user_id = ?
              AND mr.record_date = CURDATE()
            ORDER BY mr.id DESC
            """;

        List<Map<String, Object>> rows = jdbcTemplate.queryForList(sql, userId);

        // mealScript.js の loadMealHistory() が参照するキー名に揃える
        List<Map<String, Object>> result = rows.stream().map(row -> {
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("id",           row.get("id"));
            item.put("food_name",    row.get("food_name"));
            item.put("amount_g",     row.get("amount_g"));
            item.put("meal_type",    row.get("meal_type"));
            item.put("calorie",      row.get("calorie"));
            item.put("protein",      row.get("protein"));
            item.put("fat",          row.get("fat"));
            item.put("carbohydrate", row.get("carbohydrate"));
            return item;
        }).toList();

        return ResponseEntity.ok(result);
    }

    // ────────────────────────────────────────────────
    // DELETE /meals/{id}  ← mealScript.js の deleteMeal() から呼ばれる
    // ────────────────────────────────────────────────
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteMeal(@PathVariable Long id) {
        mealRecordRepository.deleteById(id);
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("message", "削除成功");
        return ResponseEntity.ok(response);
    }
}