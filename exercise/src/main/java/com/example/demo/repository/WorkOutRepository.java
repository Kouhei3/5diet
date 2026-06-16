package com.example.demo.repository;

import com.example.demo.entity.WorkoutLog;
import org.springframework.data.jpa.repository.JpaRepository;

// WorkOutRepository.java
public interface WorkOutRepository extends JpaRepository<WorkoutLog, Long> {}
