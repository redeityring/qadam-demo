/**
 * Встроенный ИИ-консультант Qadam (офлайн-движок).
 * Отвечает на типовые вопросы абитуриента о вариантах, плане, бюджете и сайте —
 * строго по данным профиля и каталога, БЕЗ внешнего API-ключа.
 * Если задан OPENROUTER_API_KEY, /api/ask сначала пробует LLM и падает сюда.
 */

import type { Lang } from "@/i18n/dictionaries";
import { MAJOR_L } from "@/i18n/engine";
import { getRecommendations } from "@/lib/engine/recommend";
import { getRoadmap } from "@/lib/engine/roadmap";
import type { Profile } from "@/types";

/* ---------- Локализации ---------- */

const T = {
  intro: {
    ru: (bits: string) => `Проанализировал ваш профиль (${bits}). Вот что важно знать:`,
    kk: (bits: string) => `Профиліңізді талдадым (${bits}). Міне, маңыздысы:`,
    en: (bits: string) => `I analysed your profile (${bits}). Key points:`,
  },
  topOption: {
    ru: (uni: string, major: string, score: number) =>
      `• Топ-вариант: ${major} в ${uni} — совместимость ${score}/100. Он первый, потому что лучше всего совпадают предметы, бюджет и ваш балл ЕНТ.`,
    kk: (uni: string, major: string, score: number) =>
      `• Топ-нұсқа: ${uni} — ${major} — үйлесімділік ${score}/100. Бірінші орында, себебі пәндер, бюджет және ЖБТ балыңыз ең жақсы сәйкес.`,
    en: (uni: string, major: string, score: number) =>
      `• Top option: ${major} at ${uni} — fit ${score}/100. It ranks first because subjects, budget and your ENT estimate align best.`,
  },
  altOptions: {
    ru: (list: string) => `• Альтернативы: ${list}. Выберите 2–3 в сравнение, чтобы увидеть разницу по цене и баллам.`,
    kk: (list: string) => `• Баламалар: ${list}. Баға мен бал айырмашылығын көру үшін 2–3 нұсқаны салыстыруға қосыңыз.`,
    en: (list: string) => `• Alternatives: ${list}. Add 2–3 to Compare to see the price and score difference.`,
  },
  entGrant: {
    ru: (ent: number, min: number | null, list: string) =>
      min == null
        ? `• Грант: с прогнозом ЕНТ ${ent} вы уже проходите на многие программы (${list}). Чем выше балл — тем больше грантов. Точные пороги смотрите на entec.gov.kz.`
        : `• Грант: самый доступный из ваших вариантов — «${list}» (проходной ~${min}*). Ваш прогноз ${ent}${ent >= min ? " — проходите с запасом" : ` — нужно ещё ${min - ent} баллов`}. Пороги каждый год меняются: проверяйте на entec.gov.kz.`,
    kk: (ent: number, min: number | null, list: string) =>
      min == null
        ? `• Грант: ЖБТ болжамы ${ent} — көптеген бағдарламаларға өтесіз (${list}). Бал неғұрлым жоғары болса, грант та соншалықты көп. Нақты шектерді entec.gov.kz тексеріңіз.`
        : `• Грант: ең қолжетімді нұсқа — «${list}» (өту балы ~${min}*). Болжамыңыз ${ent}${ent >= min ? " — қорымен өтесіз" : ` — тағы ${min - ent} балл керек`}. Шектер жыл сайын өзгереді: entec.gov.kz тексеріңіз.`,
    en: (ent: number, min: number | null, list: string) =>
      min == null
        ? `• Grant: with an ENT estimate of ${ent} you already pass several programs (${list}). The higher the score, the more grants open up. Check exact thresholds on entec.gov.kz.`
        : `• Grant: your most accessible option is “${list}” (passing ~${min}*). Your estimate ${ent}${ent >= min ? " passes with a margin" : ` — ${min - ent} more points needed`}. Thresholds change yearly: verify on entec.gov.kz.`,
  },
  firstStep: {
    ru: (step: string, period: string) => `• С чего начать: «${step}» (${period}). Это первый незавершённый пункт вашего плана.`,
    kk: (step: string, period: string) => `• Неден бастау керек: «${step}» (${period}). Бұл жоспарыңыздың орындалмаған бірінші тармағы.`,
    en: (step: string, period: string) => `• Where to start: “${step}” (${period}) — the first unchecked item in your plan.`,
  },
  planSummary: {
    ru: (n: number, done: number) => `• План: ${n} шагов, выполнено ${done}. Отмечайте выполненное — маршрут пересчитывается сам.`,
    kk: (n: number, done: number) => `• Жоспар: ${n} қадам, орындалғаны ${done}. Белгілеңіз — маршрут автоматты жаңарады.`,
    en: (n: number, done: number) => `• Plan: ${n} steps, ${done} done. Check items off — the route recalculates automatically.`,
  },
  abroad: {
    ru: (budget: string, ielts: string) =>
      `• За рубеж: на ${budget} в год реально смотреть Кыргызстан, Узбекистан или гранты (Erasmus+, DAAD, Mevlana). Для англоязычных программ нужен ${ielts}. Реальные расходы считайте на сайтах вузов.`,
    kk: (budget: string, ielts: string) =>
      `• Шетел: жылына ${budget} үшін Қырғызстан, Өзбекстан немесе гранттарға (Erasmus+, DAAD, Mevlana) назар аударыңыз. Ағылшын тілді бағдарламалар үшін ${ielts} керек.`,
    en: (budget: string, ielts: string) =>
      `• Abroad: with ${budget} per year, look at Kyrgyzstan, Uzbekistan or scholarships (Erasmus+, DAAD, Mevlana). English-taught programs require ${ielts}.`,
  },
  howSite: {
    ru: "• Qadam работает так: анкета → диагностика → рекомендации → сравнение → план. Всё меняется мгновенно при правке анкеты, профиль хранится только в вашем браузере.",
    kk: "• Qadam былай жұмыс істейді: сауалнама → диагностика → ұсыныстар → салыстыру → жоспар. Сауалнаманы өзгертсеңіз — бәрі бірден жаңарады, профиль тек браузеріңізде сақталады.",
    en: "• How Qadam works: questionnaire → diagnostics → recommendations → compare → plan. Everything recomputes instantly when you edit the form; your profile stays in your browser only.",
  },
  xp: {
    ru: "• XP: за шаги плана +15, за первый вопрос ИИ за день +10. Уровни: Новичок → Искатель → Стратег → Абитуриент → Мастер поступления.",
    kk: "• XP: жоспар қадамдары үшін +15, күнгі алғашқы ЖИ сұрағы үшін +10. Деңгейлер: Жаңаөспірім → Ізденуші → Стратег → Абитуриент → Түсу шебері.",
    en: "• XP: +15 per plan step, +10 for the first AI question of the day. Levels: Rookie → Seeker → Strategist → Applicant → Admission master.",
  },
  fallback: {
    ru: (q: string) =>
      `Я — встроенный консультант Qadam и отвечаю по данным вашего профиля. Про «${q}» точнее ответит ИИ с доступом в интернет, но по поступлению в Казахстане подскажу уже сейчас:\n\n• Ваши варианты и причины — на экране «Рекомендации».\n• Сроки подачи и экзамены — в «Плане» и «Календаре».\n• Гранты и стипендии — в разделе «Стипендии».\n\nЗадайте вопрос про варианты, гранты, план или сайт Qadam — отвечу предметно.`,
    kk: (q: string) =>
      `Мен — Qadam-ның кірістірілген кеңесшісімін, профиліңіздің деректерімен жауап беремін. «${q}» туралы дәлірек интернеті бар ЖИ жауап береді, бірақ ҚР-дағы оқу туралы қазір де көмектесемін:\n\n• Нұсқаларыңыз — «Ұсыныстар» экранында.\n• Мерзімдер — «Жоспар» мен «Күнтізбеде».\n• Гранттар — «Стипендиялар» бөлімінде.\n\nНұсқалар, гранттар, жоспар немесе Qadam туралы сұраңыз — нақты жауап беремін.`,
    en: (q: string) =>
      `I am Qadam's built-in consultant and answer from your profile data. For “${q}” an AI with internet access would do better, but on studying in Kazakhstan I can already help:\n\n• Your options and reasons — on the Recommendations screen.\n• Deadlines and exams — in Plan and Calendar.\n• Scholarships — in the Scholarships section.\n\nAsk about options, grants, the plan or the Qadam site — I'll answer concretely.`,
  },
  budgetFit: {
    ru: (budget: string, fitting: number, total: number) =>
      `• В бюджет ${budget} в год вписываются ${fitting} из ${total} топ-вариантов. Поднимите бюджет или нацельтесь на госгрант — вариантов станет больше.`,
    kk: (budget: string, fitting: number, total: number) =>
      `• Жылына ${budget} бюджетке топ-нұсқалардан ${fitting} (барлығы ${total}) сай келеді. Бюджетті көбейтіңіз немесе мемлекеттік грантқа үміттеніңіз.`,
    en: (budget: string, fitting: number, total: number) =>
      `• Within your budget of ${budget} per year there are ${fitting} of ${total} top options. Raise the budget or aim for a state grant to see more.`,
  },
  budgetFree: {
    ru: "• Бюджет не ограничен — рекомендации ранжируются по предметам, баллам и силе вуза.",
    kk: "• Бюджет шектеу емес — ұсыныстар пәндер, балл және университет күші бойынша реттеледі.",
    en: "• Budget is not a constraint, so recommendations rank programs by subjects, scores and university strength.",
  },
} as const;

/* ---------- Понимание вопроса ---------- */

type Intent = "top" | "grant" | "plan" | "abroad" | "site" | "xp" | "budget" | "unknown";

const PATTERNS: Array<{ intent: Intent; re: RegExp }> = [
  { intent: "grant", re: /грант|стипенд|балл|ент|жбт|grant|scholarship|ент бал|баллар/i },
  { intent: "plan", re: /план|что делать|перв|дедлайн|срок|документ|roadmap|жоспар|қашан|мерзім|құжат/i },
  { intent: "abroad", re: /за руб|заруб|abroad|шетел|foreign|сша|европ|europe/i },
  { intent: "site", re: /сайт|qadam|как работает|как польз|раздел|экран|сохрани|данн|site|how does|жұмыс істейді/i },
  { intent: "xp", re: /\bxp\b|уровен|level|деңгей/i },
  { intent: "budget", re: /бюджет|дорого|деньги|стоит|платн|кредит|budget|price|құн|ақша|қымбат/i },
  { intent: "top", re: /почему|топ|вариант|рекоменд|лучше|подходит|университет|вуз|поступ|нұсқа|ұсын|қайда|оқу/i },
];

function detectIntent(q: string): Intent {
  for (const { intent, re } of PATTERNS) {
    if (re.test(q)) return intent;
  }
  return "unknown";
}

/* ---------- Формирование ответа ---------- */

export function buildConsultantAnswer(
  profile: Profile,
  lang: Lang,
  question: string,
): { answer: string; kind: "builtin" } {
  const recs = getRecommendations(profile, lang, 6);
  const steps = getRoadmap(profile, lang);
  const doneIds = profile.doneSteps ?? [];
  const done = doneIds.filter((d) => steps.some((s) => s.id === d)).length;
  const lines: string[] = [];

  const fmtBudget = () =>
    profile.budgetAny
      ? "—"
      : `${new Intl.NumberFormat(lang === "en" ? "en-US" : "ru-RU").format(profile.budgetPerYearTenge)} ₸`;

  const uniName = (i: number) => recs[i]?.university.shortName ?? recs[i]?.university.name ?? "—";
  const majorName = (i: number) => {
    const r = recs[i];
    return r ? (MAJOR_L[r.program.majorId][lang] ?? r.program.majorId) : "—";
  };
  const optionList = (from: number, to: number) =>
    recs
      .slice(from, to)
      .map((r) => `${MAJOR_L[r.program.majorId][lang]} (${r.university.shortName ?? r.university.name})`)
      .join("; ");

  const statsBits = [
    `${recs.length} ${lang === "en" ? "options" : lang === "kk" ? "нұсқа" : "вариантов"}`,
    `${lang === "en" ? "class" : lang === "kk" ? "сынып" : "класс"} ${profile.grade}`,
    `ЕНТ/ENT ${profile.entEstimate ?? "—"}`,
  ].join(", ");

  const intent = detectIntent(question);

  switch (intent) {
    case "top": {
      if (recs.length > 0) {
        lines.push(T.intro[lang](statsBits));
        lines.push(T.topOption[lang](uniName(0), majorName(0), recs[0].score));
        if (recs.length > 1) lines.push(T.altOptions[lang](optionList(1, Math.min(4, recs.length))));
      }
      break;
    }
    case "grant": {
      lines.push(T.intro[lang](statsBits));
      const withPassing = recs
        .filter((r) => r.program.historicalPassingENT != null)
        .sort(
          (a, b) => (a.program.historicalPassingENT ?? 999) - (b.program.historicalPassingENT ?? 999),
        );
      const easiest = withPassing[0];
      const label = easiest
        ? `${MAJOR_L[easiest.program.majorId][lang]} — ${easiest.university.shortName ?? easiest.university.name}`
        : optionList(0, Math.min(3, recs.length)) || "—";
      lines.push(T.entGrant[lang](profile.entEstimate ?? 0, easiest?.program.historicalPassingENT ?? null, label));
      break;
    }
    case "plan": {
      const open = steps.find((s) => !doneIds.includes(s.id)) ?? steps[0];
      lines.push(T.intro[lang](statsBits));
      if (open) lines.push(T.firstStep[lang](open.title, open.period[lang]));
      lines.push(T.planSummary[lang](steps.length, done));
      break;
    }
    case "abroad": {
      lines.push(T.intro[lang](statsBits));
      const ielts = profile.plannedExams.includes("ielts")
        ? `IELTS ${profile.ieltsEstimate ? profile.ieltsEstimate.toFixed(1) : ""}`.trim()
        : `IELTS${profile.plannedExams.includes("sat") ? " и SAT" : ""} — запланируйте сдачу`;
      lines.push(T.abroad[lang](fmtBudget(), ielts));
      break;
    }
    case "site": {
      lines.push(T.howSite[lang]);
      break;
    }
    case "xp": {
      lines.push(T.xp[lang]);
      break;
    }
    case "budget": {
      lines.push(T.intro[lang](statsBits));
      if (!profile.budgetAny) {
        const fitting = recs.filter((r) => r.program.tuitionPerYearTenge <= profile.budgetPerYearTenge).length;
        lines.push(T.budgetFit[lang](fmtBudget(), fitting, recs.length));
      } else {
        lines.push(T.budgetFree[lang]);
      }
      break;
    }
    default: {
      lines.push(T.fallback[lang](question.trim().slice(0, 80)));
    }
  }

  // На «узких» интентах без рекомендаций добавляем навигацию по сайту
  if (recs.length === 0 && intent !== "site" && intent !== "xp") {
    lines.push(T.howSite[lang]);
  }

  return { answer: lines.join("\n"), kind: "builtin" };
}

export const CONSULTANT_TAG: Record<Lang, string> = {
  ru: "встроенный",
  kk: "кірістірілген",
  en: "built-in",
};

export const CONSULTANT_NOTE: Record<Lang, string> = {
  ru: "Ответ — встроенный консультант Qadam (офлайн, по вашему профилю). Подключите OPENROUTER_API_KEY для полноценного ИИ.",
  kk: "Жауап — Qadam-ның кірістірілген кеңесшісі (офлайн, профиліңіз бойынша). Толық ЖИ үшін OPENROUTER_API_KEY қосыңыз.",
  en: "Answered by Qadam's built-in consultant (offline, from your profile). Add OPENROUTER_API_KEY for the full AI.",
};
