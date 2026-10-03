import { describe, expect, it } from 'vitest';

import {
  aggregateByDate,
  aggregateByTopic,
  calculateStreaks,
  computeStats,
  minutesInLastWeeks,
} from '../src/stats.js';
import type { StudySession } from '../src/types.js';

let counter = 0;

/** Cria uma sessão de teste com campos sobrescritíveis. */
function session(overrides: Partial<StudySession> = {}): StudySession {
  counter += 1;
  return {
    id: counter,
    topic: 'Python',
    minutes: 30,
    date: '2026-01-05',
    createdAt: '2026-01-05T10:00:00.000Z',
    ...overrides,
  };
}

describe('calculateStreaks', () => {
  it('devolve zero quando não há registros', () => {
    expect(calculateStreaks([], '2026-01-05')).toEqual({ current: 0, longest: 0 });
  });

  it('conta uma sequência de dias consecutivos', () => {
    const dates = ['2026-01-01', '2026-01-02', '2026-01-03'];
    expect(calculateStreaks(dates, '2026-01-03')).toEqual({ current: 3, longest: 3 });
  });

  it('quebra a sequência quando há um dia faltando', () => {
    const dates = ['2026-01-01', '2026-01-02', '2026-01-04'];
    expect(calculateStreaks(dates, '2026-01-04')).toEqual({ current: 1, longest: 2 });
  });

  it('mantém a sequência atual quando o último registro foi ontem', () => {
    const dates = ['2026-01-02', '2026-01-03'];
    expect(calculateStreaks(dates, '2026-01-04')).toEqual({ current: 2, longest: 2 });
  });

  it('zera a sequência atual quando o último registro é antigo demais', () => {
    const dates = ['2026-01-01', '2026-01-02'];
    expect(calculateStreaks(dates, '2026-01-10')).toEqual({ current: 0, longest: 2 });
  });

  it('ignora datas duplicadas', () => {
    const dates = ['2026-01-05', '2026-01-05', '2026-01-06'];
    expect(calculateStreaks(dates, '2026-01-06')).toEqual({ current: 2, longest: 2 });
  });

  it('encontra o recorde histórico', () => {
    const dates = ['2026-01-01', '2026-01-02', '2026-01-03', '2026-01-05'];
    const result = calculateStreaks(dates, '2026-01-05');
    expect(result.longest).toBe(3);
    expect(result.current).toBe(1);
  });
});

describe('aggregateByTopic', () => {
  it('soma minutos e sessões por assunto', () => {
    const sessions = [
      session({ topic: 'Python', minutes: 30 }),
      session({ topic: 'Python', minutes: 60 }),
      session({ topic: 'TypeScript', minutes: 45 }),
    ];
    expect(aggregateByTopic(sessions)).toEqual([
      { topic: 'Python', minutes: 90, sessions: 2 },
      { topic: 'TypeScript', minutes: 45, sessions: 1 },
    ]);
  });

  it('ordena do maior para o menor tempo', () => {
    const sessions = [
      session({ topic: 'A', minutes: 10 }),
      session({ topic: 'B', minutes: 100 }),
    ];
    expect(aggregateByTopic(sessions)[0]?.topic).toBe('B');
  });

  it('desempata por ordem alfabética', () => {
    const sessions = [session({ topic: 'Zebra', minutes: 30 }), session({ topic: 'Alpha', minutes: 30 })];
    expect(aggregateByTopic(sessions)[0]?.topic).toBe('Alpha');
  });
});

describe('aggregateByDate', () => {
  it('ordena do dia mais recente para o mais antigo', () => {
    const sessions = [
      session({ date: '2026-01-01', minutes: 30 }),
      session({ date: '2026-01-03', minutes: 60 }),
      session({ date: '2026-01-02', minutes: 45 }),
    ];
    const result = aggregateByDate(sessions);
    expect(result.map((day) => day.date)).toEqual(['2026-01-03', '2026-01-02', '2026-01-01']);
    expect(result[0]).toEqual({ date: '2026-01-03', minutes: 60, sessions: 1 });
  });
});

describe('minutesInLastWeeks', () => {
  it('soma apenas a janela solicitada', () => {
    const sessions = [
      session({ date: '2026-01-05', minutes: 30 }),
      session({ date: '2026-01-07', minutes: 60 }),
      session({ date: '2026-01-20', minutes: 999 }),
    ];
    // Semana de 2026-01-05 começa na segunda 2026-01-05.
    expect(minutesInLastWeeks(sessions, 1, '2026-01-07')).toBe(90);
  });

  it('devolve zero quando nada está na janela', () => {
    const sessions = [session({ date: '2020-01-01', minutes: 100 })];
    expect(minutesInLastWeeks(sessions, 1, '2026-01-07')).toBe(0);
  });
});

describe('computeStats', () => {
  it('devolve estatísticas zeradas para lista vazia', () => {
    expect(computeStats([], '2026-01-05')).toEqual({
      totalSessions: 0,
      totalMinutes: 0,
      averageMinutes: 0,
      activeDays: 0,
      currentStreak: 0,
      longestStreak: 0,
      byTopic: [],
    });
  });

  it('calcula o conjunto completo de estatísticas', () => {
    const sessions = [
      session({ date: '2026-01-05', minutes: 30 }),
      session({ date: '2026-01-05', minutes: 60 }),
      session({ date: '2026-01-06', minutes: 30 }),
    ];
    const stats = computeStats(sessions, '2026-01-06');

    expect(stats.totalSessions).toBe(3);
    expect(stats.totalMinutes).toBe(120);
    expect(stats.averageMinutes).toBe(40);
    expect(stats.activeDays).toBe(2);
    expect(stats.currentStreak).toBe(2);
    expect(stats.longestStreak).toBe(2);
  });
});