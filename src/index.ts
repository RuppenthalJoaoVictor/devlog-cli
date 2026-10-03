#!/usr/bin/env node
/**
 * devlog — registro de sessões de estudo pela linha de comando.
 */

import { Command } from 'commander';

import { today } from './dates.js';
import { formatDuration } from './dates.js';
import { formatError, formatSessions, formatStats } from './format.js';
import {
  aggregateByDate,
  aggregateByTopic,
  computeStats,
} from './stats.js';
import {
  createSession,
  defaultPath,
  filterSessions,
  loadSessions,
  removeSession,
  saveSessions,
} from './storage.js';

const program = new Command();

program
  .name('devlog')
  .description('Registre sessões de estudo e acompanhe seu progresso.')
  .version('0.1.0');

program
  .command('add')
  .description('Registra uma nova sessão de estudo.')
  .argument('<topic>', 'assunto estudado')
  .option('-m, --minutes <number>', 'duração em minutos', '30')
  .option('-d, --date <YYYY-MM-DD>', 'data da sessão (padrão: hoje)', today())
  .option('-n, --note <text>', 'anotação opcional')
  .action((topic: string, options: { minutes: string; date: string; note?: string }) => {
    const minutes = Number.parseInt(options.minutes, 10);
    if (!Number.isInteger(minutes) || minutes <= 0) {
      throw new Error(`Minutos inválidos: "${options.minutes}". Use um inteiro positivo.`);
    }

    const sessions = loadSessions();
    const session = createSession(sessions, {
      topic,
      minutes,
      date: options.date,
      ...(options.note === undefined ? {} : { note: options.note }),
    });

    saveSessions([...sessions, session]);
    console.log(
      `✔ Sessão #${session.id} registrada: ${formatDuration(minutes)} de ${topic} em ${session.date}`,
    );
  });

program
  .command('list')
  .description('Lista as sessões registradas.')
  .option('-t, --topic <name>', 'filtra por assunto')
  .option('-f, --from <YYYY-MM-DD>', 'data inicial (inclusive)')
  .option('--to <YYYY-MM-DD>', 'data final (inclusive)')
  .action((options: { topic?: string; from?: string; to?: string }) => {
    const sessions = filterSessions(loadSessions(), {
      ...(options.topic === undefined ? {} : { topic: options.topic }),
      ...(options.from === undefined ? {} : { from: options.from }),
      ...(options.to === undefined ? {} : { to: options.to }),
    });
    console.log(formatSessions(sessions));
  });

program
  .command('stats')
  .description('Mostra o resumo de progresso.')
  .action(() => {
    const sessions = loadSessions();
    const stats = computeStats(sessions);
    console.log(formatStats(sessions, stats.byTopic, aggregateByDate(sessions)));
    console.log(
      `\nSequência atual: ${stats.currentStreak} dia(s) · recorde: ${stats.longestStreak} dia(s)`,
    );
  });

program
  .command('topics')
  .description('Lista os assuntos com o tempo total de cada um.')
  .action(() => {
    const sessions = loadSessions();
    const topics = aggregateByTopic(sessions);
    if (topics.length === 0) {
      console.log('Nenhum assunto registrado ainda.');
      return;
    }
    const width = Math.max(...topics.map((topic) => topic.topic.length));
    for (const topic of topics) {
      console.log(
        `${topic.topic.padEnd(width)}  ${formatDuration(topic.minutes).padEnd(9)} (${topic.sessions}x)`,
      );
    }
  });

program
  .command('remove')
  .description('Remove uma sessão pelo id.')
  .argument('<id>', 'id da sessão')
  .action((rawId: string) => {
    const id = Number.parseInt(rawId, 10);
    if (!Number.isInteger(id) || id <= 0) {
      throw new Error(`ID inválido: "${rawId}". Use um inteiro positivo.`);
    }

    const sessions = loadSessions();
    const result = removeSession(sessions, id);
    if (result.removed === undefined) {
      throw new Error(`Sessão #${id} não encontrada.`);
    }

    saveSessions(result.sessions);
    console.log(`✔ Sessão #${id} removida.`);
  });

program
  .command('where')
  .description('Mostra onde o arquivo de dados está guardado.')
  .action(() => console.log(defaultPath()));

try {
  program.parse();
} catch (error) {
  console.error(formatError(error));
  process.exitCode = 1;
}