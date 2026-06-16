package com.example.demo.controller;

import com.example.demo.entity.WorkoutLog;
import com.example.demo.repository.WorkOutRepository;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.beans.factory.annotation.Autowired;
import java.util.List;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")   // ← これがCORSの本命。これだけでも動く
public class WorkOutController {

    @Autowired
    private WorkOutRepository workoutRepository;

    // GETで全件取得 → フロントの fetchAWSWorkoutData() が叩くエンドポイント
    @GetMapping("/workout")
    public List<WorkoutLog> getAllWorkouts() {
        return workoutRepository.findAll();
    }
}