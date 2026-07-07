package com.example.demo.controller;

import com.example.demo.entity.Food;
import com.example.demo.entity.MealRecord;
import com.example.demo.repository.FoodRepository;
import com.example.demo.repository.MealRecordRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@CrossOrigin(origins = "*")
public class MealController {

    @Autowired
    private FoodRepository foodRepository;

    @Autowired
    private MealRecordRepository mealRecordRepository;

    // Java起動時に自動で指定の15品目をデータベースに登録する処理
    @PostConstruct
    public void initDefaultFoods() {
        try {
            if (foodRepository.count() == 0) {
                String[] names = {
                    "鶏むね肉", "鶏もも肉", "サラダチキン", "白米", "卵", 
                    "鮭", "まぐろ赤身", "豆腐", "納豆", "ブロッコリー", 
                    "レタス", "トマト", "豚ロース", "牛もも肉", "パスタ"
                };
                double[][] nutrition = {
                    {108, 23.3, 1.9, 0}, {190, 16.6, 14.2, 0}, {115, 24.0, 1.5, 0}, {156, 2.5, 0.3, 37.1}, {151, 12.3, 10.3, 0.3},
                    {124, 22.3, 4.1, 0.1}, {115, 26.4, 1.4, 0.1}, {56, 5.3, 3.5, 2.0}, {190, 16.5, 10.0, 12.1}, {37, 4.3, 0.5, 6.6},
                    {12, 0.6, 0.1, 2.8}, {20, 0.7, 0.1, 4.7}, {263, 19.3, 19.2, 0.2}, {176, 21.2, 9.6, 0.5}, {150, 5.8, 0.9, 31.0}
                };

                for (int i = 0; i < names.length; i++) {
                    Food food = new Food();
                    food.setFoodName(names[i]);
                    food.setCaloriePer100g(BigDecimal.valueOf(nutrition[i][0]));
                    food.setProteinPer100g(BigDecimal.valueOf(nutrition[i][1]));
                    food.setFatPer100g(BigDecimal.valueOf(nutrition[i][2]));
                    food.setCarbohydratePer100g(BigDecimal.valueOf(nutrition[i][3]));
                    foodRepository.save(food);
                }
                System.out.println("🌱 [System] デフォルトの食品データ15品目をRDSに自動登録しました！");
            }
        } catch (Exception e) {
            System.err.println("⚠️ デフォルトデータの自動登録中にエラーが発生しました: " + e.getMessage());
        }
    }

    // 1. 全食品マスタの取得
    @GetMapping("/foods")
    public List<Map<String, Object>> getAllFoods() {
        return foodRepository.findAll().stream().map(food -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", food.getId());
            map.put("food_name", food.getFoodName());
            map.put("calorie_per_100g", food.getCaloriePer100g());
            map.put("protein_per_100g", food.getProteinPer100g());
            map.put("fat_per_100g", food.getFatPer100g());
            map.put("carbohydrate_per_100g", food.getCarbohydratePer100g());
            return map;
        }).collect(Collectors.toList());
    }

    // 2. 新しい食事記録の登録
    @PostMapping("/meals")
    public Map<String, String> addMeal(@RequestBody Map<String, Object> payload) {
        Integer userId = (Integer) payload.get("user_id");
        Integer foodId = (Integer) payload.get("food_id");
        Double amountG = Double.parseDouble(payload.get("amount_g").toString());
        String mealType = (String) payload.get("meal_type");

        Food food = foodRepository.findById(foodId)
                .orElseThrow(() -> new RuntimeException("指定された食品が見つかりません。ID: " + foodId));

        MealRecord record = new MealRecord();
        record.setUserId(userId);
        record.setFood(food);
        record.setAmountG(BigDecimal.valueOf(amountG));
        record.setMealType(mealType);
        record.setRecordDate(LocalDate.now());

        mealRecordRepository.save(record);

        Map<String, String> response = new HashMap<>();
        response.put("message", "登録成功");
        return response;
    }

    // 3. 今日の摂取カロリー・PFCの集計取得
    @GetMapping("/meals/today/{userId}")
    public Map<String, Object> getTodaySummary(@PathVariable Integer userId) {
        List<MealRecord> records = mealRecordRepository.findByUserIdAndRecordDateOrderByIdDesc(userId, LocalDate.now());

        BigDecimal totalCal = BigDecimal.ZERO;
        BigDecimal totalProtein = BigDecimal.ZERO;
        BigDecimal totalFat = BigDecimal.ZERO;
        BigDecimal totalCarb = BigDecimal.ZERO;

        for (MealRecord r : records) {
            BigDecimal factor = r.getAmountG().divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP);
            totalCal = totalCal.add(r.getFood().getCaloriePer100g().multiply(factor));
            totalProtein = totalProtein.add(r.getFood().getProteinPer100g().multiply(factor));
            totalFat = totalFat.add(r.getFood().getFatPer100g().multiply(factor));
            totalCarb = totalCarb.add(r.getFood().getCarbohydratePer100g().multiply(factor));
        }

        Map<String, Object> summary = new HashMap<>();
        summary.put("total_calorie", totalCal.setScale(1, RoundingMode.HALF_UP));
        summary.put("total_protein", totalProtein.setScale(1, RoundingMode.HALF_UP));
        summary.put("total_fat", totalFat.setScale(1, RoundingMode.HALF_UP));
        summary.put("total_carbohydrate", totalCarb.setScale(1, RoundingMode.HALF_UP));
        return summary;
    }

    // 4. 今日の食事履歴リストの取得
    @GetMapping("/meals/history/{userId}")
    public List<Map<String, Object>> getMealHistory(@PathVariable Integer userId) {
        List<MealRecord> records = mealRecordRepository.findByUserIdAndRecordDateOrderByIdDesc(userId, LocalDate.now());

        return records.stream().map(r -> {
            BigDecimal factor = r.getAmountG().divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP);
            Map<String, Object> map = new HashMap<>();
            map.put("id", r.getId());
            map.put("food_name", r.getFood().getFoodName());
            map.put("amount_g", r.getAmountG());
            map.put("meal_type", r.getMealType());
            map.put("calorie", r.getFood().getCaloriePer100g().multiply(factor).setScale(1, RoundingMode.HALF_UP));
            map.put("protein", r.getFood().getProteinPer100g().multiply(factor).setScale(1, RoundingMode.HALF_UP));
            map.put("fat", r.getFood().getFatPer100g().multiply(factor).setScale(1, RoundingMode.HALF_UP));
            map.put("carbohydrate", r.getFood().getCarbohydratePer100g().multiply(factor).setScale(1, RoundingMode.HALF_UP));
            return map;
        }).collect(Collectors.toList());
    }

    // 5. 食事履歴の削除
    @DeleteMapping("/meals/{id}")
    public Map<String, String> deleteMeal(@PathVariable Integer id) {
        mealRecordRepository.deleteById(id);
        Map<String, String> response = new HashMap<>();
        response.put("message", "削除成功");
        return response;
    }
}