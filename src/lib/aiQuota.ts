/**
 * Суточная квота ИИ-обращений (только сервер).
 *
 * Учёт двойной, чтобы лимит нельзя было обойти простым сбросом cookie:
 *   1) подписанная httpOnly-cookie — основной счётчик на браузер;
 *   2) карта «IP → счётчик» в памяти процесса — страховка от сброса cookie
 *      и от параллельных вкладок.
 *
 * Эффективная трата = max(cookie, IP). Cookie защищена HMAC: подделать
 * значение (или «обнулить» его) не получится без серверного секрета.
 *
 * День считается по времени Астаны (UTC+5) — как дедлайны кейса LOCUS.
 */

import { createHmac, timingSafeEqual } from "node:crypto";
import { AI_DAILY_LIMIT } from "@/lib/aiPolicy";

export const AI_COOKIE = "qadam.ai.quota.v1";

/** Часовой пояс, по которому наступает новый «ИИ-день» */
const TIMEZONE = "Asia/Almaty";
/** Смещение Астаны от UTC (Казахстан живёт по единому UTC+5 без перехода на летнее время) */
const TZ_OFFSET_HOURS = 5;

const dayFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: TIMEZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/** Календарный день ИИ-квоты в формате YYYY-MM-DD по Астане */
export function quotaDay(now: Date = new Date()): string {
  return dayFormatter.format(now);
}

/** Момент сброса квоты — ближайшая полночь по Астане (ISO-8601) */
export function quotaResetAt(now: Date = new Date()): string {
  const [y, m, d] = quotaDay(now).split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + 1, -TZ_OFFSET_HOURS)).toISOString();
}

/** Лимит обращений: константа из политики, переопределяемая переменной окружения */
export function aiDailyLimit(): number {
  const raw = Number(process.env.AI_DAILY_LIMIT);
  return Number.isFinite(raw) && raw > 0 ? Math.floor(raw) : AI_DAILY_LIMIT;
}

/* ---------- Подпись значения cookie ---------- */

function secret(): string {
  // Отдельный секрет квоты; если не задан — используем ключ ИИ или локальный дефолт,
  // чтобы демо работало без настройки (в README описан AI_QUOTA_SECRET).
  return process.env.AI_QUOTA_SECRET ?? process.env.OPENROUTER_API_KEY ?? "qadam-local-quota";
}

function sign(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("base64url").slice(0, 22);
}

export interface Quota {
  day: string;
  used: number;
}

/** Разбор значения cookie: null — если значение отсутствует, просрочено или подделано */
export function parseQuota(raw: string | undefined | null, today: string = quotaDay()): Quota | null {
  const value = (raw ?? "").trim();
  if (!value) return null;

  const [day, usedRaw, signature] = value.split(".");
  if (!day || !usedRaw || !signature) return null;
  if (day !== today) return null; // новый день — счётчик начинается с нуля

  const expected = sign(`${day}.${usedRaw}`);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  const used = Number(usedRaw);
  if (!Number.isInteger(used) || used < 0 || used > 100_000) return null;

  return { day, used };
}

/** Сериализация счётчика для cookie (значение подписано) */
export function serializeQuota(quota: Quota): string {
  return `${quota.day}.${quota.used}.${sign(`${quota.day}.${quota.used}`)}`;
}

/* ---------- Страховочный счётчик по IP ---------- */

interface IpRecord extends Quota {
  touched: number;
}

const ipUsage = new Map<string, IpRecord>();

function pruneIpUsage(now: number, today: string) {
  if (ipUsage.size < 2000) return;
  for (const [ip, rec] of ipUsage) {
    if (rec.day !== today || now - rec.touched > 1000 * 60 * 60 * 6) ipUsage.delete(ip);
  }
}

export function ipUsed(ip: string, today: string = quotaDay()): number {
  const rec = ipUsage.get(ip);
  return rec && rec.day === today ? rec.used : 0;
}

export function bumpIp(ip: string, today: string = quotaDay()): number {
  const now = Date.now();
  pruneIpUsage(now, today);
  const rec = ipUsage.get(ip);
  const used = (rec && rec.day === today ? rec.used : 0) + 1;
  ipUsage.set(ip, { day: today, used, touched: now });
  return used;
}

/* ---------- Защита от всплесков (грубый per-IP rate limit) ---------- */

/** Сколько запросов к эндпоинту принимаем с одного IP в минуту */
export const AI_BURST_LIMIT = 12;

const burstWindows = new Map<string, { windowStart: number; count: number }>();

/** true — запрос в пределах минутного окна; false — нужно ответить 429 */
export function allowBurst(ip: string): boolean {
  const now = Date.now();
  const win = burstWindows.get(ip);
  if (!win || now - win.windowStart > 60_000) {
    burstWindows.set(ip, { windowStart: now, count: 1 });
    return true;
  }
  win.count += 1;
  if (burstWindows.size > 4000) {
    for (const [key, value] of burstWindows) {
      if (now - value.windowStart > 60_000) burstWindows.delete(key);
    }
  }
  return win.count <= AI_BURST_LIMIT;
}

/** Чтение конкретного cookie из заголовка запроса (без внешних зависимостей) */
export function readCookie(req: Request, name: string): string | undefined {
  const header = req.headers.get("cookie");
  if (!header) return undefined;
  for (const part of header.split(";")) {
    const idx = part.indexOf("=");
    if (idx < 0) continue;
    if (part.slice(0, idx).trim() !== name) continue;
    try {
      return decodeURIComponent(part.slice(idx + 1).trim());
    } catch {
      return part.slice(idx + 1).trim();
    }
  }
  return undefined;
}

/** IP клиента за прокси (Vercel/nginx) с безопасным фолбэком */
export function clientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim().slice(0, 60) || "unknown";
  return (req.headers.get("x-real-ip") ?? "unknown").slice(0, 60);
}
