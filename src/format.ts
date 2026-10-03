/**
 * Formatação da saída para o terminal.
 */

import { formatDuration } from './dates.js';
import type { DailyStat, StudySession, TopicStat } from './types.js';
import { minutesInLastWeeks } from './stats.js';

/** Alinha colunas em largura fixa, lidando com caracteres acentuados. */
function pad(value: string, width: number): string {
  // [...value] evita problemas com emoji e caracteres compounds.
  const length = [...value].length;
  return value + ' '.repeat(Math.max(0, width - length));
}

/** Tabela de sessões registradas. */
export function formatSessions(sessions: StudySession[]): string {
  if (sessions.length === 0) {
    return 'Nenhuma sessão registrada ainda. Comece com: devlog add "Python" --minutes 30';
  }

  const header = `${pad('ID', 4)}${pad('DATA', 12)}${pad('MIN', 6)}${pad('ASSUNTO', 20)}NOTA`;
  const rows = sessions.map((session) => {
    const note = session.note ? `  ${session.note}` : '';
    return `${pad(String(session.id), 4)}${pad(session.date, 12)}${pad(
      String(session.minutes),
      6,
    )}${pad(session.topic, 20)}${note}`;
  });

  const total = sessions.reduce((sum, session) => sum + session.minutes, 0);
  return [
    header,
    '-'.repeat(Math.max(header.length, 52)),
    ...rows,
    '',
    `${sessions.length} sessão(ões) · ${formatDuration(total)} no total`,
  ].join('\n');
}

/** Relatório geral de progresso. */
export function formatStats(
  sessions: StudySession[],
  byTopic: TopicStat[],
  daily: DailyStat[],
): string {
  if (sessions.length === 0) {
    return 'Nada para resumir ainda — registre uma sessão primeiro.';
  }

  const totalMinutes = sessions.reduce((sum, session) => sum + session.minutes, 0);
  const average = Math.round(totalMinutes / sessions.length);
  const last7 = minutesInLastWeeks(sessions, 1);
  const last30 = minutesInLastWeeks(sessions, 4);

  const lines = [
    '📊 Resumo de estudos',
    '',
    `Total:        ${formatDuration(totalMinutes)} em ${sessions.length} sessões`,
    `Média:        ${formatDuration(average)} por sessão`,
    `Dias ativos:  ${new Set(sessions.map((s) => s.date)).size}`,
    `Esta semana:  ${formatDuration(last7)}`,
    `Últimas 4sem: ${formatDuration(last30)}`,
  ];

  if (byTopic.length > 0) {
    lines.push('', 'Por assunto:');
    const width = Math.max(...byTopic.map((item) => item.topic.length));
    const max = Math.max(...byTopic.map((item) => item.minutes));
    for (const item of byTopic) {
      const bar = '█'.repeat(Math.max(1, Math.round((item.minutes / max) * 10)));
      const percent = max === 0 ? 0 : Math.round((item.minutes / max) * 100);
      lines.push(
        `  ${pad(item.topic, width)}  ${pad(formatDuration(item.minutes), 9)}${bar} ${percent}%`,
      );
    }
  }

  if (daily.length > 0) {
    lines.push('', 'Últimos dias:');
    for (const day of daily.slice(0, 7)) {
      lines.push(`  ${day.date}  ${pad(formatDuration(day.minutes), 9)} (${day.sessions}x)`);
    }
  }

  return lines.join('\n');
}

/** Mensagem de erro padronizada. */
export function formatError(error: unknown): string {
  return `✖ ${error instanceof Error ? error.message : String(error)}`;
}