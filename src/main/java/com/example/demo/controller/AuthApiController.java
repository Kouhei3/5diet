package com.example.demo.controller;

import com.example.demo.repository.UserDao;
import com.example.demo.service.SurveyService;
import com.example.demo.util.EmailUtil;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.io.IOException;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class AuthApiController {

    private final UserDao userDao = new UserDao();
    private final SurveyService surveyService;

    public AuthApiController(SurveyService surveyService) {
        this.surveyService = surveyService;
    }

    // 1. 新規登録
    @PostMapping("/register")
    public void register(@RequestParam("username") String username,
                         @RequestParam("email") String email,
                         @RequestParam("password") String password,
                         HttpSession session, HttpServletResponse response) throws IOException {
        try {
            UserDao.RegisterInfo regInfo = userDao.registerUser(username, email, password);
            if (regInfo.success) {
                session.setAttribute("registeredUsername", username);
                response.sendRedirect("/survey.html");
            } else {
                response.sendRedirect("/register.html?error=already_exists");
            }
        } catch (Exception e) { 
            response.sendRedirect("/register.html?error=system_error"); 
        }
    }

    // 2. ログイン（メールアドレス認証 ＆ 画面の自動振り分け機能）
    @PostMapping("/login")
    public void login(@RequestParam("email") String email,
                      @RequestParam("password") String password,
                      HttpSession session,
                      HttpServletResponse response) throws IOException {
        
        UserDao.AuthResult authResult = userDao.authenticateByEmail(email, password);
        
        if (authResult.user != null) {
            session.setAttribute("loginUser", authResult.user);
            session.setAttribute("userId", authResult.user.getId());
            
            boolean isSurveyCompleted = userDao.hasCompletedSurvey(authResult.user.getId());
            
            if (isSurveyCompleted) {
                System.out.println("[Login Log] 診断回答済みのユーザーのため、ダッシュボードへ遷移します。");
                response.sendRedirect("/health-dashboard.html");
            } else {
                System.out.println("[Login Log] 診断未回答のユーザーのため、初回診断画面へ遷移します。");
                session.setAttribute("registeredUsername", authResult.user.getUsername());
                response.sendRedirect("/survey.html");
            }
        } else {
            System.out.println("[Login Log] 認証失敗。ログイン画面にエラーを送ります。");
            response.sendRedirect("/login.html?error=1");
        }
    }

    // 3. パスワード再設定要求
    @PostMapping("/reset-password-request")
    public ResponseEntity<?> requestResetCode(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        System.out.println("[Reset Log] 画面から受け取ったアドレス: " + email);

        UserDao.ResetInfo info = userDao.createPasswordResetTokenByEmail(email);
        if (info == null) {
            System.out.println("[Reset Log] エラー: DBにこのメールアドレスは存在しません。");
            return ResponseEntity.badRequest().body(Map.of("status", "error", "message", "このメールアドレスは登録されていません。"));
        }

        try {
            System.out.println("[Reset Log] メール送信を試みます... 宛先: " + info.email + " コード: " + info.code);
            EmailUtil.sendVerificationCode(info.email, info.code);
            System.out.println("[Reset Log] メールが正常に送信されました！");
            return ResponseEntity.ok(Map.of("status", "success"));
        } catch (Exception e) {
            System.err.println("[Reset Log] メール送信中に致命的なエラーが発生しました。EmailUtilの設定を確認してください。");
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(Map.of("status", "error", "message", "メール送信サーバーのエラーです（EmailUtilの設定不備の可能性）。"));
        }
    }

    // 4. パスワードリセット実行
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> request) {
        if (userDao.resetPasswordWithToken(request.get("email"), request.get("code"), request.get("newPassword"))) {
            return ResponseEntity.ok(Map.of("status", "success"));
        }
        return ResponseEntity.badRequest().body(Map.of("status", "error", "message", "認証コードが違うか、有効期限が切れています。"));
    }
}