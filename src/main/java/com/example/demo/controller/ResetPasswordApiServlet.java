package com.example.demo.controller;

import com.example.demo.repository.UserDao;
import com.google.gson.Gson;
import com.google.gson.JsonObject;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.BufferedReader;
import java.io.IOException;

@WebServlet("/api/reset-password")
public class ResetPasswordApiServlet extends HttpServlet {
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

            JsonObject jsonReq = gson.fromJson(sb.toString(), JsonObject.class);
            // 【変更】emailではなくusernameで照合する
            String username = jsonReq.get("username").getAsString();
            String code = jsonReq.get("code").getAsString();
            String newPassword = jsonReq.get("newPassword").getAsString();

            if (userDao.resetPasswordWithToken(username, code, newPassword)) {
                response.setStatus(HttpServletResponse.SC_OK);
                jsonResponse.addProperty("status", "success");
                jsonResponse.addProperty("message", "パスワードが再設定されました！ログイン画面へ移動します。");
            } else {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                jsonResponse.addProperty("status", "error");
                jsonResponse.addProperty("message", "認証コードが間違っているか、有効期限が切れています。");
            }
        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            jsonResponse.addProperty("status", "error");
            jsonResponse.addProperty("message", "サーバー内部エラーが発生しました。");
        }
        response.getWriter().write(gson.toJson(jsonResponse));
    }
}