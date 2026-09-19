# Qadam — personal admission journey (English)

> **Qadam** (Kazakh for “step”) is an AI service that turns an applicant's profile and goal
> into a clear route: where to apply, why it fits, and what to do next.
>
> Full documentation: [README.md](./README.md) (Russian). UI languages: Қазақша / Русский / English.

## The problem
Admission is a chain of dozens of decisions — field, university, exams, documents, deadlines —
and the information is scattered. The case: build a self-contained AI service that takes a user
from a short questionnaire to recommendations and a step-by-step plan (7 required stages,
LOCUS Startup Hackathon 2026, Case 02).

## The solution
Qadam walks the user through 7 stages: landing → profile (7-step questionnaire) → diagnostics →
recommendations (with "why it fits" explanations) → comparison → roadmap → next action.
Extras: deadline calendar, scholarships & grants, saved programs, and an **Ask AI** panel
(OpenRouter free-tier models, with a built-in offline consultant as fallback) that answers
questions with the user's profile in mind — up to 5 questions per day, with explicit consent
before the profile is shared with the model.

## Stack
Next.js 16 + React 19 + TypeScript, Tailwind CSS 4, rule-based recommendation engines,
OpenRouter API (server-side key only), localStorage persistence.

## Architecture
Screens are pure projections of the profile: any answer change instantly recomputes
recommendations and the plan. Scoring: subjects 30 / budget 25 / academics 20 / format 15 /
language 10 + user priorities ±12. Every weight produces a human-language explanation.

## Getting started
```bash
npm install
npm run dev            # Turbopack, http://localhost:3000
npm run dev:webpack    # same app with Webpack (parity scripts)
```
**Ask AI works without any key.** With no `OPENROUTER_API_KEY` it is answered by Qadam's
built-in offline consultant (rule-based, from your profile). Add `OPENROUTER_API_KEY` to
`.env.local` to use a real LLM as well.

## Ask AI: consent, limits and abuse protection
The endpoint `/api/ask` does not trust the client:

- **Strict validation** — question 2–300 chars, language `ru|kk|en`, profile accepted only
  through a whitelist; everything else is dropped. JSON only, body ≤ 8 KB.
- **Explicit consent** — the profile is sent to the model only with
  `consent: { granted: true, version }`. The panel spells out exactly what is sent (an
expandable block with the raw request body) and consent can be revoked with one click.
- **Data minimisation** — favourites, comparison picks and plan checkmarks never leave the
  browser, and no questions are logged.
- **Daily AI limit — 5 questions per visitor per day** (Astana time), tracked in a signed
  httpOnly cookie plus a per-IP safety counter, so clearing cookies does not reset it.
- **Honest degradation** — once the limit is reached the service does not break: the built-in
  consultant answers and the UI says so, including when the limit resets.
- **Burst protection** — max 12 requests per minute per IP, then `429`.

## Test script
Fill the questionnaire → diagnostics → recommendations (check the explanations) → compare two
options → check off roadmap steps (XP grows) → change budget/ENT estimate in the profile
(results recompute instantly) → switch RU/KZ/EN → verify the mobile layout.

## Team roles, sources, limitations
Team roles, data sources (entec.gov.kz, e.gov.kz, ielts.org, university websites), AI/API
details and limitations are in the full [README.md](./README.md). Passing scores and grant
counts are **demo data (2025)**, clearly labelled in the UI.
