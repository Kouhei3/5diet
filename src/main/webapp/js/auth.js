// 共通のリクエスト送信関数
function sendAuthRequest(url, data, onSuccess) {
    const message = document.getElementById("message");
    fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    })
    .then(response => response.json().then(data => ({ status: response.status, body: data })))
    .then(result => {
        if (message) {
            message.textContent = result.body.message;
            message.className = result.status === 200 ? "message success" : "message error";
        }
        if (result.status === 200 && onSuccess) {
            onSuccess(result.body);
        }
    })
    .catch(error => {
        console.error("Error:", error);
        if (message) {
            message.textContent = "通信エラーが発生しました。";
            message.className = "message error";
        }
    });
}

// パスワードの表示・非表示切り替え
document.querySelectorAll('.password-toggle').forEach(button => {
    button.addEventListener('click', function() {
        const targetId = this.getAttribute('data-target');
        const input = document.getElementById(targetId);
        if (input.type === 'password') {
            input.type = 'text';
            this.textContent = '非表示';
        } else {
            input.type = 'password';
            this.textContent = '表示';
        }
    });
});

// ログイン処理
const loginForm = document.getElementById("loginForm");
if (loginForm) {
    loginForm.addEventListener("submit", function (e) {
        e.preventDefault();
        const username = document.getElementById("username").value;
        const password = document.getElementById("password").value;
        sendAuthRequest("http://localhost:8888/login-api/api/login", { username, password }, () => {
            setTimeout(() => { window.location.href = "dashboard.html"; }, 1500);
        });
    });
}

// 新規登録処理（仮登録）
const registerForm = document.getElementById("registerForm");
if (registerForm) {
    registerForm.addEventListener("submit", function (e) {
        e.preventDefault();
        const username = document.getElementById("username").value;
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;

        sendAuthRequest("http://localhost:8888/login-api/api/register", { username, email, password }, () => {
            // 登録成功後、認証画面（verify.html）に移動し、ユーザー名をURLで引き継ぐ
            setTimeout(() => {
                window.location.href = "verify.html?username=" + encodeURIComponent(username);
            }, 2000);
        });
    });
}

// パスワードリセット（メール送信処理）
const forgotPasswordForm = document.getElementById("forgotPasswordForm");
if (forgotPasswordForm) {
    forgotPasswordForm.addEventListener("submit", function (e) {
        e.preventDefault();
        const username = document.getElementById("username").value;
        sendAuthRequest("http://localhost:8888/login-api/api/forgot-password", { username: username }, () => {
            setTimeout(() => { window.location.href = "reset.html?username=" + encodeURIComponent(username); }, 1500);
        });
    });
}

// パスワード再設定（新しいパスワードの設定処理）
const resetForm = document.getElementById("resetForm");
if (resetForm) {
    const urlParams = new URLSearchParams(window.location.search);
    const username = urlParams.get('username');
    const message = document.getElementById("message");
    const passwordInput = document.getElementById("newPassword");
    const confirmInput = document.getElementById("confirmPassword");

    if (!username && message) {
        message.textContent = "ユーザー情報がありません。最初からやり直してください。";
        message.className = "message error";
    }

    resetForm.addEventListener("submit", function (e) {
        e.preventDefault();
        if (!username) return;

        if (passwordInput.value !== confirmInput.value) {
            if (message) {
                message.textContent = "パスワードが一致しません";
                message.className = "message error";
            }
            return;
        }

        const code = document.getElementById("code").value;
        sendAuthRequest("http://localhost:8888/login-api/api/reset-password", {
            username: username,
            code: code,
            newPassword: passwordInput.value
        }, () => {
            setTimeout(() => { window.location.href = "login.html"; }, 2000);
        });
    });
}

// アカウント認証処理（本登録）
const verifyForm = document.getElementById("verifyForm");
if (verifyForm) {
    const urlParams = new URLSearchParams(window.location.search);
    const username = urlParams.get('username');
    const message = document.getElementById("message");

    if (!username && message) {
        message.textContent = "ユーザー情報がありません。最初からやり直してください。";
        message.className = "message error";
    }

    verifyForm.addEventListener("submit", function (e) {
        e.preventDefault();
        if (!username) return;

        const code = document.getElementById("verificationCode").value;

        sendAuthRequest("http://localhost:8888/login-api/api/verify", {
            username: username,
            code: code
        }, () => {
            // 本登録完了後、ログイン画面へ案内
            setTimeout(() => { window.location.href = "login.html"; }, 2000);
        });
    });
}