package com.example.demo.repository;

import com.example.demo.entity.WorkoutLog;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface WorkoutLogRepository extends JpaRepository<WorkoutLog, Long> {
    // 将来、特定のユーザーのデータだけ、あるいは特定の日付だけを取得したくなった時のための拡張用
    List<WorkoutLog> findByUserId(Long userId);
}