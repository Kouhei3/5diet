package com.example.demo.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Column;
import lombok.Data;

@Entity
@Table(name = "workout_records") // AWS RDSの「workout_records」テーブルと結びつけます
@Data
public class WorkoutLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // IDを自動で1, 2, 3...と増やします
    private Long id;

    @Column(name = "user_id")
    private Long userId;        // 誰のデータかを見分けるID

    private String date;        // 日付 (例: "2026-06-24")
    
    @Column(name = "body_part")
    private String bodyPart;    // 筋肉の部位 (例: "胸", "脚")

    @Column(name = "exercise_json", columnDefinition = "TEXT")
    private String exerciseJson; // 種目名（JSON形式、または通常のテキストでもOK）

    private Double weight;      // 重量（入力制限：0以上）
    private Integer reps;       // 回数（入力制限：0以上）
}