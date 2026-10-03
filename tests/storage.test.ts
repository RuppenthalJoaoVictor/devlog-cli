import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import {
  createSession,
  filterSessions,
  loadSessions,
  removeSession,
  saveSessions,
} from '../src/storage.js';
import type { StudySession } from '../src/types.js';

let dir: string;
let path: string;

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), 'devlog-test-'));
  path = join(dir, 'sessions.json');
});

afterEach(() => {
  rmSync(dir, { recursive: true, force: true });
});

describe('loadSessions', () => {
  it('devolve lista vazia quando o arquivo não existe', () => {
    expect(loadSessions(path)).toEqual([]);
  });

  it('devolve lista vazia quando o arquivo está em branco', () => {
    saveSessions([], path);
    expect(loadSessions(path)).toEqual([]);
  });

  it('faz round-trip de uma sessão', () => {
    const sessions: StudySession[] = [
      { id: 1, topic: 'Python', minutes: 45, date: '2026-01-05', createdAt: '2026-01-05T10:00:00.000Z' },
    ];
    saveSessions(sessions, path);
    expect(loadSessions(path)).toEqual(sessions);
  });

  it('lança erro claro com JSON malformado em vez de apagar o histórico', () => {
    writeFileSync(path, '{ nao é json', 'utf-8');
    expect(() => loadSessions(path)).toThrow(/inválido/i);
  });

  it('recusa payload com esquema inválido', () => {
    writeFileSync(path, JSON.stringify({ version: 1, sessions: [{ id: 'x' }] }), 'utf-8');
    expect(() => loadSessions(path)).toThrow(/inválido/i);
  });

  it('não deixa arquivo temporário para trás', () => {
    saveSessions([], path);
    expect(existsSync(`${path}.tmp`)).toBe(false);
  });
});

describe('createSession', () => {
  it('gera id incremental a partir das existentes', () => {
    const existing: StudySession[] = [
      { id: 3, topic: 'A', minutes: 10, date: '2026-01-01', createdAt: 'x' },
    ];
    const created = createSession(existing, { topic: 'B', minutes: 20, date: '2026-01-02' });
    expect(created.id).toBe(4);
  });

  it('começa em 1 quando não há sessões', () => {
    expect(createSession([], { topic: 'A', minutes: 10, date: '2026-01-02' }).id).toBe(1);
  });

  it('omite a nota quando ela é vazia', () => {
    const created = createSession([], { topic: 'A', minutes: 10, date: '2026-01-02', note: '' });
    expect(created.note).toBeUndefined();
  });

  it('mantém a nota quando ela existe', () => {
    const created = createSession([], {
      topic: 'A',
      minutes: 10,
      date: '2026-01-02',
      note: 'revisando async',
    });
    expect(created.note).toBe('revisando async');
  });
});

describe('removeSession', () => {
  const sessions: StudySession[] = [
    { id: 1, topic: 'A', minutes: 10, date: '2026-01-01', createdAt: 'x' },
    { id: 2, topic: 'B', minutes: 20, date: '2026-01-02', createdAt: 'x' },
  ];

  it('remove a sessão pelo id e devolve o resto', () => {
    const result = removeSession(sessions, 1);
    expect(result.removed?.id).toBe(1);
    expect(result.sessions).toHaveLength(1);
    expect(result.sessions[0]?.id).toBe(2);
  });

  it('devolve undefined quando o id não existe', () => {
    const result = removeSession(sessions, 99);
    expect(result.removed).toBeUndefined();
    expect(result.sessions).toHaveLength(2);
  });

  it('não altera o array original', () => {
    removeSession(sessions, 1);
    expect(sessions).toHaveLength(2);
  });
});

describe('filterSessions', () => {
  const sessions: StudySession[] = [
    { id: 1, topic: 'Python', minutes: 10, date: '2026-01-01', createdAt: 'x' },
    { id: 2, topic: 'TypeScript', minutes: 20, date: '2026-01-05', createdAt: 'x' },
    { id: 3, topic: 'python', minutes: 30, date: '2026-01-10', createdAt: 'x' },
  ];

  it('filtra por assunto ignorando maiúsculas', () => {
    const result = filterSessions(sessions, { topic: 'PYTHON' });
    expect(result.map((s) => s.id)).toEqual([1, 3]);
  });

  it('filtra por intervalo de datas inclusivo', () => {
    const result = filterSessions(sessions, { from: '2026-01-01', to: '2026-01-05' });
    expect(result.map((s) => s.id)).toEqual([1, 2]);
  });

  it('combina filtros de assunto e data', () => {
    const result = filterSessions(sessions, { topic: 'python', from: '2026-01-05' });
    expect(result.map((s) => s.id)).toEqual([3]);
  });

  it('devolve tudo quando nenhum filtro é informado', () => {
    expect(filterSessions(sessions, {})).toHaveLength(3);
  });
});

describe('persistência', () => {
  it('sobrevive a um ciclo de escrita e leitura', () => {
    let sessions = loadSessions(path);
    sessions = [...sessions, createSession(sessions, { topic: 'Go', minutes: 90, date: '2026-02-01' })];
    saveSessions(sessions, path);

    const raw = JSON.parse(readFileSync(path, 'utf-8')) as { version: number };
    expect(raw.version).toBe(1);
    expect(loadSessions(path)[0]?.topic).toBe('Go');
  });

  it('cria diretórios ausentes automaticamente', () => {
    const nested = join(dir, 'a', 'b', 'sessions.json');
    saveSessions([], nested);
    expect(existsSync(nested)).toBe(true);
  });
});