package com.example.demo.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;

@Entity
@Table(name = "foods")
@Data
public class Food {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "food_name", length = 100, nullable = false)
    private String foodName;

    @Column(name = "calorie_per_100g", nullable = false)
    private BigDecimal caloriePer100g;

    @Column(name = "protein_per_100g", nullable = false)
    private BigDecimal proteinPer100g;

    @Column(name = "fat_per_100g", nullable = false)
    private BigDecimal fatPer100g;

    @Column(name = "carbohydrate_per_100g", nullable = false)
    private BigDecimal carbohydratePer100g;
}