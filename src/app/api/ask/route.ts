import { NextResponse } from "next/server";

/**
 * POST /api/ask — «Спроси ИИ» о вариантах, плане, сайте Qadam и поступлении в КЗ.
 * Прокси к OpenRouter (free-модель). Ключ живёт ТОЛЬКО на сервере (.env.local).
 * Скоуп строго ограничен: образование, поступление и сам сайт Qadam.
 * Контекст: профиль абитуриента (вкл. желаемые специальности и оценки экзаменов).
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
    desiredMajors?: string[];
    budgetPerYearTenge?: number;
    budgetAny?: boolean;
    studyLanguage?: string;
    entEstimate?: number | null;
    ieltsEstimate?: number | null;
    satEstimate?: number | null;
    needsDorm?: boolean;
    countries?: string;
    plannedExams?: string[];
    targetYear?: number;
    priority?: string[];
  };
}

const SYSTEM: Record<"ru" | "kk" | "en", string> = {
  ru: `Ты — консультант Qadam, сервиса персональных маршрутов поступления в Казахстане. Ты помогаешь абитуриенту 9–11 класса.

ТЕМА (СКОУП): ты отвечаешь ТОЛЬКО про (1) поступление и университеты Казахстана, (2) образование, экзамены (ЕНТ, IELTS, SAT), гранты и стипендии, (3) сам сайт Qadam — как им пользоваться, что означают совместимость, план и разделы. На любые другие темы (спорт, музыка, код, новости, политика, медицина для себя и т.п.) отвечай одной фразой: «Я отвечаю только на вопросы о поступлении, образовании и сайте Qadam» — и предложи вернуться к теме.

Правила: отвечай кратко (до 120 слов), по делу; опирайся ТОЛЬКО на данные профиля из контекста; не выдумывай дедлайны, цены и баллы — если данных нет, скажи, что проверить на официальных сайтах (entec.gov.kz, e.gov.kz, сайты вузов); не гарантируй поступление; объясняй «почему», а не просто «что». Отвечай на языке вопроса (ru/kk/en).`,
  kk: `Сен — Қазақстандағы жеке түсу маршруттарының Qadam қызметінің кеңесшісің. 9–11 сынып абитуриентіне көмектесесің.

ТАҚЫРЫП (СКОУП): тек (1) ҚР-дағы түсу мен университеттер, (2) білім, емтихандар (ЖБТ, IELTS, SAT), гранттар мен стипендиялар, (3) Qadam сайтының өзі — қалай пайдалану, үйлесімділік пен жоспардың мәні. Басқа тақырыптарда бір сөйлеммен жауап бер: «Мен тек түсу, білім және Qadam сайты туралы сұрақтарға жауап беремін».

Ережелер: қысқа жауап бер (120 сөзге дейін); тек контекстегі профильге сүйен; дедлайн/баға/бал ойлап таппа; кепілдік берме; «неге» деп түсіндір. Сұрақ тілінде жауап бер.`,
  en: `You are a Qadam consultant — a service of personal admission routes in Kazakhstan, helping school applicants in grades 9–11.

TOPIC SCOPE: you answer ONLY about (1) admission and universities in Kazakhstan, (2) education, exams (ENT, IELTS, SAT), grants and scholarships, (3) the Qadam site itself — how to use it, what fit scores and the plan mean. For any other topic, reply with one sentence: "I only answer questions about admission, education and the Qadam site" — and invite the user back on topic.

Rules: answer briefly (up to 120 words); ground yourself ONLY in the profile in context; never invent deadlines, prices or scores — say what to verify on official websites; never guarantee admission; explain "why", not just "what". Reply in the language of the question.`,
};

function buildContext(body: AskBody): string {
  const p = body.profile ?? {};
  const lines: string[] = [];
  const budget = p.budgetAny ? "не ограничен" : `${p.budgetPerYearTenge ?? "?"} ₸/год`;
  lines.push(
    `Профиль: класс ${p.grade ?? "?"}, город ${p.city ?? "?"}, язык обучения ${p.studyLanguage ?? "?"}, бюджет ${budget}, общежитие ${p.needsDorm ? "нужен" : "не нужен"}, география ${p.countries === "kz+abroad" ? "КЗ + за рубеж" : "КЗ"}, экзамены ${(p.plannedExams ?? []).join(", ")}, выпуск/поступление ${p.targetYear ?? "?"}, приоритеты ${(p.priority ?? []).join(" > ")}, прогноз ЕНТ ${p.entEstimate ?? "не указан"}${p.ieltsEstimate ? `, IELTS ${p.ieltsEstimate}` : ""}${p.satEstimate ? `, SAT ${p.satEstimate}` : ""}.`,
  );
  lines.push(`Интересы (предметы): ${(p.interests ?? []).join(", ") || "не указаны"}.`);
  lines.push(`Желаемые специальности: ${(p.desiredMajors ?? []).join(", ") || "не указаны"}.`);
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
          "HTTP-Referer": "https://qadam.edu.kz",
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
