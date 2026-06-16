-- =====================================================
-- 5DIET – create_survey_table.sql
-- アンケートデータ テーブル定義
-- =====================================================

CREATE DATABASE IF NOT EXISTS `5diet`
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE `5diet`;

CREATE TABLE IF NOT EXISTS survey_data (
    id              INT AUTO_INCREMENT PRIMARY KEY COMMENT 'サロゲートキー',
    user_id         INT          NULL               COMMENT 'ユーザーID（ログイン実装後に外部キー設定）',

    -- 基本情報
    gender          VARCHAR(10)  NOT NULL           COMMENT '性別: male / female',
    age             TINYINT UNSIGNED NOT NULL        COMMENT '年齢',
    height_cm       DECIMAL(5,1) NOT NULL            COMMENT '身長 cm（小数第1位）',
    weight_kg       DECIMAL(5,1) NOT NULL            COMMENT '体重 kg',
    bmi             DECIMAL(4,1) NOT NULL            COMMENT 'BMI（自動計算）',
    goal_weight_kg  DECIMAL(5,1) NOT NULL            COMMENT '目標体重 kg',

    -- 目標設定
    goal_date       DATE         NOT NULL            COMMENT '目標達成日',
    remain_days     INT          NOT NULL            COMMENT '残り日数（登録時計算）',
    purpose         VARCHAR(100) NOT NULL            COMMENT 'ダイエットの目的',
    purpose_other   TEXT         NULL                COMMENT '目的「その他」詳細',

    -- 生活スタイル
    activity_level  VARCHAR(20)  NOT NULL            COMMENT '活動レベル',
    job_type        VARCHAR(20)  NOT NULL            COMMENT '仕事の種類',

    -- 食事情報
    diet_exp        VARCHAR(20)  NOT NULL            COMMENT '食事管理経験',
    meal_style      VARCHAR(20)  NOT NULL            COMMENT '食事スタイル',
    allergy         TEXT         NULL                COMMENT 'アレルギー（任意）',

    created_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '登録日時',
    updated_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
                                 ON UPDATE CURRENT_TIMESTAMP  COMMENT '更新日時',

    INDEX idx_user_id (user_id),
    INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='初回アンケートデータ';
