package com.example.diet.controller;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/records")
// フロントエンドからのクロスオリジンリクエスト（CORS）を許可する設定を追加
@CrossOrigin(origins = "*") 
public class ExerciseController {

    // フロントエンド(JS)の送信データ構造に完全に一致させたDTOクラス
    public static class RecordRequest {
        public ExerciseInner exercise;
        public double weight;
        public int reps;
        public String date;

        // JSの ex.name (exercise.name) を受け取るための内部クラス
        public static class ExerciseInner {
            public String name;
            public String category;
            public String type;
            public String level;
            public String desc;
        }
    }

    // POSTリクエストを受け取って保存処理をする
    @PostMapping
    public String saveRecord(@RequestBody RecordRequest request) {
        // データベース(MySQLなど)への保存処理の受け口
        System.out.println("====== ワークアウト記録を受信 ======");
        if (request.exercise != null) {
            System.out.println("種目名: " + request.exercise.name);
        }
        System.out.println("重量  : " + request.weight + " kg");
        System.out.println("回数  : " + request.reps + " 回");
        System.out.println("日時  : " + request.date);
        System.out.println("====================================");

        return "保存成功";
    }
}