const message = document.getElementById("message");
const passwordInput = document.getElementById("password");
const confirmInput = document.getElementById("confirmPassword");

function showPasswordError(text) {
  message.textContent = text;
  message.classList.add("error");
  passwordInput.classList.add("error");
  confirmInput.classList.add("error");
}

function clearPasswordError() {
  message.textContent = "";
  message.classList.remove("error");
  passwordInput.classList.remove("error");
  confirmInput.classList.remove("error");
}

passwordInput.addEventListener("input", clearPasswordError);
confirmInput.addEventListener("input", clearPasswordError);

// ChromeはInput type="password"のフィールドに対して、ページとは別に
// 独自の表示・非表示アイコンや「強力なパスワードの提案」UIを重ねて表示することがあり、
// 自作のトグルボタンと二重に見えてしまう。
// これを避けるため、対応ブラウザでは type="text" のまま CSS (-webkit-text-security) で
// 見た目だけをパスワードのように隠し、自作ボタンだけが唯一の表示・非表示UIになるようにする。
// 対応していないブラウザ（Firefoxなど）では従来通り type="password" / "text" を切り替える。
const supportsTextSecurityMask =
  typeof CSS !== "undefined" &&
  typeof CSS.supports === "function" &&
  CSS.supports("-webkit-text-security", "disc");

function preparePasswordField(input) {
  if (supportsTextSecurityMask) {
    input.type = "text";
    input.classList.add("password-mask");
  }
}

function isMasked(input) {
  return supportsTextSecurityMask
    ? input.classList.contains("password-mask")
    : input.type === "password";
}

function setMasked(input, masked) {
  if (supportsTextSecurityMask) {
    input.classList.toggle("password-mask", masked);
  } else {
    input.type = masked ? "password" : "text";
  }
}

preparePasswordField(passwordInput);
preparePasswordField(confirmInput);

// パスワードの表示・非表示を切り替えるトグルボタン
document.querySelectorAll(".password-toggle").forEach(function (button) {
  button.addEventListener("click", function () {
    const targetId = button.getAttribute("data-target");
    const targetInput = document.getElementById(targetId);
    const wasMasked = isMasked(targetInput);

    setMasked(targetInput, !wasMasked);
    button.classList.toggle("is-visible", wasMasked);
    button.setAttribute("aria-pressed", wasMasked ? "true" : "false");
    button.setAttribute(
      "aria-label",
      wasMasked ? "パスワードを非表示" : "パスワードを表示"
    );

    // 表示状態を切り替えた後もカーソル位置と入力欄のフォーカスを保持する
    targetInput.focus();
  });
});

const form = document.getElementById("registerForm");
form.addEventListener("submit", async function (event) {
  event.preventDefault();

  const username = document.getElementById("username").value;
  const password = passwordInput.value;
  const confirmPassword = confirmInput.value;

  if (!password || !confirmPassword) {
    showPasswordError("パスワードを入力してください");
    return;
  }

  if (password !== confirmPassword) {
    showPasswordError("パスワードが違います");
    return;
  }

  clearPasswordError();

  const userData = {
    username: username,
    password: password,
  };

  try {
    const response = await fetch("http://localhost:8080/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    const result = await response.text();
    message.textContent = result;
  } catch (error) {
    message.textContent = "登録に失敗しました";
  }
});
