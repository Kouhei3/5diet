package com.example.demo.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import java.time.LocalDate;

@Entity
public class MealRecord {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;
    private Long foodId;
    private Double amountG;
    private String mealType;
    private LocalDate recordDate;

    public MealRecord() {
    }

    public MealRecord(Long userId, Long foodId, Double amountG, String mealType, LocalDate recordDate) {
        this.userId = userId;
        this.foodId = foodId;
        this.amountG = amountG;
        this.mealType = mealType;
        this.recordDate = recordDate;
    }

    public Long getId() {
        return id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public Long getFoodId() {
        return foodId;
    }

    public void setFoodId(Long foodId) {
        this.foodId = foodId;
    }

    public Double getAmountG() {
        return amountG;
    }

    public void setAmountG(Double amountG) {
        this.amountG = amountG;
    }

    public String getMealType() {
        return mealType;
    }

    public void setMealType(String mealType) {
        this.mealType = mealType;
    }

    public LocalDate getRecordDate() {
        return recordDate;
    }

    public void setRecordDate(LocalDate recordDate) {
        this.recordDate = recordDate;
    }
}
