package com.example.demo.controller;

import com.example.demo.entity.WorkoutLog;
import com.example.demo.repository.WorkoutLogRepository; 
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.Data;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/records")
@CrossOrigin(origins = "*")
public class ExerciseController {

    @Autowired
    private WorkoutLogRepository workoutLogRepository; 

    @Autowired
    private ObjectMapper objectMapper;

    // 1. 記録の保存
    @PostMapping
    public String saveRecord(@RequestBody RecordRequest request) {
        try {
            WorkoutLog log = new WorkoutLog();
            log.setWeight(request.getWeight());
            log.setReps(request.getReps());
            log.setDate(request.getDate());

            String jsonStr = objectMapper.writeValueAsString(request.getExercise());
            log.setExerciseJson(jsonStr);

            workoutLogRepository.save(log);
            return "{\"status\":\"success\"}";
        } catch (Exception e) {
            e.printStackTrace();
            return "{\"status\":\"error\",\"message\":\"" + e.getMessage() + "\"}";
        }
    }

    // 2. 全件取得
    @GetMapping
    public List<Map<String, Object>> getAllRecords() {
        List<WorkoutLog> rawRecords = workoutLogRepository.findAll();
        List<Map<String, Object>> resultList = new ArrayList<>();

        for (WorkoutLog raw : rawRecords) {
            try {
                Map<String, Object> responseMap = new HashMap<>();
                responseMap.put("id", raw.getId());
                responseMap.put("weight", raw.getWeight());
                responseMap.put("reps", raw.getReps());
                responseMap.put("date", raw.getDate());

                Map<String, Object> exerciseMap = objectMapper.readValue(raw.getExerciseJson(), Map.class);
                responseMap.put("exercise", exerciseMap);

                resultList.add(responseMap);
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
        return resultList;
    }

    // 3. 筋トレ記録の削除（ゴミ箱ボタンが押されたときに呼ばれる）
    @DeleteMapping("/{id}")
    public String deleteRecord(@PathVariable Long id) {
        try {
            // データベースから指定されたIDの記録を完全に削除する
            workoutLogRepository.deleteById(id);
            return "{\"status\":\"success\"}";
        } catch (Exception e) {
            e.printStackTrace();
            return "{\"status\":\"error\",\"message\":\"" + e.getMessage() + "\"}";
        }
    }
}

// 通信データ受取用構造体 (DTO)
@Data
class RecordRequest {
    private Map<String, Object> exercise;
    private Double weight;
    private Integer reps;
    private String date;
}