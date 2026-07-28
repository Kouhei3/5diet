# 5diet 統合メモ

3つの提出物（exercise, master, userT-shian）を1つの Spring Boot プロジェクトに統合しました。

## 統合方針
- **ベース**: `master/5diet` を採用。
  `master` と `userT-shian` はほぼ同一の認証/アンケート/健康管理機能でしたが、
  `SurveyData`・`SurveyRepository` の差分比較の結果、`master` の方が
  userId対応やUPDATE処理などが実装済みで開発が進んでいたため、
  共通部分（ログイン・登録・アンケート・健康ダッシュボード等）は master 側を正としました。
- **exercise の統合**: `WorkoutLog`（Entity/Repository/Controller群）をそのまま追加。
  パッケージ構成が同じ `com.example.demo.*` だったため、クラス名・URLマッピング
  （`/api/records`, `/api/workouts`）ともに衝突なく統合できました。
- **userT-shian の独自資産の統合**: master にはなかった `health-food.html` と
  `health-schedule.html`（食事入力・タイムスケジュール画面）を新規追加し、
  `HealthController` に `/task/health-food`, `/task/health-schedule` のマッピングを追加、
  ダッシュボードにも導線ボタンを追加しました（未接続のまま埋もれていたため）。

## 書き換えた箇所（例外対応）
1. **pom.xml**: `spring-boot-starter-data-jpa` と `lombok` を追加
   （WorkoutLog エンティティが JPA + Lombok を使用しているため）。
   また `spring-boot-maven-plugin` に lombok の repackage 除外設定を追加。
2. **静的ファイルの配置**: exercise の `index.html / exercise.html / history.html / app.js / style.css` は
   `static/` 直下から `static/exercise/` 配下に移動しました。
   理由: `static/index.html` が Spring Boot のデフォルトウェルカムページとして
   ルートパス `/` を奪ってしまい、ログイン画面等と競合する恐れがあったためです。
   移動に伴い、画面内の `window.location.href='/index.html'` 等のパスも
   `/exercise/index.html` 等に修正しています（API呼び出し先の `/api/records` 等は変更なし）。
3. **HealthController.java**: `/health-food`, `/health-schedule` のマッピングを追加。
4. **health-dashboard.html**: 上記2画面への導線ボタンを追加。

## 変更していない/そのまま残した差分（要チームレビュー）
- `userT-shian` 側にあった `login.html` / `survey.html` / `health-todo.html` /
  `health-weight.html` / `health-app.js` / `survey.js` / 各種cssの独自変更は、
  master の方が新しい実装（サーバーサイド遷移対応など）だったため採用していません。
  もしデザイン面でuserT-shian側の変更を活かしたい箇所があれば、個別に見比べてください。
- `exercise/5diet` 内にあった `main`（拡張子なしのバイナリファイル）はビルド成果物と
  思われるため統合対象から除外しました。

## 未実施（環境上の制約）
このサンドボックス環境は Maven Central 等へのネットワークアクセスが許可されていないため、
`mvn compile` によるビルド確認は実施できていません。VSCode 側で一度
`mvn clean install` を実行して依存関係の解決とコンパイルを確認してください。

## 画面遷移図との突き合わせ・修正（2026-07-28）
基本設計タブに埋め込まれていた画面遷移図（画像）と実装を突き合わせたところ、
認証まわりの遷移が複数箇所で壊れていたため、以下を修正しました。

1. **ログイン成功時のリダイレクト先が誤り**
   `LoginApiServlet` が存在しない `/dashboard.html` にリダイレクトしていたため、
   `/task/health-dashboard` に修正。失敗時のリダイレクト先も
   `/webapp/login.html?error=1` → `/login?error=1` に修正。
2. **メール認証コードの送信先が誤り**
   `check-email.html` のフォームが `/verify`（存在しないパス）に送信していたため、
   実際に存在する `/api/verify` に修正。また `VerifyApiServlet` が要求する
   `username` パラメータが送られていなかったため、`RegisterController` から
   `username` をモデルに渡し、`check-email.html` に隠しフィールドとして追加。
   `VerifyApiServlet` の失敗時リダイレクト先も、存在しない `/webapp/verify.html`
   から `/register?error=3`（登録やり直し）に修正。成功時も `/survey.html` →
   `/survey` に修正。
3. **「パスワードをお忘れの方はこちら」が存在しないパスを指していた**
   `login.html` の `forgot-password.html`（静的ファイルとして存在しない）を
   `/forgot-password` に修正し、`LoginController` に `/forgot-password` と
   `/reset` のGETマッピングを追加（`forgot-password.html` / `reset.html` は
   Thymeleafテンプレートのため、コントローラー経由でないと表示できない）。
4. **forgot-password.html / reset.html の送信処理が未実装だった**
   フォームはあったが送信時の `fetch` 呼び出しが存在せず、送信しても
   何も起きなかったため、`auth.js` に以下を追加：
   - `#forgotPasswordForm` の送信 → `/api/forgot-password` にJSON POST →
     成功時は `/reset?username=...` へ遷移
   - `#resetForm` の送信 → `/api/reset-password` にJSON POST →
     成功時は `/login` へ遷移（新旧パスワード不一致のチェックも追加）
   - ログイン・登録失敗時の `?error=` クエリを画面上のメッセージ欄に表示する
     簡易処理も追加
5. `reset.html` に、URLクエリの `username` を受け取るための隠しフィールド
   （`#hiddenUsername`）を追加（`verify.html` で既に使われていた仕組みを流用）。

### 現状の画面遷移（修正後）
ログイン画面 ⇄ 新規登録画面 → メール確認画面 → （認証成功）→ 初回アンケート画面 →
ダッシュボード画面 → 体重／ToDo／食事／スケジュール入力画面、および
ログイン画面 → パスワード再設定リクエスト画面 → 新パスワード設定画面 → ログイン画面、
という基本設計の画面遷移図通りの流れになっています。

### 未検証の点
DB接続不可のためこのサンドボックスでは実機での動作確認ができていません。
`mvn clean install` に加えて、実際にDBへ接続できる環境で一度register→check-email→
login→dashboard、および forgot-password→reset→login のフローを通しで
動作確認してください。
