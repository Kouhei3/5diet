package com.example.demo.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class LoginController {

    @GetMapping("/login")
    public String showLoginPage() {
        return "login";  // templates/login.html を表示
    }

    // パスワードをお忘れの方向け：ユーザー名入力画面
    @GetMapping("/forgot-password")
    public String showForgotPasswordPage() {
        return "forgot-password";  // templates/forgot-password.html を表示
    }

    // 認証コード確認 & 新パスワード設定画面
    @GetMapping("/reset")
    public String showResetPage() {
        return "reset";  // templates/reset.html を表示
    }
}
