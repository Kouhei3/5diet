package com.example.demo.controller;

import com.example.demo.repository.UserDao;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;

@WebServlet("/api/verify")
public class VerifyApiServlet extends HttpServlet {
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

        // ★ フォームから値を受け取る（JSONではなく通常のPOST）
        String username = request.getParameter("username");
        String code = request.getParameter("code");

        try {
            // ★ 認証コードチェック
            boolean verified = userDao.verifyAccount(username, code);

            if (verified) {
                // ★ 本登録成功 → アンケート１枚目へ
                response.sendRedirect("/survey.html");
            } else {
                // ★ 失敗 → 認証画面に戻す
                response.sendRedirect("/webapp/verify.html?error=1");
            }

        } catch (Exception e) {
            // ★ エラー時も認証画面へ戻す
            response.sendRedirect("/webapp/verify.html?error=2");
        }
    }
}
