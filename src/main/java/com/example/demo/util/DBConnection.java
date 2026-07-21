package com.example.demo.util;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public class DBConnection {
    private static final String URL = "jdbc:mysql://database-1.c3uiu3zg691r.us-east-1.rds.amazonaws.com:3306/diet_app?useSSL=false&serverTimezone=Asia/Tokyo&characterEncoding=UTF-8";
    private static final String USER = "admin";
    private static final String PASS = "pbl5hanaws";

    public static Connection getConnection() throws SQLException {
        try {
            Class.forName("com.mysql.cj.jdbc.Driver");
        } catch (ClassNotFoundException e) {
            e.printStackTrace();
        }
        return DriverManager.getConnection(URL, USER, PASS);
    }
}