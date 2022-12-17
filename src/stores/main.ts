import { defineStore } from 'pinia';
import initSqlJs, { type Database } from 'sql.js';
import { extractTables, formatDatabaseQueryResult } from '@/utils';
import chunk from 'lodash.chunk';
const SQL = await initSqlJs({
	locateFile: (url) => `https://sql.js.org/dist/${url}`
});

export const useMainStore = defineStore('main', {
	state: () => ({
		queryString: '',
		//@ts-expect-error
		database: null as Database,
		tables: [] as string[],
		status: 0,
		session: {
			location: [] as number[],
			content: '',
			data: [] as any[],
			index: 0
		}
	}),
	getters: {
		tableName: (i) => i.queryString.match(/(?<=from|join)\s+(\w+)/gi)?.at(0),
		data: (i) => i.session.data.at(i.session.index) ?? []
	},
	actions: {
		table(): any {
			return this.exec(`PRAGMA table_info(${this.tableName})`, true);
		},
		async setup() {
			try {
				const buffer = await fetch(
					`https://cdn.discordapp.com/attachments/811037489430528041/1053668783551692862/data.sqlite`
				).then((i) => i.arrayBuffer());
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
				const data = this.database.exec(query);

				const formatted = formatDatabaseQueryResult(data[0]);

				if (!dry) {
					this.setStatus(2);
					this.$patch({
						session: {
							data: chunk(formatted, 50) as any,
							index: 0
						}
					});

					localStorage.setItem('last_query', query);
				}

				return formatted;
			} catch (err) {
				console.log(err);
				this.setStatus(1);
			}
		},

		setStatus(n: number) {
			this.$patch({ status: n });
		}
	}
});
