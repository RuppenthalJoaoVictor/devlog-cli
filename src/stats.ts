/**
 * Cálculo de estatísticas a partir das sessões registradas.
 *
 * Todas as funções são puras: recebem as sessões e devolvem o resultado, o que
 * as torna triviais de testar sem tocar em arquivo ou relógio.
 */

import type { DailyStat, Stats, StudySession, TopicStat } from './types.js';
import { addDays, daysBetween, startOfWeek, today } from './dates.js';

/** Constrói o mapa data -> sessões, para consultas O(1) no cálculo de streak. */
function groupByDate(sessions: StudySession[]): Map<string, StudySession[]> {
  const map = new Map<string, StudySession[]>();
  for (const session of sessions) {
    const bucket = map.get(session.date);
    if (bucket) {
      bucket.push(session);
    } else {
      map.set(session.date, [session]);
    }
  }
  return map;
}

/**
 * Calcula as sequências (streaks) de dias consecutivos.
 *
 * A sequência atual conta a partir de hoje ou de ontem: se o usuário não
 * estudou hoje, mas estudou ontem, a sequência continua válida. Se o último
 * registro for mais antigo que isso, a sequência atual é zero.
 */
export function calculateStreaks(
  dates: Iterable<string>,
  reference: string = today(),
): { current: number; longest: number } {
  const unique = [...new Set(dates)].sort();
  if (unique.length === 0) {
    return { current: 0, longest: 0 };
  }

  let longest = 1;
  let run = 1;
  for (let i = 1; i < unique.length; i += 1) {
    const previous = unique[i - 1]!;
    const current = unique[i]!;
    run = daysBetween(previous, current) === 1 ? run + 1 : 1;
    if (run > longest) {
      longest = run;
    }
  }

  const last = unique[unique.length - 1]!;
  const gap = daysBetween(last, reference);
  let current = 0;
  if (gap === 0 || gap === 1) {
    let counter = 1;
    for (let i = unique.length - 1; i > 0; i -= 1) {
      if (daysBetween(unique[i - 1]!, unique[i]!) === 1) {
        counter += 1;
      } else {
        break;
      }
    }
    current = counter;
  }

  return { current, longest };
}

/** Agrega minutos e sessões por assunto, ordenando do maior para o menor. */
export function aggregateByTopic(sessions: StudySession[]): TopicStat[] {
  const totals = new Map<string, TopicStat>();
  for (const { topic, minutes } of sessions) {
    const entry = totals.get(topic);
    if (entry) {
      entry.minutes += minutes;
      entry.sessions += 1;
    } else {
      totals.set(topic, { topic, minutes, sessions: 1 });
    }
  }
  return [...totals.values()].sort(
    (a, b) => b.minutes - a.minutes || a.topic.localeCompare(b.topic),
  );
}

/** Agrega minutos e sessões por dia, do mais recente para o mais antigo. */
export function aggregateByDate(sessions: StudySession[]): DailyStat[] {
  const totals = new Map<string, DailyStat>();
  for (const { date, minutes } of sessions) {
    const entry = totals.get(date);
    if (entry) {
      entry.minutes += minutes;
      entry.sessions += 1;
    } else {
      totals.set(date, { date, minutes, sessions: 1 });
    }
  }
  return [...totals.values()].sort((a, b) => b.date.localeCompare(a.date));
}

/** Soma os minutos das sessões registradas dentro de uma janela de semanas. */
export function minutesInLastWeeks(
  sessions: StudySession[],
  weeks: number,
  reference: string = today(),
): number {
  const since = startOfWeek(addDays(reference, -7 * (weeks - 1)));
  return sessions
    .filter((session) => session.date >= since && session.date <= reference)
    .reduce((sum, session) => sum + session.minutes, 0);
}

/** Calcula o conjunto completo de estatísticas de um conjunto de sessões. */
export function computeStats(
  sessions: StudySession[],
  reference: string = today(),
): Stats {
  const totalMinutes = sessions.reduce((sum, session) => sum + session.minutes, 0);
  const byDate = groupByDate(sessions);
  const { current, longest } = calculateStreaks(byDate.keys(), reference);

  return {
    totalSessions: sessions.length,
    totalMinutes,
    averageMinutes:
      sessions.length === 0 ? 0 : Math.round(totalMinutes / sessions.length),
    activeDays: byDate.size,
    currentStreak: current,
    longestStreak: longest,
    byTopic: aggregateByTopic(sessions),
  };
}