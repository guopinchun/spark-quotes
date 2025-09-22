# 火種語錄 Spark Quotes (Gemini × Cloudflare Pages)

這是一個最小可行（MVP）的文字生成小工具：輸入主題與語氣，呼叫 **Gemini API** 生成激勵金句。前端部署在 **Cloudflare Pages**，API 金鑰由 **Pages Functions** 保護。

> ✅ 完整步驟與部署說明請見下方；上傳到 GitHub 後，連接 Cloudflare Pages 即可自動部署。

---

## 專案結構

```
spark-quotes/
├─ index.html                 # 前端：輸入與顯示
└─ functions/
   └─ api/
      └─ generate.ts         # 後端：Cloudflare Pages Functions，轉呼叫 Gemini API
```

---

## 快速開始（10 分鐘）

### 1) 取得 Gemini API Key
- 進入 Google AI Studio → API Keys → 建立金鑰
- 請妥善保存，**不要**把金鑰放在前端程式碼。

### 2) 推到 GitHub
- 將此專案資料夾整包上傳到 GitHub（或在本機 `git init` 後推送）。

### 3) Cloudflare Pages 部署
1. 登入 Cloudflare → Pages → **Create a project**
2. 選 **Connect to Git**，選擇你的 repo
3. Build 設定：
   - Framework preset: **None**
   - Build command: *(留空)*
   - Build output directory: `./`（預設即可）
   - Functions：**自動偵測 `functions/`**（不用另外設定）
4. 按 Deploy。

### 4) 設定環境變數（保護金鑰）
- 在 Pages 專案頁面 → **Settings** → **Environment variables**
- 新增變數：
  - `GEMINI_API_KEY` = 你的 API Key
- 建議在 **Production** 和 **Preview** 兩個環境都加上。

### 5) 測試
- 部署完成後，開啟你的 URL（例如 `https://spark-quotes.pages.dev`）
- 輸入主題，點「生成語錄」，應該就會看到金句輸出。

---

## 本機開發（可選）

如果你想在本機測試 Functions：

1. 安裝 Node.js（僅供 pages dev 使用）
2. 安裝 Cloudflare CLI：
   ```bash
   npm create cloudflare@latest
   ```
   或直接使用 `npx wrangler pages dev`：
   ```bash
   npx wrangler pages dev .
   ```
3. 在本機注入環境變數：
   ```bash
   export GEMINI_API_KEY=你的金鑰
   npx wrangler pages dev .
   ```
4. 開瀏覽器打開顯示的本機 URL 測試。

> 備註：`functions/` 目錄採用 Pages Functions（Deno Runtime），程式內使用原生 `fetch`。

---

## 常見問題 FAQ

**Q1. 401 / 403 錯誤**
- 檢查 `GEMINI_API_KEY` 是否有設定在 Pages 的 **Environment variables**
- 金鑰是否失效或權限不足。

**Q2. 部署完成但 `/api/generate` 找不到**
- 確認路徑是 `functions/api/generate.ts`
- 確認不是放到 `worker/` 或 `src/`；Pages Functions 必須在專案根目錄的 `functions/`。

**Q3. 要不要裝框架？**
- 本專案用純 HTML + Functions，足夠課程繳交。
- 若要擴充 UI，可改用 React/Vite；部署方式相同（輸出到 `dist/`，並保留 `functions/` 目錄）。

**Q4. 金鑰安全嗎？**
- 金鑰只存在於 Cloudflare 後端環境變數，前端看不到。
- 請**勿**把金鑰寫在前端或 `.env` 後直接 commit。

---

## 繳交作業（NTU Cool）
- 取得 Pages 的 **Production URL**（例如 `https://你的專案.pages.dev`）
- 貼上到 NTU Cool 的作業提交欄位即可。建議同時附上 GitHub repo 連結。

---

## 延伸方向
- 加上「隨機主題」按鈕、分享成圖片（Canvas）
- 新增 /api/health 健康檢查路由
- 儲存我的最愛（LocalStorage 或簡單 KV）
- 將語錄輸出成海報圖（可再接 Cloudflare Images 或第三方繪圖 API）

---

MIT License · 2025
