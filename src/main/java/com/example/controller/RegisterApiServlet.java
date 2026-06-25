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

@WebServlet("/api/register")
public class RegisterApiServlet extends HttpServlet {
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
            String username = jsonReq.get("username").getAsString();
            String email = jsonReq.get("email").getAsString();
            String password = jsonReq.get("password").getAsString();

            // UserDaoの変更に合わせて、RegisterInfoを受け取る
            UserDao.RegisterInfo regInfo = userDao.registerUser(username, email, password);

            if (regInfo.success && regInfo.code != null) {
                try {
                    // 仮登録成功時、メールで認証コードを送信
                    EmailUtil.sendRegistrationVerificationCode(email, regInfo.code);
                    response.setStatus(HttpServletResponse.SC_OK);
                    jsonResponse.addProperty("status", "success");
                    jsonResponse.addProperty("message", "仮登録が完了しました。メールを確認してください。");
                } catch (Exception e) {
                    response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                    jsonResponse.addProperty("status", "error");
                    jsonResponse.addProperty("message", "登録はできましたが、メール送信に失敗しました。");
                }
            } else {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                jsonResponse.addProperty("status", "error");
                jsonResponse.addProperty("message", "このユーザー名またはメールアドレスは既に使われています。");
            }
        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            jsonResponse.addProperty("status", "error");
            jsonResponse.addProperty("message", "エラーが発生しました。");
        }
        response.getWriter().write(gson.toJson(jsonResponse));
    }
}