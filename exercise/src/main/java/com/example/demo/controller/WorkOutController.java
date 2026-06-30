package com.example.demo.controller;

import com.example.demo.entity.WorkoutLog;
import com.example.demo.repository.WorkOutRepository;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class WorkOutController {

    private final WorkOutRepository workoutRepository;
    private final JdbcTemplate jdbcTemplate;

    public WorkOutController(WorkOutRepository workoutRepository, JdbcTemplate jdbcTemplate) {
        this.workoutRepository = workoutRepository;
        this.jdbcTemplate = jdbcTemplate;
    }

    @GetMapping("/workout")
    public List<WorkoutLog> getAllWorkouts() {
        return workoutRepository.findAll();
    }

    @GetMapping("/meal")
    public List<Map<String, Object>> getMealData() {
        String sql = """
            SELECT
                mr.record_date,
                mr.meal_type,
                f.food_name,
                mr.amount_g,
                ROUND(f.calorie_per_100g * mr.amount_g / 100, 2) AS calories
            FROM meal_records mr
            JOIN foods f ON mr.food_id = f.id
            ORDER BY mr.record_date, mr.meal_type
            """;

        List<Map<String, Object>> rows = jdbcTemplate.queryForList(sql);
        List<Map<String, Object>> result = new ArrayList<>();

        for (int i = 0; i < rows.size(); i++) {
            Map<String, Object> row = rows.get(i);
            LocalDate recordDate = row.get("record_date") instanceof LocalDate
                ? (LocalDate) row.get("record_date")
                : LocalDate.parse(String.valueOf(row.get("record_date")));

            String mealType = String.valueOf(row.get("meal_type"));
            String foodName = String.valueOf(row.get("food_name"));
            BigDecimal amount = row.get("amount_g") instanceof BigDecimal
                ? (BigDecimal) row.get("amount_g")
                : new BigDecimal(String.valueOf(row.get("amount_g")));
            BigDecimal calories = row.get("calories") instanceof BigDecimal
                ? (BigDecimal) row.get("calories")
                : new BigDecimal(String.valueOf(row.get("calories")));

            String displayTime = switch (mealType) {
                case "朝食" -> "08:00";
                case "昼食" -> "12:30";
                case "夕食" -> "18:30";
                case "間食" -> "15:00";
                default -> "08:00";
            };

            Map<String, Object> event = new LinkedHashMap<>();
            event.put("id", "aws_meal_" + row.get("id"));
            event.put("date", recordDate.toString());
            event.put("time", displayTime);
            event.put("title", foodName + " " + amount.stripTrailingZeros().toPlainString() + "g（" + calories.stripTrailingZeros().toPlainString() + "kcal）");
            result.add(event);
        }

        return result;
    }

    @GetMapping("/workout-menu")
    public List<Map<String, Object>> getWorkoutMenuData() {
        return workoutRepository.findAll().stream().map(log -> {
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("id", "aws_workout_" + log.getId());
            item.put("date", log.getDate() != null ? log.getDate().toLocalDate().toString() : LocalDate.now().toString());
            item.put("time", log.getDate() != null ? log.getDate().toLocalTime().toString() : "08:00");
            item.put("title", (log.getExerciseName() != null ? log.getExerciseName() : "筋トレ") + " " + (log.getReps() != null ? log.getReps() : 0) + "回");
            return item;
        }).collect(Collectors.toList());
    }
}