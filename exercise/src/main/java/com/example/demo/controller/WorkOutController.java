package com.example.demo.controller;

import com.example.demo.entity.WorkoutLog;
import com.example.demo.repository.WorkOutRepository;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class WorkOutController {

    private final WorkOutRepository workoutRepository;

    public WorkOutController(WorkOutRepository workoutRepository) {
        this.workoutRepository = workoutRepository;
    }

    @GetMapping("/workout")
    public List<WorkoutLog> getAllWorkouts() {
        return workoutRepository.findAll();
    }

    @GetMapping("/meal")
    public List<Map<String, Object>> getMealData() {
        return List.of(
            Map.of(
                "id", 1,
                "date", "2026-06-18",
                "time", "12:15",
                "title", "胸肉とブロッコリー(400kcal)"
            ),
            Map.of(
                "id", 2,
                "date", "2026-06-19",
                "time", "18:30",
                "title", "鶏むね肉サラダ"
            )
        );
    }

    @GetMapping("/workout-menu")
    public List<Map<String, Object>> getWorkoutMenuData() {
        return List.of(
            Map.of(
                "id", 1,
                "date", "2026-06-18",
                "time", "18:30",
                "title", "ベンチプレス 3セット"
            ),
            Map.of(
                "id", 2,
                "date", "2026-06-19",
                "time", "07:00",
                "title", "ランニング 30分"
            )
        );
    }
}