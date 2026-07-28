package com.example.demo.controller;

import com.example.demo.repository.UserDao;
import com.example.demo.util.EmailUtil;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;

import jakarta.servlet.http.HttpServletRequest;

@Controller
public class RegisterController {

    private final UserDao userDao = new UserDao();

    // ★ 追加：GET /register（ブラウザで開く用）
    @GetMapping("/register")
    public String showRegisterPage() {
        return "register";  // templates/register.html
    }

    @PostMapping("/api/register")
    public String register(HttpServletRequest request, Model model) {

        String username = request.getParameter("username");
        String email = request.getParameter("email");
        String password = request.getParameter("password");

        try {
            UserDao.RegisterInfo regInfo = userDao.registerUser(username, email, password);

            if (regInfo.success && regInfo.code != null) {
                EmailUtil.sendRegistrationVerificationCode(email, regInfo.code);

                // ★ check-email.html に遷移
                model.addAttribute("email", email);
                model.addAttribute("username", username);
                return "check-email";
            } else {
                return "redirect:/register?error=1";
            }

        } catch (Exception e) {
            e.printStackTrace();
            return "redirect:/register?error=2";
        }
    }
}
