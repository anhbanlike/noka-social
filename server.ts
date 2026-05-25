import express from 'express';
import path from 'path';
import cors from 'cors';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Initialize Gemini on the server securely
const geminiApiKey = process.env.GEMINI_API_KEY || '';

const ai = geminiApiKey
  ? new GoogleGenAI({
      apiKey: geminiApiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// API routes FIRST
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    serverTime: new Date().toISOString(),
    aiConfigured: !!ai,
  });
});

// Telegram virtual secure bot chat handler
app.post('/api/telegram/chat', async (req, res) => {
  const { message, platformList, passwordCount, language } = req.body;

  if (!message) {
    res.status(400).json({ error: 'Message payload is required' });
    return;
  }

  // Fallback if Gemini is not configured
  if (!ai) {
    // Generate a simple keyword-based matching mock response so the bot works even without an API key!
    const msgLower = message.toLowerCase();
    let reply = '';
    
    if (language === 'vi') {
      reply = `🤖 [Noka Guard] Đã nhận được tin nhắn: "${message}".\n\nHệ thống đang chạy offline không có khóa API Gemini. Tuy nhiên, tôi đã quét danh bạ cục bộ của bạn:\n• Tổng số nền tảng: ${platformList?.length || 0}\n• Số tài khoản bảo mật: ${passwordCount || 0}\n\nCách bảo mật khuyên dùng: Luôn bật mật khẩu 2 lớp (MFA/Cấp 2) cho mọi tài khoản mạng xã hội!`;
    } else if (language === 'zh') {
      reply = `🤖 [Noka Guard] 收到消息: "${message}"。\n\n系统当前处于本地演示模式（未配置 Gemini 秘钥）。我已为您检索本地数据库：\n• 平台配额：${platformList?.length || 0} 个\n• 存储凭证数：${passwordCount || 0} 个\n\n安全建议：为所有的社交媒体账号启用多层次安全防护 (MFA/2层密码)！`;
    } else {
      reply = `🤖 [Noka Guard] I received: "${message}".\n\n(Note: Gemini API key is not configured in Secrets). Here is your local vault briefing:\n• Platforms configured: ${platformList?.length || 0}\n• Stored credentials: ${passwordCount || 0}\n\nSecurity Audit: We strongly recommend adding Tier 2 backup codes or dynamic MFA to your configurations!`;
    }
    res.json({ text: reply });
    return;
  }

  try {
    const formattedPlatforms = (platformList || [])
      .map((p: any) => `- Nền tảng: ${p.name} (Tài khoản: ${p.accounts || 'Chưa cài đặt'})`)
      .join('\n');

    const systemInstruction = `
You are "Noka Guard", an ultra-exclusive luxury cybersecurity assistant bot for Noka Social (Vietnamese top-tier Password Manager SaaS).
Your tone is sophisticated, reassuring, authoritative, and extremely premium.
You must speak primarily in the language chosen by the user or dynamically transition (Vietnamese 'vi', English 'en', or Chinese 'zh').
You are briefed on these safety statistics of the active user:
- Stored Platforms: ${platformList?.length || 0}
- Stored Passwords/Accounts count: ${passwordCount || 0}
- Stored Configuration details:
${formattedPlatforms || 'No platforms configured yet.'}

CRITICAL RULES:
1. Never reveal, invent, or speculate on any raw password string. Keep credentials strictly confidential.
2. If the user asks for a specific account such as "facebook" or "instagram", reply by confirming if they have it stored in Noka, listing its nickname/identity if available, and advising how to make it safer (e.g. "Cấp 2/MFA backup codes").
3. Do not overcomplicate of write lengthy instructions. Keep paragraphs rich, elegant and concise.
4. Support Markdown styling beautifully with borders and bullet points.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: message,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      },
    });

    res.json({ text: response.text || 'Error generating reply.' });
  } catch (err: any) {
    console.error('Gemini error:', err);
    res.status(500).json({ error: err.message || 'Error processing request' });
  }
});

// Serve frontend assets in production/development
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Noka Social fullstack server initialized and active on port ${PORT}`);
  });
}

startServer();
