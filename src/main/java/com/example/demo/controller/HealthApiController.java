package com.example.demo.controller;

import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;

import com.example.demo.entity.SurveyData;
import com.example.demo.service.SurveyService;

@RestController
@RequestMapping("/api")
public class HealthApiController {

    private final SurveyService surveyService = new SurveyService();

    /* =====================================================
       ① survey.html から体重を受け取って DB に保存する
       ===================================================== */
    @PostMapping("/survey")
    public Map<String, Object> saveSurvey(@RequestBody Map<String, Object> body) {

        double weight = Double.valueOf(body.get("weight").toString());

        // ★ 既存データを取得（ユーザーIDは仮で1）
        SurveyData data = surveyService.getSurveyByUserId(1);

        if (data == null) {
            // 初回アンケートがまだない場合は新規作成
            data = new SurveyData();
            data.setWeight(weight);
            surveyService.saveSurvey(data);  // INSERT
        } else {
            // 既存データがある場合は体重だけ更新
            data.setWeight(weight);
            surveyService.updateSurvey(data, 1); // ★ userId を渡す
        }

        Map<String, Object> result = new HashMap<>();
        result.put("status", "ok");
        return result;
    }

    /* =====================================================
       ② dashboard に表示するデータを返す
       ===================================================== */
    @GetMapping("/dashboard")
    public Map<String, Object> getDashboard() {

        SurveyData data = surveyService.getSurveyByUserId(1);

        Map<String, Object> result = new HashMap<>();
        result.put("height", data != null ? data.getHeight() : null);
        result.put("weight", data != null ? data.getWeight() : null);
        result.put("bmi", data != null ? data.getBmi() : null);

        return result;
    }

}
