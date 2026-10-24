import { SCHEMA } from "./schema";

export type Row = Record<string, unknown>;

export interface Sql {
  query<T = Row>(text: string, params?: unknown[]): Promise<T[]>;
  exec(text: string): Promise<void>;
  transaction<T>(fn: (tx: Sql) => Promise<T>): Promise<T>;
}

type Queryable = {
  query: (text: string, params?: unknown[]) => Promise<{ rows: Row[] }>;
  exec: (text: string) => Promise<unknown>;
  transaction: <T>(fn: (tx: Queryable) => Promise<T>) => Promise<T>;
};

type PostgresLike = {
  unsafe: (text: string, params?: unknown[]) => Promise<Row[]>;
  begin: <T>(fn: (tx: PostgresLike) => Promise<T>) => Promise<T>;
};

export async function applySchema(db: Sql): Promise<void> {
  for (const statement of SCHEMA) await db.exec(statement);
}

export function wrapPglite(client: Queryable): Sql {
  let queue: Promise<unknown> = Promise.resolve();
  const enqueue = <T>(fn: () => Promise<T>): Promise<T> => {
    const run = queue.then(fn, fn);
    queue = run.then(
      () => undefined,
      () => undefined,
    );
    return run;
  };

  const bind = (queryable: Queryable): Sql => ({
    query: async <T>(text: string, params: unknown[] = []) => {
      const result = await queryable.query(text, params);
      return result.rows as T[];
    },
    exec: async (text) => {
      await queryable.exec(text);
    },
    transaction: (fn) => queryable.transaction(async (tx) => fn(bind(tx as Queryable))),
  });

  const root = bind(client);
  return {
    query: (text, params) => enqueue(() => root.query(text, params)),
    exec: (text) => enqueue(() => root.exec(text)),
    transaction: (fn) => enqueue(() => root.transaction(fn)),
  };
}

export function wrapPostgres(client: PostgresLike): Sql {
  const bind = (current: PostgresLike): Sql => ({
    query: async <T>(text: string, params: unknown[] = []) => current.unsafe(text, params) as Promise<T[]>,
    exec: async (text) => {
      await current.unsafe(text);
    },
    transaction: (fn) => current.begin(async (tx) => fn(bind(tx))),
  });
  return bind(client);
}

export function num(value: unknown): number {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function str(value: unknown): string {
  return value == null ? "" : String(value);
}

export function intOrNull(value: unknown): number | null {
  if (value == null || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.round(parsed) : null;
}
