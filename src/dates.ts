/**
 * Utilitários de data e tempo.
 *
 * Todas as funções recebem/retornam `YYYY-MM-DD` em horário local para evitar
 * que a diferença de fuso empurre uma sessão para o dia errado no relatório.
 */

/** Formata um `Date` como `YYYY-MM-DD` em horário local. */
export function toISODate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** Converte `YYYY-MM-DD` em `Date` no início do dia local. */
export function fromISODate(iso: string): Date {
  const [year, month, day] = iso.split('-').map(Number);
  if (year === undefined || month === undefined || day === undefined) {
    throw new Error(`Data inválida: ${iso}`);
  }
  return new Date(year, month - 1, day);
}

/** Retorna a data de hoje em `YYYY-MM-DD`. */
export function today(): string {
  return toISODate(new Date());
}

/**
 * Desloca uma data ISO em um número de dias.
 * Aceita valores negativos para voltar no tempo.
 */
export function addDays(iso: string, days: number): string {
  const date = fromISODate(iso);
  date.setDate(date.getDate() + days);
  return toISODate(date);
}

/** Diferença em dias inteiros entre duas datas ISO (`b - a`). */
export function daysBetween(a: string, b: string): number {
  const msPerDay = 24 * 60 * 60 * 1000;
  const diff = fromISODate(b).getTime() - fromISODate(a).getTime();
  return Math.round(diff / msPerDay);
}

/** Segunda-feira da semana da data informada. */
export function startOfWeek(iso: string): string {
  const date = fromISODate(iso);
  const weekday = date.getDay(); // 0 = domingo
  const offset = weekday === 0 ? -6 : 1 - weekday;
  return addDays(iso, offset);
}

/** Formata minutos como `1h 30min` ou `45min`. */
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}min`;
  }
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest === 0 ? `${hours}h` : `${hours}h ${rest}min`;
}