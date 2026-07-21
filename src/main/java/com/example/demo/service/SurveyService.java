package com.example.demo.service;

import com.example.demo.entity.SurveyData;
import com.example.demo.repository.SurveyRepository;
import org.springframework.stereotype.Service;

/**
 * アンケートビジネスロジック
 * 5DIET – SurveyService.java
 */
@Service
public class SurveyService {

    private final SurveyRepository repository;

    // コンストラクタ注入（手動newからDIへ変更して安全性を向上）
    public SurveyService(SurveyRepository repository) {
        this.repository = repository;
    }

    /**
     * アンケートデータを保存する（新規登録用）
     * @param data 検証済みの SurveyData
     * @return 保存成功なら true
     */
    public boolean saveSurvey(SurveyData data) {
        // 保存前に BMI を再計算・セット
        double bmi = SurveyData.calcBMI(data.getWeight(), data.getHeight());
        data.setBmi(bmi);

        return repository.insert(data);
    }

    /**
     * ユーザーIDでアンケート取得（ダッシュボードや後続機能向け）
     * @param userId ユーザーID
     * @return SurveyData（存在しなければ null）
     */
    public SurveyData getSurveyByUserId(int userId) {
        return repository.findByUserId(userId);
    }

    /**
     * 既存アンケートデータを更新する（日々の体重・BMI更新用）
     */
    public boolean updateSurvey(SurveyData data, int userId) {
        double bmi = SurveyData.calcBMI(data.getWeight(), data.getHeight());
        data.setBmi(bmi);

        return repository.update(data, userId);
    }
}