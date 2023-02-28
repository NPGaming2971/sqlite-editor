import type { AST, Parser, Select } from 'node-sql-parser';

const JSON_START = /^\[|^\{(?!\{)/;
const JSON_ENDS = {
	'[': /]$/,
	'{': /}$/
};
export const OAUTH2_LINK =
	'https://discord.com/oauth2/authorize?client_id=891163758351745044&redirect_uri=http%3A%2F%2Flocalhost%3A5173%2F&response_type=token&scope=identify';

export const ALLOWED_USERS = ['792645340632317992', '537958224922542084'];
export const MAX_ENTRIES_PER_PAGE = 50;

export const STATIC_QUERY = {
	TABLES: "SELECT name, type FROM sqlite_master WHERE type = 'table'"
};

export function isJsonLike(str: string): boolean {
	const jsonStart = str.match(JSON_START);
	return (jsonStart && JSON_ENDS[jsonStart[0] as keyof typeof JSON_ENDS].test(str)) ?? false;
}

export function ast(parser: Parser, sql: string) {
	try {
		return parser.astify(sql) as AST;
	} catch (err) {
		return null;
	}
}

export function parseData(data: object) {
	if (typeof data !== 'object') throw new TypeError('Invalid parameter type.');
	const iterable = Object.entries(data);
	//Check if given parameter is iterable.
	if (typeof iterable[Symbol.iterator] !== 'function') throw new Error('Parameter is uniterable.');

	const resolved: any = {};
	for (const [key, val] of iterable) {
		Object.assign(resolved, {
			[key]: tryParseJSONObject(val)
		});
	}

	return resolved;
}

export function tryParseJSONObject(jsonString: string) {
	if (/^\d+$/.test(jsonString) && !Number.isSafeInteger(jsonString)) return jsonString;

	try {
		const func = new Function(`return ${jsonString}`)();
		return func;
	} catch {
		return jsonString;
	}
}

export function locateCell(table: HTMLTableElement, location: number[]): HTMLTableCellElement | null {
	//@ts-ignore
	return table.tBodies!.item(0)?.rows.item(location[0])?.children.item(location[1]);
}

export function locateHead(table: HTMLTableElement, index: number): HTMLTableCellElement | null {
	//@ts-ignore
	return table.tHead?.children.item(0)?.cells.item(index);
}
export function applyPrimaryKey(parser: Parser, ast: Select, primaryKey?: string) {
	if (Array.isArray(ast.columns)) {
		ast.columns.push({
			expr: {
				type: 'column_ref',
				table: null,
				column: primaryKey ?? 'rowid'
			},
			as: '$primaryKey'
		});
	}
	return parser.sqlify(Object.assign({}, ast, {}));
}

export function applyOffset(parser: Parser, ast: Select, currentIndex: number) {
	return parser.sqlify(
		Object.assign({}, ast, {
			limit: {
				seperator: 'offset',
				value: [
					{
						type: 'number',
						value: MAX_ENTRIES_PER_PAGE
					},
					{
						type: 'number',
						value: MAX_ENTRIES_PER_PAGE * currentIndex
					}
				]
			}
		})
	);
}

export function applyFindCount(parser: Parser, ast: Select) {
	return parser.sqlify(
		Object.assign({}, ast, {
			columns: [
				{
					expr: {
						type: 'aggr_func',
						name: 'COUNT',
						args: { expr: { type: 'star', value: '*' } },
						over: null
					},
					as: null
				}
			],
			limit: null
		})
	);
}

export function tableName(parser: Parser, sql: string) {
	try {
		return parser.tableList(sql).at(0)!.split('::').at(2)!;
	} catch (err) {
		return null;
	}
}
