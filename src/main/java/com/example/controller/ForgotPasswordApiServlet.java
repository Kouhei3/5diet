package com.example.controller;

import com.example.dao.UserDao;
import com.example.util.EmailUtil;
import com.google.gson.Gson;
import com.google.gson.JsonObject;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.BufferedReader;
import java.io.IOException;

@WebServlet("/api/forgot-password")
public class ForgotPasswordApiServlet extends HttpServlet {
    private final UserDao userDao = new UserDao();
    private final Gson gson = new Gson();

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
        response.setContentType("application/json; charset=UTF-8");
        JsonObject jsonResponse = new JsonObject();

        try {
            StringBuilder sb = new StringBuilder();
            String line;
            try (BufferedReader reader = request.getReader()) {
                while ((line = reader.readLine()) != null) sb.append(line);
            }

            // 【変更】emailではなくusernameを受け取る
            String username = gson.fromJson(sb.toString(), JsonObject.class).get("username").getAsString();

            // ユーザー名からメールアドレスとコードを取得
            UserDao.ResetInfo info = userDao.createPasswordResetTokenByUsername(username);

            if (info != null) {
                EmailUtil.sendVerificationCode(info.email, info.code);

                // メールアドレスの一部を伏せ字にする (例: te***@gmail.com)
                String maskedEmail = info.email.replaceAll("(^[^@]{2})[^@]*(@.*)", "$1***$2");

                response.setStatus(HttpServletResponse.SC_OK);
                jsonResponse.addProperty("status", "success");
                jsonResponse.addProperty("message", maskedEmail + " 宛てに再設定ページのURLとコードを送信しました。");
            } else {
                response.setStatus(HttpServletResponse.SC_NOT_FOUND);
                jsonResponse.addProperty("status", "error");
                jsonResponse.addProperty("message", "登録されていないユーザー名です。");
            }
        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            jsonResponse.addProperty("status", "error");
            jsonResponse.addProperty("message", "メールの送信に失敗しました。");
            e.printStackTrace();
        }
        response.getWriter().write(gson.toJson(jsonResponse));
    }
}