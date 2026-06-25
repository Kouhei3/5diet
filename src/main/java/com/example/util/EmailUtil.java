package com.example.util;

import jakarta.mail.*;
import jakarta.mail.internet.*;
import java.util.Properties;

public class EmailUtil {

    // 送信元メールアドレスとアプリパスワード
    private static final String SENDER_EMAIL = "5diet.information@gmail.com"; // 送信元メールアドレス
    private static final String APP_PASSWORD = "dmyevobksdejpdnc"; // Googleの「アプリパスワード」

    // パスワード再設定用のメール送信
    public static void sendVerificationCode(String recipientEmail, String code) {
        Properties props = new Properties();
        props.put("mail.smtp.auth", "true");
        props.put("mail.smtp.starttls.enable", "true");
        props.put("mail.smtp.host", "smtp.gmail.com");
        props.put("mail.smtp.port", "587");

        Session session = Session.getInstance(props, new Authenticator() {
            protected PasswordAuthentication getPasswordAuthentication() {
                return new PasswordAuthentication(SENDER_EMAIL, APP_PASSWORD);
            }
        });

        try {
            Message message = new MimeMessage(session);
            message.setFrom(new InternetAddress(SENDER_EMAIL));
            message.setRecipients(Message.RecipientType.TO, InternetAddress.parse(recipientEmail));
            message.setSubject("【認証コード】パスワード再設定");
            message.setText("あなたの認証コードは " + code + " です。\nこのコードをアプリに入力してください。");

            Transport.send(message);
        } catch (MessagingException e) {
            throw new RuntimeException("メール送信中にエラーが発生しました", e);
        }
    }

    // アカウント新規登録（仮登録）用のメール送信
    public static void sendRegistrationVerificationCode(String recipientEmail, String code) {
        Properties props = new Properties();
        props.put("mail.smtp.auth", "true");
        props.put("mail.smtp.starttls.enable", "true");
        props.put("mail.smtp.host", "smtp.gmail.com");
        props.put("mail.smtp.port", "587");

        Session session = Session.getInstance(props, new Authenticator() {
            protected PasswordAuthentication getPasswordAuthentication() {
                return new PasswordAuthentication(SENDER_EMAIL, APP_PASSWORD);
            }
        });

        try {
            Message message = new MimeMessage(session);
            message.setFrom(new InternetAddress(SENDER_EMAIL));
            message.setRecipients(Message.RecipientType.TO, InternetAddress.parse(recipientEmail));
            message.setSubject("【5DIET】アカウント本登録用の認証コード");
            message.setText("あなたのアカウント仮登録を受け付けました。\n以下の認証コードをアプリ画面に入力して、本登録を完了してください。\n\n認証コード: " + code + "\n\n※このメールに心当たりがない場合は破棄してください。");

            Transport.send(message);
        } catch (MessagingException e) {
            throw new RuntimeException("メール送信中にエラーが発生しました", e);
        }
    }
}