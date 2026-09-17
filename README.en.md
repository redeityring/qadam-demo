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
(OpenRouter free-tier models) that answers questions with the user's profile in mind.

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
npm run dev   # http://localhost:3000
```
For Ask AI, add `OPENROUTER_API_KEY` to `.env.local` (see README.md).

## Test script
Fill the questionnaire → diagnostics → recommendations (check the explanations) → compare two
options → check off roadmap steps (XP grows) → change budget/ENT estimate in the profile
(results recompute instantly) → switch RU/KZ/EN → verify the mobile layout.

## Team roles, sources, limitations
Team roles, data sources (entec.gov.kz, e.gov.kz, ielts.org, university websites), AI/API
details and limitations are in the full [README.md](./README.md). Passing scores and grant
counts are **demo data (2025)**, clearly labelled in the UI.
