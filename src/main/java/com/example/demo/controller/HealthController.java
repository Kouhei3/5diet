package com.example.demo.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/task")
public class HealthController {

    // ダッシュボード ← ★これを追加！
    @GetMapping("/health-dashboard")
    public String dashboard() {
        return "health-dashboard";
    }

    // 体重入力画面
    @GetMapping("/health-weight")
    public String weight() {
        return "health-weight";
    }

    // ToDo入力画面
    @GetMapping("/health-todo")
    public String todo() {
        return "health-todo";
    }

    // 食事入力画面
    @GetMapping("/health-food")
    public String food() {
        return "health-food";
    }

    // タイムスケジュール画面
    @GetMapping("/health-schedule")
    public String schedule() {
        return "health-schedule";
    }
}
