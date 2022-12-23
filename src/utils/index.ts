import type { Database, QueryExecResult } from 'sql.js';

const JSON_START = /^\[|^\{(?!\{)/;
const JSON_ENDS = {
	'[': /]$/,
	'{': /}$/
};
export const OAUTH2_LINK = "https://discord.com/oauth2/authorize?client_id=891163758351745044&redirect_uri=http%3A%2F%2Flocalhost%3A5173%2F&response_type=token&scope=identify"

export const ALLOWED_USERS = ['792645340632317992', '537958224922542084']

export function isJsonLike(str: string): boolean {
	const jsonStart = str.match(JSON_START);
	return (jsonStart && JSON_ENDS[jsonStart[0] as keyof typeof JSON_ENDS].test(str)) ?? false;
}

export function extractTables(database: Database) {
	const data = database.exec('SELECT name FROM sqlite_master WHERE type = "table"');

	if (!data.length) return [];

	return data[0].values.flat() as string[];
}

export function formatDatabaseQueryResult(data: QueryExecResult | null): object[] {
	if (!data) return [];
	const { columns, values } = data;

	return values.map((value) => {
		return columns.reduce((accumulator, element, index) => {
			return { ...accumulator, [element]: value[index] };
		}, {});
	});
}