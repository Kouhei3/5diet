package com.example.demo.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime; // 👈 【追加】時間を扱うための部品

@Entity
@Table(name = "meal_records")
@Data
public class MealRecord {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "user_id", nullable = false)
    private Integer userId;

    @ManyToOne
    @JoinColumn(name = "food_id", nullable = false)
    private Food food;

    @Column(name = "amount_g", nullable = false)
    private BigDecimal amountG;

    @Column(name = "meal_type", length = 20, nullable = false)
    private String mealType;

    @Column(name = "record_date", nullable = false)
    private LocalDate recordDate;

    // 👈 【追加】時間を保存する新しい箱
    @Column(name = "meal_time")
    private LocalTime mealTime;

    // 👈 【追加】データベースに保存される直前に、空っぽなら自動で現在の日付・時間を入れる安心設計
    @PrePersist
    public void prePersist() {
        if (this.recordDate == null) {
            this.recordDate = LocalDate.now();
        }
        if (this.mealTime == null) {
            this.mealTime = LocalTime.now();
        }
    }
}