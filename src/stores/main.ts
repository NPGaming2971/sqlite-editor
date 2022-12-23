import { defineStore } from 'pinia';
import initSqlJs, { type Database } from 'sql.js';
import { extractTables, formatDatabaseQueryResult } from '@/utils';
import chunk from 'lodash.chunk';
import type { Parser, AST } from 'node-sql-parser';
const SQL = await initSqlJs({
	locateFile: (url) => `https://sql.js.org/dist/${url}`
});

//@ts-ignore
const parser = new window.NodeSQLParser.Parser() as Parser;

export const useMainStore = defineStore('main', {
	state: () => ({
		queryString: '',
		//@ts-expect-error
		database: null as Database,
		tables: [] as string[],
		status: 0,
		session: {
			token: null as string | null,
			location: [] as number[],
			content: '',
			data: [] as any[],
			index: 0,
			isJsonCell: false,
			inDarkMode: false,
			error: null as Error | null
		}
	}),
	getters: {
		ast: (i) => {
			try {
				return parser.astify(i.queryString) as AST;
			} catch {
				return null;
			}
		},
		data: (i) => i.session.data.at(i.session.index) ?? [],
		tableName: (i) => {
			try {
				return parser.tableList(i.queryString).at(0)!.split('::').at(2);
			} catch {
				return '';
			}
		}
	},
	actions: {
		formatQuery(i: string) {
			return i.trim().toLowerCase();
		},
		table(i: boolean = true): any {
			return this.exec(`PRAGMA table_info(${this.tableName})`, i);
		},
		async setup() {
			try {
				const buffer = await fetch(`http://wamvn.net:1120/database?secret=123`, {
					headers: {
						'Access-Control-Allow-Origin': '*'
					}
				}).then((i) => i.arrayBuffer());
				this.database = new SQL.Database(new Uint8Array(buffer));
				this.$patch({ tables: extractTables(this.database), status: 2 });
			} catch {
				this.setStatus(3);
			}
		},

		exec(sql?: string, dry: boolean = false) {
			if (!this.database) throw new Error('Database unavailable.');
			try {
				let query = sql ?? this.queryString;

				const ast = this.ast;
				if (ast?.type === 'create') {
					if (ast?.keyword === 'table') this.tables = extractTables(this.database);
				}

				const data = this.database.exec(query);
				const formatted = formatDatabaseQueryResult(data[0]).map((i) =>
					Object.freeze(Object.assign(i, !this.tableName ? { $sqlite_editor_readonly: true } : {}))
				);
				if (!dry) {
					this.$patch({
						session: {
							data: chunk(formatted, 50) as any,
							index: 0
						},
						status: 2
					});

					localStorage.setItem('last_query', query);
				}

				return formatted;
			} catch (err: any) {
				console.log(err);
				this.$patch({ session: { error: err } });
				this.setStatus(1);
			}
		},

		setStatus(n: number) {
			this.$patch({ status: n });
		}
	}
});
