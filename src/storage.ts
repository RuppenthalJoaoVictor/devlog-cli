/**
 * Persistência em arquivo JSON.
 *
 * Escolha deliberada: um único arquivo legível e versionável, sem dependência
 * nativa de banco. Para um CLI pessoal isso é mais simples de depurar, e o
 * formato permite migrar para SQLite depois sem mudar a camada de domínio.
 */

import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { homedir } from 'node:os';
import { z } from 'zod';

import type { DevlogFile, StudySession } from './types.js';
import { today } from './dates.js';

const studySessionSchema = z.object({
  id: z.number().int().positive(),
  topic: z.string().min(1).max(80),
  minutes: z.number().int().positive(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  note: z.string().max(500).optional(),
  createdAt: z.string().min(1),
});

const devlogFileSchema = z.object({
  version: z.literal(1),
  sessions: z.array(studySessionSchema),
});

/** Caminho padrão do arquivo de dados. */
export function defaultPath(): string {
  const override = process.env['DEVLOG_PATH'];
  if (override) {
    return resolve(override);
  }
  return resolve(homedir(), '.devlog', 'sessions.json');
}

/**
 * Lê as sessões do disco.
 *
 * Arquivo inexistente devolve lista vazia; arquivo corrompido ou com formato
 * inesperado lança um erro explícito em vez de apagar silenciosamente o
 * histórico do usuário.
 */
export function loadSessions(path: string = defaultPath()): StudySession[] {
  if (!existsSync(path)) {
    return [];
  }

  const raw = readFileSync(path, 'utf-8').trim();
  if (raw === '') {
    return [];
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error(`Arquivo de dados inválido (JSON malformado): ${path}`);
  }

  const result = devlogFileSchema.safeParse(parsed);
  if (!result.success) {
    throw new Error(`Arquivo de dados inválido em ${path}: ${result.error.message}`);
  }

  return result.data.sessions;
}

/**
 * Grava as sessões de forma atômica: escreve em arquivo temporário e renomeia,
 * para que uma falha no meio da escrita não corrompa o histórico.
 */
export function saveSessions(
  sessions: StudySession[],
  path: string = defaultPath(),
): void {
  const payload: DevlogFile = { version: 1, sessions };
  mkdirSync(dirname(path), { recursive: true });

  const temporary = `${path}.tmp`;
  writeFileSync(temporary, `${JSON.stringify(payload, null, 2)}\n`, 'utf-8');
  renameSync(temporary, path);
}

/** Cria uma sessão com id incremental a partir das sessões existentes. */
export function createSession(
  sessions: StudySession[],
  input: { topic: string; minutes: number; date?: string; note?: string },
): StudySession {
  const nextId = sessions.reduce((max, session) => Math.max(max, session.id), 0) + 1;

  const session: StudySession = {
    id: nextId,
    topic: input.topic,
    minutes: input.minutes,
    date: input.date ?? today(),
    createdAt: new Date().toISOString(),
  };

  if (input.note !== undefined && input.note !== '') {
    session.note = input.note;
  }

  return session;
}

/** Remove uma sessão pelo id, devolvendo a lista atualizada e a removida. */
export function removeSession(
  sessions: StudySession[],
  id: number,
): { sessions: StudySession[]; removed: StudySession | undefined } {
  const removed = sessions.find((session) => session.id === id);
  return {
    sessions: sessions.filter((session) => session.id !== id),
    removed,
  };
}

/** Filtra sessões por período e/ou assunto. */
export function filterSessions(
  sessions: StudySession[],
  filters: { topic?: string; from?: string; to?: string },
): StudySession[] {
  return sessions.filter((session) => {
    if (filters.topic && session.topic.toLowerCase() !== filters.topic.toLowerCase()) {
      return false;
    }
    if (filters.from && session.date < filters.from) {
      return false;
    }
    if (filters.to && session.date > filters.to) {
      return false;
    }
    return true;
  });
}