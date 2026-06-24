package com.example.demo.controller;

import com.example.demo.entity.WorkoutLog;
import com.example.demo.repository.WorkOutRepository;
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
    private WorkOutRepository workoutRepository;

    @Autowired
    private ObjectMapper objectMapper;

    // 1. 筋トレ記録の保存（exercise.htmlから送信されてくる）
    @PostMapping
    public String saveRecord(@RequestBody RecordRequest request) {
        try {
            WorkoutLog log = new WorkoutLog();
            log.setWeight(request.getWeight());
            log.setReps(request.getReps());
            log.setDate(request.getDate());

            String jsonStr = objectMapper.writeValueAsString(request.getExercise());
            log.setExerciseJson(jsonStr);

            workoutRepository.save(log);
            return "{\"status\":\"success\"}";
        } catch (Exception e) {
            e.printStackTrace();
            return "{\"status\":\"error\",\"message\":\"" + e.getMessage() + "\"}";
        }
    }

    // 2. 登録された筋トレ履歴の全件取得（index.htmlのカレンダーに表示する）
    @GetMapping
    public List<Map<String, Object>> getAllRecords() {
        List<WorkoutLog> rawRecords = workoutRepository.findAll();
        List<Map<String, Object>> resultList = new ArrayList<>();

        for (WorkoutLog raw : rawRecords) {
            try {
                Map<String, Object> responseMap = new HashMap<>();
                responseMap.put("id", raw.getId());
                responseMap.put("weight", raw.getWeight());
                responseMap.put("reps", raw.getReps());
                responseMap.put("date", raw.getDate());

                // JSON文字列をマップ（オブジェクト）に戻して格納
                Map<String, Object> exerciseMap = objectMapper.readValue(raw.getExerciseJson(), Map.class);
                responseMap.put("exercise", exerciseMap);

                resultList.add(responseMap);
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
        return resultList;
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