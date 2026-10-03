/**
 * Tipos de domínio do devlog.
 */

/** Uma sessão de estudo registrada. */
export interface StudySession {
  /** Identificador único, incremental. */
  id: number;
  /** Assunto estudado, já normalizado. */
  topic: string;
  /** Duração em minutos (sempre positivo). */
  minutes: number;
  /** Data no formato ISO curto `YYYY-MM-DD`. */
  date: string;
  /** Anotação opcional em texto livre. */
  note?: string;
  /** Momento de criação, em ISO completo. */
  createdAt: string;
}

/** Conteúdo do arquivo JSON de persistência. */
export interface DevlogFile {
  version: 1;
  sessions: StudySession[];
}

/** Estatísticas agregadas de um conjunto de sessões. */
export interface Stats {
  /** Total de sessões registradas. */
  totalSessions: number;
  /** Total de minutos estudados. */
  totalMinutes: number;
  /** Média de minutos por sessão (0 quando não há sessões). */
  averageMinutes: number;
  /** Quantidade de dias distintos com pelo menos uma sessão. */
  activeDays: number;
  /** Sequência atual de dias consecutivos, contada a partir de hoje ou ontem. */
  currentStreak: number;
  /** Maior sequência de dias consecutivos já registrada. */
  longestStreak: number;
  /** Minutos por assunto, do maior para o menor. */
  byTopic: TopicStat[];
}

/** Minutos e sessões de um assunto. */
export interface TopicStat {
  topic: string;
  minutes: number;
  sessions: number;
}

/** Minutos por dia, do mais recente para o mais antigo. */
export interface DailyStat {
  date: string;
  minutes: number;
  sessions: number;
}