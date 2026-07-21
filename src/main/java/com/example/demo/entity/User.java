package com.example.demo.entity;

public class User {
    private int id;
    private String username;
    private String roleName;

    // コンストラクタ（すでに作成されているものと同じで大丈夫です）
    public User(int id, String username, String roleName) {
        this.id = id;
        this.username = username;
        this.roleName = roleName;
    }

    // 💡 ★以下の「ゲッター（Getter）メソッド」を追加してください
    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getRoleName() {
        return roleName;
    }

    public void setRoleName(String roleName) {
        this.roleName = roleName;
    }
}