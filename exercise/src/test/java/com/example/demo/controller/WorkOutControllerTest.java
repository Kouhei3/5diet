package com.example.demo.controller;

import com.example.demo.repository.WorkOutRepository;
import org.junit.jupiter.api.Test;
import org.springframework.jdbc.core.JdbcTemplate;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class WorkOutControllerTest {

    @Test
    void getMealData_shouldBuildScheduleEventsFromMealRecords() {
        WorkOutRepository workoutRepository = mock(WorkOutRepository.class);
        JdbcTemplate jdbcTemplate = mock(JdbcTemplate.class);
        WorkOutController controller = new WorkOutController(workoutRepository, jdbcTemplate);

        when(jdbcTemplate.queryForList(anyString())).thenReturn(List.of(
            Map.of(
                "record_date", LocalDate.of(2026, 6, 18),
                "meal_type", "breakfast",
                "food_name", "白米",
                "amount_g", new BigDecimal("200.00"),
                "calories", new BigDecimal("312.00")
            )
        ));

        List<Map<String, Object>> mealData = controller.getMealData();

        assertEquals(1, mealData.size());
        assertEquals("2026-06-18", mealData.get(0).get("date"));
        assertEquals("08:00", mealData.get(0).get("time"));
        assertTrue(mealData.get(0).get("title").toString().contains("白米"));
    }
}
