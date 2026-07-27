package com.example.demo.controller;

import com.example.demo.entity.WorkoutLog;
import com.example.demo.repository.WorkoutLogRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/workouts") // 画面からは「/api/workouts」というURLで通信します
@CrossOrigin(origins = "*")      // フロントエンドのHTMLからのアクセスを許可
public class WorkoutLogController {

    private final WorkoutLogRepository workoutLogRepository;

    // レポジトリをセット（おまじない）
    public WorkoutLogController(WorkoutLogRepository workoutLogRepository) {
        this.workoutLogRepository = workoutLogRepository;
    }

    // 🏋️ 運動データをRDSに保存するAPI（画面の「登録」ボタンで動く）
    @PostMapping
    public WorkoutLog createWorkout(@RequestBody WorkoutLog workoutLog) {
        // 【重要】ログイン機能ができるまでは、一律で「ユーザーID = 1」としてRDSに保存する
        if (workoutLog.getUserId() == null) {
            workoutLog.setUserId(1L); 
        }
        
        // 非機能要件：データ登録は即時DBへ反映
        return workoutLogRepository.save(workoutLog);
    }

    // 🔍 保存された運動データをすべて取得するAPI（カレンダー表示や履歴用）
    @GetMapping
    public List<WorkoutLog> getAllWorkouts() {
        return workoutLogRepository.findAll();
    }
}