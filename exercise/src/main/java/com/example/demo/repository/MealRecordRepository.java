package com.example.demo.repository;

import com.example.demo.entity.MealRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface MealRecordRepository extends JpaRepository<MealRecord, Integer> {
    // 特定ユーザーの指定日の食事履歴をID降順で取得
    List<MealRecord> findByUserIdAndRecordDateOrderByIdDesc(Integer userId, LocalDate recordDate);
}