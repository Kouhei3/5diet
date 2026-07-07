package com.example.demo.controller;

import com.example.demo.repository.UserDao;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;

@WebServlet("/api/login")
public class LoginApiServlet extends HttpServlet {
    private final UserDao userDao = new UserDao();

    private void setCorsHeaders(HttpServletRequest request, HttpServletResponse response) {
        String origin = request.getHeader("Origin");
        response.setHeader("Access-Control-Allow-Origin", origin != null ? origin : "http://localhost:63342");
        response.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS, HEAD");
        response.setHeader("Access-Control-Allow-Headers", "Content-Type");
    }

    @Override
    protected void doOptions(HttpServletRequest request, HttpServletResponse response) {
        setCorsHeaders(request, response);
        response.setStatus(HttpServletResponse.SC_OK);
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
        setCorsHeaders(request, response);
        request.setCharacterEncoding("UTF-8");

        // ★ フォームから値を受け取る
        String username = request.getParameter("username");
        String password = request.getParameter("password");

        // ★ DBでログインチェック
        UserDao.AuthResult authResult = userDao.authenticate(username, password);

        if (authResult.user != null) {
            // ★ ログイン成功 → ダッシュボードへ
            response.sendRedirect("/dashboard.html");
        } else {
            // ★ ログイン失敗 → ログイン画面に戻す
            response.sendRedirect("/webapp/login.html?error=1");
        }
    }
}
