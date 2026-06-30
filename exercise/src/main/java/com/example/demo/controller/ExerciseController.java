package com.example.demo.controller;

import org.springframework.web.bind.annotation.*;
import com.example.demo.entity.WorkoutLog;
import com.example.demo.repository.WorkOutRepository;

import java.time.LocalDateTime;
import java.time.ZonedDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/records")
@CrossOrigin(origins = "*") 
public class ExerciseController {

    // 相方さんのリポジトリを使えるように準備
    private final WorkOutRepository workoutRepository;

    // コンストラクタで相方さんのリポジトリを受け取る
    public ExerciseController(WorkOutRepository workoutRepository) {
        this.workoutRepository = workoutRepository;
    }

    // フロントエンド(JS)の送信データ構造に完全に一致させたDTOクラス
    public static class RecordRequest {
        public ExerciseInner exercise;
        public double weight;
        public int reps;
        public String date;

        public static class ExerciseInner {
            public String name;
            public String category;
            public String type;
            public String level;
            public String desc;
        }
    }

    @GetMapping
    public List<Map<String, Object>> getAllRecords() {
        return workoutRepository.findAll().stream().map(log -> {
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("id", log.getId());
            item.put("date", log.getDate() != null ? log.getDate().toLocalDate().toString() : null);
            item.put("time", log.getDate() != null ? log.getDate().toLocalTime().toString() : "08:00");
            item.put("title", (log.getExerciseName() != null ? log.getExerciseName() : "筋トレ") + " " + (log.getReps() != null ? log.getReps() : 0) + "回");
            item.put("exercise", Map.of(
                "name", log.getExerciseName(),
                "type", log.getExerciseType(),
                "reps", log.getReps(),
                "weight", log.getWeight()
            ));
            item.put("reps", log.getReps());
            item.put("weight", log.getWeight());
            return item;
        }).toList();
    }

    @DeleteMapping("/{id}")
    public String deleteRecord(@PathVariable Long id) {
        workoutRepository.deleteById(id);
        return "削除成功";
    }

    // POSTリクエストを受け取って保存処理をする
    @PostMapping
    public String saveRecord(@RequestBody RecordRequest request) {
        System.out.println("====== ワークアウト記録を受信 ======");
        
        // 1. 相方さんの用意した保存用クラス（WorkoutLog）を新しく作る
        WorkoutLog log = new WorkoutLog();
        
        // 2. あなたの画面から届いたデータを、相方さんのクラスのポケットにそのまま詰め替える
        if (request.exercise != null) {
            System.out.println("種目名: " + request.exercise.name);
            log.setExerciseName(request.exercise.name); // 相方さんのポケットに種目名をセット
            log.setExerciseType(request.exercise.type); // "weight" または "bodyweight" をセット
        }
        
        log.setWeight(request.weight); // 重量をセット
        log.setReps(request.reps);     // 回数をセット
        
        // 3. 日時（String型からLocalDateTime型への変換処理）
        if (request.date != null) {
            try {
                // JSの ISOString (例: 2026-06-18T11:24:25.000Z) をJavaの日時に変換
                ZonedDateTime parsedZone = ZonedDateTime.parse(request.date);
                LocalDateTime localDateTime = parsedZone.toLocalDateTime();
                log.setDate(localDateTime);
            } catch (Exception e) {
                // 万が一変換に失敗した場合は、現在のシステム日時をフォールバックとしてセット
                log.setDate(LocalDateTime.now());
            }
        } else {
            log.setDate(LocalDateTime.now());
        }
        
        System.out.println("重量  : " + request.weight + " kg");
        System.out.println("回数  : " + request.reps + " 回");
        System.out.println("日時  : " + request.date);
        System.out.println("====================================");

        // 4. 相方さんのリポジトリを使ってAWSのデータベースに完全保存！
        workoutRepository.save(log);

        return "保存成功";
    }
}