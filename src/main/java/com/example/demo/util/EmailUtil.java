package com.example.demo.util;

public class EmailUtil {
    public static void sendVerificationCode(String recipientEmail, String code) {
        // 本物のメールは送信せず、ログに出力してテストできるようにします
        System.out.println("==========================================");
        System.out.println("[メール送信シミュレーター]");
        System.out.println("宛先: " + recipientEmail);
        System.out.println("認証コード: " + code);
        System.out.println("==========================================");
        
        // エラーを出さずに正常終了させる
    }
}