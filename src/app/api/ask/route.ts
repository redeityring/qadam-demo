import { NextResponse } from "next/server";

/**
 * POST /api/ask — «Спроси ИИ» о вариантах и плане.
 * Прокси к OpenRouter (free-модель). Ключ живёт ТОЛЬКО на сервере (.env.local).
 * Контекст: профиль абитуриента + топ-3 рекомендации + первые шаги плана.
 */

export const runtime = "nodejs";
export const maxDuration = 30;

const MODELS = [
  process.env.OPENROUTER_MODEL, // можно переопределить в .env
  "inclusionai/ling-3.0-flash-vl:free",
  "nvidia/nemotron-3-ultra-550b-a55b:free",
  "z-ai/glm-5.2:free",
  "google/gemma-4-31b-it:free",
].filter((m): m is string => Boolean(m));

interface AskBody {
  question?: string;
  lang?: "ru" | "kk" | "en";
  profile?: {
    grade?: number;
    city?: string;
    interests?: string[];
    budgetPerYearTenge?: number;
    studyLanguage?: string;
    entEstimate?: number | null;
    needsDorm?: boolean;
    countries?: string;
    plannedExams?: string[];
    targetYear?: number;
    priority?: string[];
  };
}

const SYSTEM: Record<"ru" | "kk" | "en", string> = {
  ru: `Ты — консультант Qadam, сервиса персональных маршрутов поступления в Казахстане. Ты помогаешь абитуриенту 9–11 класса разобраться в его вариантах. Правила: отвечай кратко (до 120 слов), по делу, человеческим языком; опирайся ТОЛЬКО на данные профиля и варианты из контекста; не выдумывай дедлайны, цены и баллы — если данных нет, скажи, что стоит проверить на официальных сайтах (entec.gov.kz, e.gov.kz, сайты вузов); не гарантируй поступление; объясняй «почему», а не просто «что». Отвечай на языке вопроса (ru/kk/en).`,
  kk: `Сен — Қазақстандағы жеке түсу маршруттарының Qadam қызметінің кеңесшісің. Сiggs: қысқа жауап бер (120 сөзге дейін), тек профиль мен контекстегі нұсқаларға сүйен, дедлайн/баға/бал ойлап таппа, кепілдік берме, «неге» деп түсіндір. Сұрақ тілінде жауап бер.`,
  en: `You are a Qadam consultant — a service of personal admission routes in Kazakhstan. Rules: answer briefly (up to 120 words), ground yourself ONLY in the profile and options in context; never invent deadlines, prices or scores — say what to verify on official websites; never guarantee admission; explain "why", not just "what". Reply in the language of the question.`,
};

function buildContext(body: AskBody): string {
  const p = body.profile ?? {};
  const lines: string[] = [];
  lines.push(`Профиль: класс ${p.grade ?? "?"}, город ${p.city ?? "?"}, язык обучения ${p.studyLanguage ?? "?"}, бюджет ${p.budgetPerYearTenge ?? "?"} ₸/год, общежитие ${p.needsDorm ? "нужен" : "не нужен"}, география ${p.countries === "kz+abroad" ? "КЗ + за рубеж" : "КЗ"}, экзамены ${(p.plannedExams ?? []).join(", ")}, выпуск/поступление ${p.targetYear ?? "?"}, приоритеты ${(p.priority ?? []).join(" > ")}, прогноз ЕНТ ${p.entEstimate ?? "не указан"}.`);
  lines.push(`Интересы: ${(p.interests ?? []).join(", ") || "не указаны"}.`);
  return lines.join("\n");
}

export async function POST(req: Request) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "AI is not configured. Add OPENROUTER_API_KEY to .env.local (see README)." },
      { status: 503 },
    );
  }

  let body: AskBody;
  try {
    body = (await req.json()) as AskBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const question = (body.question ?? "").trim().slice(0, 300);
  if (!question) {
    return NextResponse.json({ error: "Empty question" }, { status: 400 });
  }

  const lang = body.lang === "kk" || body.lang === "en" ? body.lang : "ru";
  const context = buildContext(body);

  let lastError = "unknown";

  for (const model of MODELS.slice(0, 3)) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 25_000);

      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          // Заголовки OpenRouter рекомендует указывать, но они опциональны:
          "HTTP-Referer": "https://qadam.kz",
          "X-Title": "Qadam",
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: SYSTEM[lang] },
            { role: "user", content: `${context}\n\nВопрос абитуриента: ${question}` },
          ],
          max_tokens: 1200, // запас: reasoning-модели тратят токены на рассуждение
          temperature: 0.4,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!res.ok) {
        lastError = `${model}: HTTP ${res.status}`;
        continue;
      }

      const data = (await res.json()) as {
        choices?: Array<{ message?: { content?: string } }>;
      };
      const answer = data.choices?.[0]?.message?.content?.trim();
      if (answer) {
        return NextResponse.json({ answer, model });
      }
      lastError = `${model}: empty completion`;
    } catch (e) {
      lastError = `${model}: ${e instanceof Error ? e.message : "error"}`;
    }
  }

  return NextResponse.json({ error: `AI unavailable (${lastError})` }, { status: 502 });
}
