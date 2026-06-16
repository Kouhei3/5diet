package com.myapp.healthapp;

import java.io.BufferedReader;
import java.io.IOException;
import java.util.stream.Collectors;

import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.json.JSONObject;

public class HealthServlet extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        resp.setContentType("text/plain; charset=UTF-8");
        resp.getWriter().write("HealthServlet is working!");
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {

        // CORS 対応
        resp.setHeader("Access-Control-Allow-Origin", "http://localhost:5500");
        resp.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
        resp.setHeader("Access-Control-Allow-Headers", "Content-Type");
        resp.setHeader("Access-Control-Allow-Credentials", "true");
        resp.setCharacterEncoding("UTF-8");

        // JSON 読み取り
        BufferedReader reader = req.getReader();
        String body = reader.lines().collect(Collectors.joining());
        JSONObject json = new JSONObject(body);

        double weight = json.getDouble("weight");
        double height = json.getDouble("height");

        double bmi = weight / (height * height);
        double bodyFat = (1.20 * bmi) + (0.23 * 20) - 5.4; // 仮の計算

        JSONObject result = new JSONObject();
        result.put("weight", weight);
        result.put("bmi", bmi);
        result.put("body_fat", bodyFat);

        resp.setContentType("application/json; charset=UTF-8");
        resp.getWriter().write(result.toString());
    }
}
