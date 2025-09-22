export async function onRequestPost({ request, env }: any) {
  try {
    const { theme = "", style = "", tone = "精煉銳利" } = await request.json().catch(() => ({}));

    if (!env.GEMINI_API_KEY) {
      return new Response(JSON.stringify({ error: "Missing GEMINI_API_KEY environment variable." }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (!theme || typeof theme !== "string") {
      return new Response(JSON.stringify({ error: "請提供主題（theme）。" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const prompt = buildPrompt(theme, style, tone);

    // 改用 2.0-flash，通常權限較新、比較穩
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${env.GEMINI_API_KEY}`;
    const body = {
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.9, maxOutputTokens: 120 }
    };

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    // 先讀文字再嘗試 JSON，避免空回應或 HTML 造成前端解析錯誤
    const raw = await res.text();
    let json: any = null;
    try { json = raw ? JSON.parse(raw) : null; } catch (_) {}

    if (!res.ok) {
      const msg = json?.error?.message || json?.error || raw || `Gemini API error ${res.status}`;
      return new Response(JSON.stringify({ error: msg }), {
        status: res.status || 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    const text = extractText(json) || "（未取得文字輸出）";
    return new Response(JSON.stringify({ text }), {
      headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

function buildPrompt(theme: string, style: string, tone: string) {
  const base = `你是一位中文金句文案家，擅長給創業者、行動派、設計師寫出一看就想收藏的「火種語錄」。
- 語氣：${tone}、具畫面感與行動力，避免陳腔濫調。
- 關鍵主題：${theme}
- 禁忌：避免太宗教、太心靈雞湯、避免用力過猛。
- 請輸出為純文字，不要加引號或前綴。`;

  const variants: Record<string, string> = {
    "金句短詩（兩行）": "格式：兩行對句，總長不超過 30 字。",
    "IG卡片金句（一句）": "格式：一句完成，12~20 字，無標點亦可。",
    "電梯短講開場句": "格式：一句話，帶場景感，適合 8 秒開場。",
    "海報標語（8~12字）": "格式：8~12 字，利於做成海報標語。"
  };
  const tail = style && variants[style] ? variants[style] : "格式：一句高濃度金句，盡量短。";
  return `${base}\n${tail}\n輸出 1 則。`;
}

function extractText(apiResponse: any): string | null {
  try {
    const cands = apiResponse?.candidates || [];
    if (cands.length === 0) return null;
    const parts = cands[0]?.content?.parts || [];
    const text = parts.map((p: any) => p?.text || "").join("");
    return text || null;
  } catch {
    return null;
  }
}
