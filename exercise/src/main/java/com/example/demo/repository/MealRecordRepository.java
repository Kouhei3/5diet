package com.example.demo.repository;

import com.example.demo.entity.MealRecord;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MealRecordRepository extends JpaRepository<MealRecord, Long> {
}
