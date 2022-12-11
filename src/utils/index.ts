import type { Database, QueryExecResult } from "sql.js";

const JSON_START = /^\[|^\{(?!\{)/;
const JSON_ENDS = {
  "[": /]$/,
  "{": /}$/,
};

export function isJsonLike(str: string): boolean {
  const jsonStart = str.match(JSON_START);
  return (
    (jsonStart &&
      JSON_ENDS[jsonStart[0] as keyof typeof JSON_ENDS].test(str)) ??
    false
  );
}

export function extractTables(database: Database) {
  const data = database.exec(
    'SELECT name FROM sqlite_master WHERE type = "table"'
  );

  if (!data.length) return [];

  return data[0].values.flat() as string[];
}

export function formatDatabaseQueryResult(
  data: QueryExecResult | null
): object[] {
  if (!data) return [];
  const { columns, values } = data;

  return values.map((value) => {
    return columns.reduce((accumulator, element, index) => {
      return { ...accumulator, [element]: value[index] };
    }, {});
  });
}