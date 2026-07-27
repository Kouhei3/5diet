package com.example.demo.service;

import com.example.demo.entity.SurveyData;
import com.example.demo.repository.SurveyRepository;

/**
 * アンケートビジネスロジック
 * 5DIET – SurveyService.java
 */
public class SurveyService {

    private final SurveyRepository repository = new SurveyRepository();

    /**
     * アンケートデータを保存する。
     * @param data 検証済みの SurveyData
     * @return 保存成功なら true
     */
    public boolean saveSurvey(SurveyData data) {
        // 保存前に BMI を再計算・セット（念のため）
        double bmi = SurveyData.calcBMI(data.getWeight(), data.getHeight());
        data.setBmi(bmi);

        return repository.insert(data);
    }

    /**
     * ユーザーIDでアンケート取得（後続機能向け）
     * @param userId ユーザーID
     * @return SurveyData（存在しなければ null）
     */
    public SurveyData getSurveyByUserId(int userId) {
        return repository.findByUserId(userId);
    }

        /**
     * 既存アンケートデータを更新する（体重・BMI）
     */
    public boolean updateSurvey(SurveyData data, int userId) {
        double bmi = SurveyData.calcBMI(data.getWeight(), data.getHeight());
        data.setBmi(bmi);

        return repository.update(data, userId);
    }
}


