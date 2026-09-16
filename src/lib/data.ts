import universitiesJson from "@/data/universities.json";
import programsJson from "@/data/programs.json";
import type { Program, University } from "@/types";

/** Загрузка статических данных (JSON лежит в репозитории, с пометками источников) */
export const UNIVERSITIES = universitiesJson as University[];
export const PROGRAMS = programsJson as Program[];

const UNI_BY_ID = new Map(UNIVERSITIES.map((u) => [u.id, u]));

export function getUniversity(id: string): University {
  const u = UNI_BY_ID.get(id);
  if (!u) throw new Error(`Unknown university: ${id}`);
  return u;
}
