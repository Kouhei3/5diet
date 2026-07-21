package com.example.demo.controller;

import com.example.demo.entity.SurveyData;
import com.example.demo.service.SurveyService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * アンケートAPIコントローラー
 * 5DIET – SurveyController.java
 */
@RestController
@RequestMapping("/api/survey")
public class SurveyController {

    private final SurveyService surveyService;

    // コンストラクタ注入（Springによる自動DI）
    public SurveyController(SurveyService surveyService) {
        this.surveyService = surveyService;
    }

    /**
     * 初回アンケートデータの保存
     */
    @PostMapping
    public ResponseEntity<?> createSurvey(@RequestBody SurveyData surveyData) {
        boolean isSaved = surveyService.saveSurvey(surveyData);
        
        if (isSaved) {
            // フロントの response.ok に合わせて成功レスポンスを返す
            return ResponseEntity.ok(Map.of("message", "保存成功"));
        } else {
            return ResponseEntity.badRequest().body(Map.of("error", "保存に失敗しました"));
        }
    }
}