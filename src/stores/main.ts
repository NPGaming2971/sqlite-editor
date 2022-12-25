import { execute } from '@/utils/communicator';
import { defineStore } from 'pinia';
import { applyFindCount, applyOffset, ast, MAX_ENTRIES_PER_PAGE, STATIC_QUERY, tableName } from '@/utils';
import type { Parser, Select } from 'node-sql-parser';
import type { TableColumnPragma } from '@/utils/typings';

//@ts-expect-error
const parser = new window.NodeSQLParser.Parser() as Parser;

export const useMainStore = defineStore('main', {
	state: () => ({
		queryString: '',
		meta: {
			tables: new Map<string, TableColumnPragma[]>(),
			table: null as string | null
		},
		status: 0,
		ready: false,
		session: {
			location: [] as number[],
			content: '',
			data: [] as any[],
			index: 0,
			maxIndex: 0,
			error: null as Error | null,
			isJsonCell: false,
			row: null as any
		},
		views: {
			inDarkMode: false
		},
		auth: {
			token: null as string | null
		}
	}),
	getters: {
		tableName: (i) => tableName(parser, i.queryString),
		currentTable: ({ meta, queryString }) => meta.tables.get(tableName(parser, queryString)!),
		ast: ({ queryString }) => ast(parser, queryString)
	},
	actions: {
		async loadTables() {
			const tables: string[] = (await execute(STATIC_QUERY.TABLES)).map((i: any) => i.name);
			const info = await execute(tables.map((i) => `PRAGMA table_info(${i})`));

			tables.forEach((e, i0) => this.meta.tables.set(e, info[i0]));
		},
		async prepare() {
			try {
				await this.loadTables();

				this.ready = true;
				this.setStatus(2);
			} catch (err) {
				console.error(err);
				this.setStatus(3);
			}
		},
		async exec(sql?: string, { dry = false, resetIndex = false } = {}) {
			if (!this.ready || this.status === 4) throw new Error('App unavailable.');

			try {
				this.setStatus(4);

				const ast = this.ast;
				if (resetIndex) this.session.index = 0;

				if (ast) {
					//@ts-ignore
					const func = this['handle' + ast.type.charAt(0).toUpperCase() + ast.type.slice(1)];
					if (func) await func(ast);
				}

				let query = sql ?? this.queryString;

				const data = await execute(query);
				const formatted = data.map((i: any) =>
					Object.freeze(Object.assign(i, !this.tableName ? { $sqlite_editor_readonly: true } : {}))
				);

				if (!dry) {
					this.$patch({
						session: {
							data: formatted
						},
						status: 2
					});

					localStorage.setItem('last_query', query);
				}

				console.log(query);

				return formatted;
			} catch (err: any) {
				console.log(err);
				this.$patch({ session: { error: err } });
				this.setStatus(1);
			}
		},
		setStatus(n: number) {
			this.$patch({ status: n });
		},
		async handleSelect(ast: Select) {
			const data = await execute(applyFindCount(parser, ast));
			const maxPage = Math.trunc(data[0]['COUNT(*)'] / MAX_ENTRIES_PER_PAGE);
			this.session.maxIndex = maxPage - 1;

			this.$patch({ queryString: applyOffset(parser, ast, this.session.index) });
		},
		async handleAlter() {
			await this.loadTables();
		},
		async handleCreate() {
			await this.loadTables();
		},
		async handleDrop() {
			await this.loadTables();
		}
	}
});
