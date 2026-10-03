import { describe, expect, it } from 'vitest';

import { addDays, daysBetween, formatDuration, startOfWeek, toISODate } from '../src/dates.js';

describe('datas', () => {
  it('formata uma data como YYYY-MM-DD com padding', () => {
    expect(toISODate(new Date(2026, 0, 5))).toBe('2026-01-05');
    expect(toISODate(new Date(2026, 11, 31))).toBe('2026-12-31');
  });

  it('desloca datas para frente e para trás', () => {
    expect(addDays('2026-01-05', 1)).toBe('2026-01-06');
    expect(addDays('2026-01-01', -1)).toBe('2025-12-31');
  });

  it('atravessa a virada de mês corretamente', () => {
    expect(addDays('2026-01-31', 1)).toBe('2026-02-01');
  });

  it('atravessa a virada de ano corretamente', () => {
    expect(addDays('2025-12-31', 1)).toBe('2026-01-01');
  });

  it('lida com ano bissexto', () => {
    expect(addDays('2028-02-28', 1)).toBe('2028-02-29');
  });

  it('calcula a diferença em dias', () => {
    expect(daysBetween('2026-01-01', '2026-01-01')).toBe(0);
    expect(daysBetween('2026-01-01', '2026-01-08')).toBe(7);
    expect(daysBetween('2026-01-08', '2026-01-01')).toBe(-7);
  });

  it('encontra a segunda-feira da semana', () => {
    // 2026-01-07 é uma quarta-feira.
    expect(startOfWeek('2026-01-07')).toBe('2026-01-05');
    // Domingo também deve voltar para a segunda anterior.
    expect(startOfWeek('2026-01-11')).toBe('2026-01-05');
    // Segunda já é o início.
    expect(startOfWeek('2026-01-05')).toBe('2026-01-05');
  });

  it('formata durações de forma legível', () => {
    expect(formatDuration(45)).toBe('45min');
    expect(formatDuration(60)).toBe('1h');
    expect(formatDuration(90)).toBe('1h 30min');
    expect(formatDuration(125)).toBe('2h 5min');
  });
});