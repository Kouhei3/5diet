package com.example.demo.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "workout_records")
@Data
public class WorkoutLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // JavaScriptから送られてくる種目オブジェクトを丸ごと文字列（JSON）で保存
    @Column(columnDefinition = "TEXT")
    private String exerciseJson;

    private Double weight;
    private Integer reps;
    private String date; 
}